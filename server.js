require("dotenv").config();

// =========================
// CORE IMPORTS
// =========================
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

// =========================
// DATABASE
// =========================
const pool = require("./db/pool");

// =========================
// ROUTES
// =========================
const autoMechanicRoute = require("./routes/autoMechanic");
const deviceRouter = require("./routes/device");
const premiumRouter = require("./routes/premium");
const polarRouter = require("./polar");
const authMiddleware = require("./middleware/auth");
const adminRouter = require("./routes/admin");
const writerRouter = require("./routes/writer");

// =========================
// APP INIT
// =========================
const app = express();

app.set("trust proxy", 1);

// =========================
// DB (POSTGRES)
// =========================

setTimeout(async () => {
  try {
    console.log("📦 DB INIT (background)");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        user_id TEXT PRIMARY KEY,
        premium_until BIGINT DEFAULT 0
      );
    `);

    await pool.query(`
  ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS module TEXT;
`);

await pool.query(`
  ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive';
`);

await pool.query(`
  ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS requests_left INTEGER DEFAULT 0;
`);

await pool.query(`
  ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS reset_at BIGINT DEFAULT 0;
`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_links (
        user_id TEXT PRIMARY KEY,
        telegram_id TEXT UNIQUE,
        linked_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id SERIAL PRIMARY KEY,
        email TEXT,
        device_id TEXT,
        last_seen TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_device_unique
      ON user_devices(email, device_id)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        session_id TEXT UNIQUE
      );
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,

    auto_mechanic_premium BOOLEAN DEFAULT FALSE,

    auto_mechanic_used INTEGER DEFAULT 0,

    auto_mechanic_reset_at BIGINT DEFAULT 0,

    suspicious_hits INTEGER DEFAULT 0
  );
`);

    await pool.query(`
      DELETE FROM user_devices
      WHERE last_seen < NOW() - INTERVAL '365 days'
    `);

    console.log("🧹 OLD DEVICES CLEANED");
    console.log("✅ DB READY");

  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
  }
}, 0);


