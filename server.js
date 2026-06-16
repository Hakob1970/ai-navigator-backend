if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const autoMechanicRoute = require("./routes/autoMechanic");
const premiumRouter = require("./routes/premium");
const polarRouter = require("./polar");

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


async function sendTelegramAlert(message) {
  try {
    const token = process.env.TELEGRAM_SECURITY_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram not configured");
      return;
    }

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    });

  } catch (err) {
    console.error("Telegram alert error:", err.message);
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

      // 🔐 VERIFY SIGNATURE (ВАЖНО)
      const isValid = verifyPolarSignature(
        rawBody,
        signature,
        process.env.POLAR_WEBHOOK_SECRET
      );

      if (!isValid) {
  console.log("🚨 INVALID POLAR WEBHOOK SIGNATURE");

  await sendTelegramAlert(
    `🚨 <b>SECURITY ALERT</b>\n` +
    `Invalid webhook signature\n` +
    `IP: ${req.ip}\n` +
    `Time: ${new Date().toISOString()}`
  );

  return res.status(401).json({ error: "Invalid signature" });
}

      // =========================
      // PARSE BODY
      // =========================
      const body = JSON.parse(rawBody.toString());

      const eventType = body?.eventType || body?.type;

      console.log("EVENT:", eventType);

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

    if (!email) {
  console.log("❌ No email from Polar");

  await sendTelegramAlert(
    `⚠️ <b>WEBHOOK WARNING</b>\n` +
    `Missing email from Polar\n` +
    `Event: ${eventType}\n` +
    `Time: ${new Date().toISOString()}`
  );

  return res.json({ received: true });
}

      // =========================
      // ONLY SUBSCRIPTION EVENTS
      // =========================
      const allowedEvents = [
        "subscription.created",
        "subscription.active",
        "subscription.updated"
      ];

      if (!allowedEvents.includes(eventType)) {
        return res.json({ received: true });
      }

      // =========================
      // SUBSCRIPTION ID
      // =========================
      const subscriptionId = String(
        data?.id || data?.subscription_id || ""
      );

      if (!subscriptionId) {
        return res.json({ received: true });
      }

      // =========================
      // DUPLICATE CHECK
      // =========================
      const exists = await pool.query(
        `SELECT 1 FROM payments WHERE session_id = $1`,
        [subscriptionId]
      );

     if (exists.rowCount > 0) {

  await sendTelegramAlert(
    `🔁 <b>DUPLICATE WEBHOOK</b>\n` +
    `User: ${email}\n` +
    `Subscription: ${subscriptionId}`
  );

  return res.json({ received: true });
}

      // =========================
      // DURATION
      // =========================
      const durationDays = 30;
      const durationMs = durationDays * 24 * 60 * 60 * 1000;

      const now = Date.now();

      const sub = await pool.query(
        `SELECT premium_until FROM subscriptions WHERE user_id = $1`,
        [email]
      );

      const current = Number(sub.rows[0]?.premium_until || 0);
      const base = Math.max(now, current);

      let premiumUntil = base + durationMs;

      const MAX_YEAR = 365 * 24 * 60 * 60 * 1000;
      const maxAllowed = now + MAX_YEAR;

      if (premiumUntil > maxAllowed) {
        premiumUntil = maxAllowed;
      }

      // =========================
      // SAVE SUBSCRIPTION
      // =========================
      await pool.query(
        `
        INSERT INTO subscriptions (user_id, premium_until)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET premium_until = EXCLUDED.premium_until
        `,
        [email, premiumUntil]
      );

      // =========================
      // SAVE PAYMENT LOG
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
          provider,
          payment_status,
          amount,
          duration_days,
          premium_until
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          email,
          subscriptionId,
          "polar",
          "active",
          amount,
          durationDays,
          premiumUntil
        ]
      );

      console.log("💰 PREMIUM ACTIVATED:", email);

      const token = jwt.sign(
  {
    email: email,
    deviceId: "auto",
    premium: true
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

await sendTelegramAlert(
  `💰 <b>PAYMENT SUCCESS</b>\n` +
  `User: ${email}\n` +
  `Plan: Polar subscription\n` +
  `Until: ${new Date(premiumUntil).toISOString()}\n\n` +
  `🔐 JWT TEST:\n${token}`
);

      return res.json({ success: true });

    } catch (err) {
      console.error("❌ POLAR WEBHOOK ERROR:", err);
      return res.status(200).json({ received: true });
    }
  }
);


