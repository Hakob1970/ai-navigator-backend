console.log("🔥 CLEAN SERVER START");

require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

const app = express();

// =========================
// DB (POSTGRES)
// =========================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {

    console.log("📦 DB CONNECTING...");

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

    console.log("✅ DB READY");

  } catch (err) {

    console.error("❌ DB INIT ERROR:", err);

  }
})();
// =========================
// STRIPE WEBHOOK
// =========================
// =========================
// LEMON SQUEEZY WEBHOOK
// =========================

app.post("/api/lemon/webhook", async (req, res) => {

  try {

    const eventName = req.body.meta?.event_name;

    // only successful subscription events
    if (
      eventName !== "subscription_created" &&
      eventName !== "subscription_updated"
    ) {
      return res.json({ received: true });
    }

    const data = req.body.data?.attributes;

    if (!data) {
      return res.status(400).json({
        error: "No data"
      });
    }

    // IMPORTANT: email = user_id
    const email = String(
      data.user_email || ""
    ).trim().toLowerCase();

    if (!email) {

      console.log("❌ No email from Lemon");

      return res.json({
        received: true
      });
    }

    // unique payment/subscription id
    const paymentId = String(
      req.body.data?.id || ""
    );

    // duplicate protection
    const exists = await pool.query(
      `
      SELECT 1
      FROM payments
      WHERE session_id = $1
      `,
      [paymentId]
    );

    if (exists.rowCount > 0) {

      console.log(
        "🔁 Duplicate webhook ignored:",
        paymentId
      );

      return res.json({
        received: true
      });
    }

    // current subscription
    const sub = await pool.query(
      `
      SELECT premium_until
      FROM subscriptions
      WHERE user_id = $1
      `,
      [email]
    );

    const now = Date.now();

    const current =
      Number(sub.rows[0]?.premium_until || 0);

    // preserve remaining days
    const base =
      current > now ? current : now;

    // default plan
   const VARIANT_TO_DAYS = {
  "variant_30": 30,
  "variant_60": 60,
  "variant_120": 120,
  "variant_365": 365
};

const durationDays = VARIANT_TO_DAYS[variantId] || 30;

const durationMs = durationDays * 24 * 60 * 60 * 1000;
const premiumUntil = base + durationMs;
    

    const premiumUntil =
      base + durationMs;

    // update subscription
    await pool.query(
      `
      INSERT INTO subscriptions (
        user_id,
        premium_until
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        premium_until = EXCLUDED.premium_until
      `,
      [email, premiumUntil]
    );

    // payment log
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
        paymentId,
        "lemon",
        "paid",
        Number(data.total || 0),
        durationDays,
        premiumUntil
      ]
    );

    console.log(
      "✅ PREMIUM ACTIVATED:",
      email
    );

    return res.json({
      success: true
    });

  } catch (err) {

    console.error(
      "❌ LEMON WEBHOOK ERROR:",
      err
    );

    return res.status(500).json({
      error: "Server error"
    });
  }
});
// =========================
// NORMAL MIDDLEWARE (AFTER WEBHOOK)
// =========================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: [
    "https://ai-navigator-frontend.vercel.app",
    "http://localhost:5500"
  ]
}));

app.use((req, res, next) => {
  console.log("🌐 REQUEST:", req.method, req.url);
  next();
});


async function isPremium(email) {

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

  if (!row || !row.premium_until) return false;

  return Number(row.premium_until) > Date.now();
}

//---------------------------
 // PREMIUM CHECK
//--------------------------
app.get("/api/premium/check", async (req, res) => {

  try {

    const { email } = req.query;

    if (!email) {
      return res.json({ premium: false });
    }

    const premium = await isPremium(email);

    res.json({ premium });

  } catch (err) {

    console.error("❌ PREMIUM CHECK ERROR:", err);

    res.status(500).json({
      premium: false
    });
  }
});


app.post("/api/device/check", async (req, res) => {
  try {

    const { email, deviceId } = req.body;

    if (!email || !deviceId) {
      return res.json({
        allowed: false
      });
    }

    const premium = await isPremium(email);

if (!premium) {
  return res.json({
    allowed: false,
    error: "NO_PREMIUM"
  });
}

    // =========================
    // 1. Проверяем устройство
    // =========================
    const existing = await pool.query(
      `
      SELECT 1
      FROM user_devices
      WHERE email = $1
      AND device_id = $2
      LIMIT 1
      `,
      [email, deviceId]
    );

    if (existing.rowCount > 0) {

      await pool.query(
        `
        UPDATE user_devices
        SET last_seen = NOW()
        WHERE email = $1
        AND device_id = $2
        `,
        [email, deviceId]
      );

      return res.json({
        allowed: true
      });
    }

    // =========================
    // 2. Считаем устройства
    // =========================
    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM user_devices
      WHERE email = $1
      `,
      [email]
    );

    const count = countResult.rows[0].count;

    // =========================
    // 3. ЛИМИТ 3 УСТРОЙСТВА
    // =========================
    if (count >= 3) {
      return res.json({
        allowed: false,
        error: "DEVICE_LIMIT",
        message: "Лимит исчерпан. У вас уже 3 премиум устройства."
      });
    }

    // =========================
    // 4. ДОБАВЛЯЕМ УСТРОЙСТВО
    // =========================
    await pool.query(
      `
      INSERT INTO user_devices (
        email,
        device_id,
        last_seen
      )
      VALUES ($1, $2, NOW())
      ON CONFLICT (email, device_id)
      DO UPDATE SET last_seen = NOW()
      `,
      [email, deviceId]
    );

    return res.json({
      allowed: true
    });

  } catch (err) {

    console.error("DEVICE CHECK ERROR:", err);

    return res.status(500).json({
      allowed: false
    });
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

    const email = String(req.body.email || "")
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
      return res.json({
        allowed: false,
        redirect: "#pricing"
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
    console.error("❌ TELEGRAM CREATE LINK ERROR:", err);

    return res.status(500).json({
      allowed: false,
      error: "Server error"
    });
  }
});
// =========================
// STRIPE CHECKOUT
// =========================

app.post("/api/lemon/create-checkout", async (req, res) => {
  try {

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "No email"
      });
    }

    // =========================
    // LEMON CHECKOUT URL
    // =========================
    const productCheckoutUrl =
      process.env.LEMON_CHECKOUT_URL;

    if (!productCheckoutUrl) {
      return res.status(500).json({
        error: "Missing Lemon checkout URL"
      });
    }

    // optional: attach user identity
    const url =
      `${productCheckoutUrl}?checkout[email]=${encodeURIComponent(email)}`;

    return res.json({
      url
    });

  } catch (err) {

    console.error("❌ LEMON CHECKOUT ERROR:", err);

    return res.status(500).json({
      error: "Lemon error"
    });
  }
});


app.post("/api/user/link-telegram", async (req, res) => {
  try {

    const email = String(req.body.email || "")
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

    const oldUserId = String(oldEmail).trim().toLowerCase();
    const newUserId = String(newEmail).trim().toLowerCase();

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

  console.log("🔥 ABOUT TO LISTEN");

  if (key !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {

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