async function sendTelegramAlert(message, email, type = "UNKNOWN") {
  try {
    const token = process.env.TELEGRAM_SECURITY_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log("📩 ALERT DATA:", { message, email, type });

    if (!token || !chatId) {
      console.log("❌ Telegram not configured");
      return;
    }

    if (!email) {
      console.log("❌ EMAIL IS UNDEFINED → buttons will NOT be created");
    }

    const SECRET = process.env.ADMIN_SECRET;

    const blockUrl =
      `https://ai-navigator-backend-mcb3.onrender.com/api/admin/block?email=${encodeURIComponent(email)}&secret=${SECRET}`;

    const ignoreUrl =
      `https://ai-navigator-backend-mcb3.onrender.com/api/admin/ignore?email=${encodeURIComponent(email)}&secret=${SECRET}`;

    const payload = {
      chat_id: chatId,
      text: `🚨 <b>SECURITY ALERT</b>\n\n👤 User: ${email || "UNKNOWN"}\n⚠️ Type: ${type}\n\n${message}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚫 BLOCK",
              url: blockUrl
            },
            {
              text: "🟢 IGNORE",
              url: ignoreUrl
            }
          ]
        ]
      }
    };

    console.log("📤 TELEGRAM PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      payload
    );

    console.log("✅ TELEGRAM RESPONSE:", response.data);

  } catch (err) {
    console.error("❌ Telegram alert error:", err.response?.data || err.message);
  }
}


function verifyPolarSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

// =========================
// polar WEBHOOK
// =========================
app.post(
  "/api/polar/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      console.log("🔥 POLAR WEBHOOK HIT");

      const signature =
        req.headers["polar-signature"] ||
        req.headers["x-polar-signature"];

      const rawBody = req.body;

      const isValid = verifyPolarSignature(
        rawBody,
        signature,
        process.env.POLAR_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error("Invalid signature");
return res.status(200).json({ received: true });
      }

      const body = JSON.parse(rawBody.toString());

      const eventType = body?.eventType || body?.type;
      const data = body?.data || body?.object || body;

      if (!data) {
        return res.status(400).json({ error: "No data" });
      }

      // =========================
      // EMAIL
      // =========================
      const email = decodeURIComponent(
        String(
          data?.customer?.email ||
          data?.email ||
          data?.metadata?.email ||
          ""
        )
      )
        .trim()
        .toLowerCase();

      if (!email) return res.json({ received: true });

// =========================
// MODULE (ROBUST FIX)
// =========================
let module =
  data?.metadata?.module ||
  data?.product_metadata?.module ||
  body?.metadata?.module ||
  "auto-mechanic"; // fallback ALWAYS SAFE

module = String(module).trim().toLowerCase();

console.log("MODULE RESOLVED:", module);

      // =========================
      // ONLY VALID EVENTS
      // =========================
      const allowedEvents = [
        "subscription.created",
        "subscription.active",
        "subscription.updated"
      ];

      if (!allowedEvents.includes(eventType)) {
        return res.json({ received: true });
      }

      const subscriptionId = String(
        data?.id || data?.subscription_id || ""
      );

      if (!subscriptionId) {
        return res.json({ received: true });
      }

      // =========================
      // DUPLICATE CHECK
      // =========================
     const eventId =
  String(body?.id ||
  body?.event_id ||
  data?.event?.id ||
  data?.id ||
  "");

      console.log("EVENT TYPE:", eventType);
console.log("EVENT ID:", eventId);

      if (!eventId) {
  console.log("❌ Missing eventId → skip");
  return res.json({ received: true });
}

      // =========================
      // PLAN LOGIC
      // =========================
      const durationDays = 30;
      const resetAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

      const PLAN_LIMITS = {
        "auto-mechanic": 20,
        "ai-book": 5,
        "ai-navigator": null
      };

      const normalizedModule = module;

const isUnlimited = PLAN_LIMITS[normalizedModule] === null;

const requests_left = isUnlimited
  ? null
  : PLAN_LIMITS[normalizedModule] ?? 20;

      // =========================
      // SAVE SUBSCRIPTION
      // =========================
await pool.query(
  `
  INSERT INTO subscriptions (
    email,
    module,
    status,
    requests_left,
    reset_at
  )
  VALUES ($1, $2, 'active', $3, $4)
  ON CONFLICT (email, module)
  DO UPDATE SET
    status = 'active',
    requests_left = CASE 
      WHEN subscriptions.reset_at < NOW() THEN EXCLUDED.requests_left
      ELSE subscriptions.requests_left
    END,
    reset_at = CASE 
      WHEN subscriptions.reset_at < NOW() THEN EXCLUDED.reset_at
      ELSE subscriptions.reset_at
    END
  `,
  [email, normalizedModule, requests_left, resetAt]
);
      // =========================
      // PAYMENT LOG
      // =========================
      const amount =
        data?.total_amount ||
        data?.amount ||
        data?.price ||
        0;
      
await pool.query(
  `
  INSERT INTO payments (
    user_id,
    session_id,
    amount,
    event_id,
    provider,
    payment_status,
    created_at
  )
  VALUES ($1, $2, $3, $4, 'polar', 'succeeded', NOW())
  ON CONFLICT (event_id) DO NOTHING
  `,
  [email, subscriptionId, amount, eventId]
);
     

      console.log("💰 SUBSCRIPTION ACTIVATED:", email, module);

      return res.json({ success: true });

    } catch (err) {
      console.error("❌ WEBHOOK ERROR:", err);
      return res.status(200).json({ received: true });
    }
  }
);
// =========================
// GLOBAL MIDDLEWARE
// =========================
app.use(cors({
  origin: [
    "https://ai-writer-studio-phi.vercel.app",
    "https://ai-navigator-frontend.vercel.app",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// =========================
// LOGGING
// =========================
app.use((req, res, next) => {
  console.log("🌐 REQUEST:", req.method, req.url);
  next();
});

// =========================
// RATE LIMITER
// =========================
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// =========================
// APPLY RATE LIMIT (per route group)
// =========================
app.use("/api/premium", apiLimiter);
app.use("/api/device", apiLimiter);
app.use("/api/auto-mechanic", apiLimiter);


const attachUser = async (req, res, next) => {
  try {
    const email = req.user?.email;

    console.log("EMAIL FROM TOKEN:", email);

    if (!email) return res.status(401).json({ error: "NO_EMAIL" });

    let result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user = result.rows[0];

    // 💥 ВАЖНО: AUTO CREATE
   if (!user) {
  const created = await pool.query(
    `INSERT INTO users(user_id, email, suspicious_hits, auto_mechanic_used, is_blocked)
     VALUES ($1, $1, 0, 0, false)
     RETURNING *`,
    [email]
  );

  user = created.rows[0];
}

    req.userDB = user;

    console.log("USER ROW:", user);

    next();

  } catch (err) {
    console.error("attachUser error:", err);
    res.status(500).json({ error: "USER_RESOLVER_ERROR" });
  }
};

// =========================
// ROUTES
// =========================
app.use("/api/polar", polarRouter);
app.use("/api/premium", premiumRouter);
app.use("/api/device", deviceRouter);
app.use("/api/auto-mechanic", authMiddleware, attachUser, autoMechanicRoute);
app.use("/api/admin", adminRouter);
app.use("/api/writer", writerRouter);

// =========================
// TEST ROUTES
// =========================
app.get("/api/test-telegram", (req, res) => {
  res.json({
    ok: true,
    message: "Backend is alive 🔥"
  });
});

// =========================
// AUTH SESSION (JWT)
// =========================
app.post("/api/auth/session", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "NO_EMAIL" });
    }

    const result = await pool.query(
      `SELECT premium_until FROM subscriptions WHERE user_id = $1`,
      [email]
    );

    const row = result.rows[0];

    const now = Date.now();
    const premiumUntil = Number(row?.premium_until || 0);

    const isPremium = premiumUntil > now;

    console.log("EMAIL:", email);

console.log("DB ROW:", row);

console.log("NOW:", now);

console.log("PREMIUM UNTIL:", premiumUntil);

console.log("IS PREMIUM:", isPremium);

    const token = jwt.sign(
      { email, premium: isPremium },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      premium: isPremium
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});


// =========================
// STATIC FILES
// =========================
app.use(express.static(path.join(__dirname, "public")));



async function isPremium(email, module) {

  email = decodeURIComponent(email || "")
    .trim()
    .toLowerCase();

  if (!email || !module) return false;

  const result = await pool.query(
    `
    SELECT premium_until
    FROM subscriptions
    WHERE user_id = $1
    AND module = $2
    AND status = 'active'
    `,
    [email, module]
  );

  const row = result.rows[0];

  if (!row || row.premium_until == null) {
    return false;
  }

  const end = Number(row.premium_until);

  console.log("PREMIUM MODULE:", module);
  console.log("PREMIUM RAW:", row.premium_until);
  console.log("PREMIUM END:", end);

  if (!end || isNaN(end)) {
    return false;
  }

  return end > Date.now();
}

// =========================
// TELEGRAM PREMIUM LINK
// =========================
app.post("/api/telegram/create-link", async (req, res) => {
  try {

  const email = decodeURIComponent(
  String(req.body.email || "")
)
  .trim()
  .toLowerCase();

    if (!email) {
      return res.status(400).json({
        allowed: false,
        error: "Missing email"
      });
    }

   const premium = await isPremium(email, "ai-navigator");

if (!premium) {
  console.log("BLOCKED USER:", email);
  return res.json({
    allowed: false,
    url: null,
    error: "NO_PREMIUM"
  });
}

    const botUsername = "hakob_ai_it_bot";

    const telegramUrl =
      `https://t.me/${botUsername}?start=${encodeURIComponent(email)}`;

    return res.json({
      allowed: true,
      url: telegramUrl
    });

  } catch (err) {
  console.error("TELEGRAM ERROR FULL:", err);
  console.error(err.stack);

  return res.status(500).json({
    allowed: false,
    error: err.message
  });
}
});