// =========================
// GLOBAL MIDDLEWARE
// =========================
app.use(cors({
  origin: [
    "https://ai-navigator-frontend.vercel.app",
    "http://localhost:5500"
  ]
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

// =========================
// ROUTES
// =========================
app.use("/api/polar", polarRouter);
app.use("/api", premiumRouter);
app.use("/api/auto-mechanic", autoMechanicRoute);

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
// JWT DEBUG
// =========================
app.get("/api/debug-jwt", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.json({ ok: false, error: "NO_TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      ok: true,
      decoded
    });

  } catch (e) {
    return res.json({
      ok: false,
      error: e.message
    });
  }
});

// =========================
// STATIC FILES
// =========================
app.use(express.static(path.join(__dirname, "public")));



async function isPremium(email) {

    email = decodeURIComponent(email || "")
    .trim()
    .toLowerCase();

  if (!email) return false;

  const result = await pool.query(
    `
    SELECT premium_until
    FROM subscriptions
    WHERE user_id = $1
    `,
    [email]
  );

  const row = result.rows[0];

  if (!row || row.premium_until == null) {
    return false;
  }

  const end = Number(row.premium_until);

  console.log("PREMIUM RAW:", row.premium_until);
  console.log("PREMIUM END:", end);

  if (!end || isNaN(end)) {
    return false;
  }

  return end > Date.now();
}

//---------------------------
// PREMIUM CHECK (HARDENED)
//--------------------------
app.get("/api/premium/check", apiLimiter, authMiddleware, async (req, res) => {
  try {

    const email = req.user?.email;
    const deviceId = req.headers["x-device-id"];

    // =========================
    // AUTH CHECK
    // =========================
    if (!email) {
      return res.status(401).json({
        premium: false,
        warning: "UNAUTHORIZED"
      });
    }

    if (!deviceId) {
      return res.json({
        premium: false,
        warning: "NO_DEVICE"
      });
    }

    // =========================
    // DEVICE CHECK
    // =========================
    const deviceCheck = await pool.query(
      `SELECT 1 FROM user_devices WHERE email=$1 AND device_id=$2`,
      [email, deviceId]
    );

    if (deviceCheck.rowCount === 0) {
      return res.status(403).json({
        premium: false,
        warning: "DEVICE_NOT_ALLOWED"
      });
    }

    // PREMIUM CHECK
    const result = await pool.query(
      `SELECT premium_until FROM subscriptions WHERE user_id=$1`,
      [email]
    );

    const row = result.rows[0];

    const now = Date.now();
    const end = Number(row?.premium_until || 0);

    if (!end || end <= now) {
      return res.json({
        premium: false,
        daysLeft: 0,
        warning: "EXPIRED"
      });
    }

    return res.json({
      premium: true,
      daysLeft: Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    });

  } catch (err) {
    console.error("PREMIUM ERROR:", err);

    return res.status(500).json({
      premium: false,
      warning: "SERVER_ERROR"
    });
  }
});


app.post("/api/device/check", authMiddleware, async (req, res) => {
  try {

    const email = req.user?.email;
    const deviceId = req.body.deviceId;

    if (!email) {
      return res.status(401).json({ allowed: false, error: "UNAUTHORIZED" });
    }

    if (!deviceId) {
      return res.json({ allowed: false, error: "NO_DEVICE" });
    }

    const existing = await pool.query(
      `SELECT 1 FROM user_devices WHERE email=$1 AND device_id=$2 LIMIT 1`,
      [email, deviceId]
    );

    if (existing.rowCount > 0) {
      await pool.query(
        `UPDATE user_devices SET last_seen = NOW() WHERE email=$1 AND device_id=$2`,
        [email, deviceId]
      );

      return res.json({ allowed: true });
    }

    const count = await pool.query(
      `SELECT COUNT(*) FROM user_devices WHERE email=$1`,
      [email]
    );

    if (parseInt(count.rows[0].count) >= 3) {
      return res.json({ allowed: false, error: "DEVICE_LIMIT" });
    }

    await pool.query(
      `INSERT INTO user_devices (email, device_id, last_seen)
       VALUES ($1, $2, NOW())`,
      [email, deviceId]
    );

    return res.json({ allowed: true });

  } catch (err) {
    console.error("DEVICE ERROR:", err);
    return res.status(500).json({ allowed: false, error: "DEVICE_CHECK_FAILED" });
  }
});



app.get("/api/likes", async (req, res) => {
  try {

    const count = await pool.query(`
      SELECT COUNT(*) FROM site_likes
    `);

    return res.json({
      likes: Number(count.rows[0].count)
    });

  } catch (err) {
    console.error("❌ LIKES GET ERROR:", err);
    return res.status(500).json({ likes: 0 });
  }
});


app.post("/api/likes", async (req, res) => {
  try {

    const { email, deviceId } = req.body;

    if (!email || !deviceId) {
      return res.status(400).json({
        error: "Missing data"
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // =========================
    // try insert like (only once)
    // =========================
    const result = await pool.query(
      `
      INSERT INTO site_likes (email, device_id)
      VALUES ($1, $2)
      ON CONFLICT (email, device_id) DO NOTHING
      RETURNING id
      `,
      [cleanEmail, deviceId]
    );

    // =========================
    // count total likes
    // =========================
    const count = await pool.query(`
      SELECT COUNT(*) FROM site_likes
    `);

    return res.json({
      likes: Number(count.rows[0].count),
      added: result.rowCount > 0
    });

  } catch (err) {
    console.error("❌ LIKES ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


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

    const premium = await isPremium(email);

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

    if (!email) {
      return res.json({ premium: false });
    }

    const result = await pool.query(
      `SELECT premium_until FROM subscriptions WHERE user_id=$1`,
      [email]
    );

    const row = result.rows[0];

    if (!row?.premium_until) {
      return res.json({ premium: false });
    }

    return res.json({
      premium: Number(row.premium_until) > Date.now()
    });

  } catch (err) {
    console.error("BOT PREMIUM ERROR:", err);

    return res.json({
      premium: false
    });
  }
});
// =========================
// STRIPE CHECKOUT
// =========================
app.post("/api/polar/create-checkout", async (req, res) => {
  try {
    const email = decodeURIComponent(
      String(req.body.email || "")
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    // ⚠️ пока используем static checkout link (как ты уже дал ранее)
    const url = "https://buy.polar.sh/polar_cl_KAQ2nzn15fhbw9U0W8Hxjng6mlnK6vHjRcot80Rhmo9";

    return res.json({ url });

  } catch (err) {
    console.error("POLAR ERROR:", err);
    return res.status(500).json({ error: "Polar error" });
  }
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
