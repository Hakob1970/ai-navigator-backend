console.log("🔥 CLEAN SERVER START");

require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const Stripe = require("stripe");
const path = require("path");
const cors = require("cors");

const app = express();

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

// =========================
// INIT
// =========================

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// =========================
// DB (POSTGRES)
// =========================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  console.log("📦 DB CONNECTING...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT PRIMARY KEY,
      premium_until BIGINT DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_codes (
      email TEXT,
      code TEXT,
      session_id TEXT,
      expires_at BIGINT,
      used INTEGER DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      session_id TEXT
    );
  `);

  // 🔥 ДОБАВЛЯЕМ user_identity ТУДА ЖЕ
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_identity (
      email TEXT PRIMARY KEY,
      telegram_id TEXT,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    );
  `);

  console.log("✅ DB READY");
})();

// =========================
// HELPERS
// =========================

async function getUserEmailByTelegram(telegramId) {
  const result = await pool.query(
    `SELECT email FROM user_identity WHERE telegram_id = $1`,
    [telegramId]
  );

  return result.rows[0]?.email;
}

// =========================
// STRIPE WEBHOOK
// =========================
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      return res.status(400).send();
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // 🔥 SAFE USER ID
      const userId = session.metadata?.userId;

      if (!userId) {
        console.log("⚠️ Missing userId in Stripe metadata");
        return res.json({ received: true });
      }

      const premiumUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;

      try {
        // 🔒 защита от повторной записи платежа
        const exists = await pool.query(
          `SELECT 1 FROM payments WHERE session_id = $1`,
          [session.id]
        );

        if (exists.rowCount === 0) {
          await pool.query(
            `INSERT INTO subscriptions (user_id, premium_until)
             VALUES ($1, $2)
             ON CONFLICT (user_id)
             DO UPDATE SET premium_until = EXCLUDED.premium_until`,
            [userId, premiumUntil]
          );

          await pool.query(
            `INSERT INTO payments (user_id, session_id)
             VALUES ($1, $2)`,
            [userId, session.id]
          );

          console.log("💳 PREMIUM ACTIVATED:", userId);
        } else {
          console.log("🔁 Duplicate webhook ignored:", session.id);
        }
      } catch (dbErr) {
        console.error("❌ DB error in webhook:", dbErr.message);
      }
    }

    res.json({ received: true });
  }
);

// =========================
// JSON middleware
// =========================

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.static(path.join(__dirname, "public")));

// =========================
// AUTH SEND CODE
// =========================

app.post("/api/auth/send-code", async (req, res) => {

  const { email, sessionId } = req.body;

  if (!email || !sessionId) {
    return res.status(400).json({ error: "Missing data" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 3 * 60 * 1000;

  await pool.query(
    `INSERT INTO auth_codes (email, code, session_id, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [email, code, sessionId, expires]
  );

  console.log("🔐 DEV CODE:", email, code);

  res.json({ success: true, dev_code: code });
});

// =========================
// VERIFY
// =========================

app.post("/api/auth/verify-code", async (req, res) => {
  const { email, code, sessionId } = req.body;

  const result = await pool.query(
    `SELECT * FROM auth_codes
     WHERE email = $1 AND code = $2 AND session_id = $3 AND used = 0
     ORDER BY expires_at DESC
     LIMIT 1`,
    [email, code, sessionId]
  );

  const row = result.rows[0];

  if (!row) return res.status(400).json({ error: "Invalid code" });
  if (row.expires_at < Date.now()) {
    return res.status(400).json({ error: "Expired" });
  }

  await pool.query(
    `UPDATE auth_codes SET used = 1 WHERE email = $1 AND code = $2 AND session_id = $3`,
    [email, code, sessionId]
  );

  // 🔥 FIX: userId = email (ОДИН СТАНДАРТ)
  const userId = email;

  await pool.query(
    `INSERT INTO users (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [userId]
  );

  res.json({ success: true, userId });
});

// =========================
// PREMIUM CHECK
// =========================

app.get("/api/premium/check", async (req, res) => {
  try {
    console.log("🔥 PREMIUM CHECK HIT");

    const { userId } = req.query;

    if (!userId) {
      console.log("❌ NO USER ID");
      return res.json({ premium: false });
    }

    const result = await pool.query(
      `SELECT premium_until FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    const row = result.rows[0];

    if (!row || row.premium_until == null) {
      return res.json({ premium: false });
    }

    // 🔥 НОРМАЛИЗАЦИЯ (главный фикс)
    const premiumUntil = Number(row.premium_until);
    const now = Date.now();

    if (!Number.isFinite(premiumUntil)) {
      console.log("❌ INVALID PREMIUM VALUE:", row.premium_until);
      return res.json({ premium: false });
    }

    return res.json({
      premium: premiumUntil > now
    });

  } catch (err) {
    console.error("❌ PREMIUM ERROR:", err);
    return res.status(500).json({ premium: false });
  }
});
// =========================
// STRIPE CHECKOUT
// =========================

app.post("/api/stripe/create-checkout-session", async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "No userId" });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "AI Premium" },
        unit_amount: 1000
      },
      quantity: 1
    }],
success_url: "https://ai-navigator-frontend.vercel.app/?success=true",
cancel_url: "https://ai-navigator-frontend.vercel.app/#pricing",
    // 🔥 userId = email
    metadata: { userId }
  });

  res.json({ url: session.url });
});

app.post("/api/user/link-telegram", async (req, res) => {
  const { email, telegramId } = req.body;

  if (!email || !telegramId) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    await pool.query(
      `INSERT INTO user_identity (email, telegram_id)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET telegram_id = $2`,
      [email, telegramId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ link-telegram error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// =========================
// ADMIN STATS
// =========================

app.get("/api/admin/stats", async (req, res) => {

  const key = req.headers["x-admin-key"];
  if (key !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const users = await pool.query(`SELECT COUNT(*) FROM users`);
  const premium = await pool.query(
    `SELECT COUNT(*) FROM subscriptions WHERE premium_until > $1`,
    [Date.now()]
  );
  const payments = await pool.query(`SELECT COUNT(*) FROM payments`);

  res.json({
    users: parseInt(users.rows[0].count),
    premium: parseInt(premium.rows[0].count),
    payments: parseInt(payments.rows[0].count)
  });
});

// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