app.get("/api/bot/premium", async (req, res) => {
  try {

    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();

    const module = String(req.query.module || "ai-navigator")
      .trim()
      .toLowerCase();


    if (!email) {
      return res.json({
        premium:false
      });
    }


    const result = await pool.query(
      `
      SELECT premium_until
      FROM subscriptions
      WHERE user_id=$1
      AND module=$2
      AND status='active'
      LIMIT 1
      `,
      [
        email,
        module
      ]
    );


    const row = result.rows[0];


    return res.json({
      premium:
        !!row &&
        Number(row.premium_until) > Date.now(),

      module
    });


  } catch(err){

    console.error("BOT PREMIUM ERROR:", err);

    return res.json({
      premium:false
    });

  }
});
// =========================
// POLAR CHECKOUT
// =========================
app.post("/api/polar/create-checkout", async (req, res) => {
  console.log("🔥 SERVER.JS CREATE-CHECKOUT (PROXY)");

  try {
    const email = decodeURIComponent(
      String(req.body.email || "")
    )
      .trim()
      .toLowerCase();

    const module = String(req.body.module || "");

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    if (!module) {
      return res.status(400).json({ error: "No module" });
    }

    // 🚀 ПРОКСИМ В ЕДИНЫЙ ПРАВИЛЬНЫЙ FLOW (polar.js)
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/polar/create-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, module })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ POLAR PROXY ERROR:", data);
      return res.status(500).json({ error: "Checkout failed" });
    }

    return res.json(data);

  } catch (err) {
    console.error("POLAR ERROR:", err);
    return res.status(500).json({ error: "Polar error" });
  }
});


// =========================
// BOT / API ROUTES
// =========================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ai-navigator-backend",
    time: new Date().toISOString()
  });
});




app.post("/api/user/link-telegram", async (req, res) => {
  try {

    const email = decodeURIComponent(
  String(req.body.email || "")
)
  .trim()
  .toLowerCase();

    const telegramId = String(req.body.telegramId || "").trim();

    if (!email || !telegramId) {
      return res.status(400).json({ error: "Missing data" });
    }

    // check user exists (source of truth)
    const exists = await pool.query(
      `SELECT 1 FROM subscriptions WHERE user_id = $1`,
      [email]
    );

    if (exists.rowCount === 0) {
      return res.status(404).json({
        error: "User not found in subscriptions"
      });
    }

    // link telegram
    await pool.query(
      `
      INSERT INTO telegram_links (
        user_id,
        telegram_id
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        telegram_id = EXCLUDED.telegram_id
      `,
      [email, telegramId]
    );

    console.log("🔗 TELEGRAM LINKED:", email);

    return res.json({ success: true });

  } catch (err) {
    console.error("❌ TELEGRAM LINK ERROR:", err);

    return res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/user/get-email", async (req, res) => {

console.log("GET EMAIL telegramId:", req.query.telegramId);
  
  try {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.json({ email: null });
    }

const result = await pool.query(
  `
  SELECT user_id
  FROM telegram_links
  WHERE telegram_id = $1
  LIMIT 1
  `,
  [telegramId]
);

const email = result.rows[0]?.user_id || null;

console.log("EMAIL FOUND:", email);

res.json({ email });

  } catch (err) {
    console.error("❌ GET EMAIL ERROR:", err);
    res.json({ email: null });
  }
});

app.post("/api/user/change-email", async (req, res) => {
  const client = await pool.connect();

  try {
    const { oldEmail, newEmail } = req.body;

    if (!oldEmail || !newEmail) {
      return res.status(400).json({ error: "Missing email data" });
    }

const oldUserId = decodeURIComponent(
  String(oldEmail || "")
)
  .trim()
  .toLowerCase();

const newUserId = decodeURIComponent(
  String(newEmail || "")
)
  .trim()
  .toLowerCase();

    if (oldUserId === newUserId) {
      return res.json({ success: true, userId: newUserId });
    }

    await client.query("BEGIN");

  const existingOldUser = await client.query(
  `
  SELECT user_id
  FROM users
  WHERE user_id = $1
  LIMIT 1
  `,
  [oldUserId]
);

if (existingOldUser.rowCount === 0) {
  await client.query("ROLLBACK");
  return res.status(404).json({
    error: "Old email not found"
  });
}


    await client.query(
      `
      INSERT INTO users (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [newUserId]
    );

    await client.query(
      `
      UPDATE subscriptions
      SET user_id = $1
      WHERE user_id = $2
      `,
      [newUserId, oldUserId]
    );

    await client.query(
      `
      UPDATE telegram_links
      SET user_id = $1
      WHERE user_id = $2
      `,
      [newUserId, oldUserId]
    );

    await client.query(
      `
      UPDATE payments
      SET user_id = $1
      WHERE user_id = $2
      `,
      [newUserId, oldUserId]
    );

    await client.query("COMMIT");

    console.log("✅ EMAIL CHANGED:", oldUserId, "=>", newUserId);

    res.json({
      success: true,
      userId: newUserId
    });

  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    console.error("❌ CHANGE EMAIL ERROR:", err);

    res.status(500).json({
      error: "Server error"
    });

  } finally {
    client.release();
  }
});


// =========================
// ADMIN STATS
// =========================

app.get("/api/admin/stats", async (req, res) => {
  try {
    const key = req.headers["x-admin-key"] || req.query.key;

    if (!key || key !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await pool.query(`
      SELECT COUNT(*) FROM subscriptions
    `);

    const premium = await pool.query(
      `
      SELECT COUNT(*)
      FROM subscriptions
      WHERE premium_until > $1
      `,
      [Date.now()]
    );

    const payments = await pool.query(`
      SELECT COUNT(*) FROM payments
    `);

    return res.json({
      users: Number(users.rows[0].count),
      premium: Number(premium.rows[0].count),
      payments: Number(payments.rows[0].count)
    });

  } catch (err) {
    console.error("❌ ADMIN STATS ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// =========================
const PORT = process.env.PORT || 3000;
console.log("🔥 ABOUT TO LISTEN");
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
