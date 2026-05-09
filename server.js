console.log("🔥 CLEAN SERVER START");

require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const Stripe = require("stripe");
const path = require("path");
const cors = require("cors");

const app = express();



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
  CREATE TABLE IF NOT EXISTS telegram_links (
    user_id TEXT PRIMARY KEY,
    telegram_id TEXT UNIQUE,
    linked_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
  );
`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      session_id TEXT UNIQUE
    );
  `);

  console.log("✅ DB READY");
})();

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

      const userId = session.metadata?.userId;

      if (!userId) {
        return res.json({ received: true });
      }

      try {

        const exists = await pool.query(
          `
          SELECT 1
          FROM payments
          WHERE session_id = $1
          `,
          [session.id]
        );

        if (exists.rowCount === 0) {

          const premiumUntil =
            Date.now() + 30 * 24 * 60 * 60 * 1000;

          // user auto-create
          await pool.query(
            `
            INSERT INTO users (user_id)
            VALUES ($1)
            ON CONFLICT (user_id)
            DO NOTHING
            `,
            [userId]
          );

          // subscription
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
            [userId, premiumUntil]
          );

          // payment log
          await pool.query(
            `
            INSERT INTO payments (
              user_id,
              session_id
            )
            VALUES ($1, $2)
            `,
            [userId, session.id]
          );

          console.log("✅ PREMIUM ACTIVATED:", userId);

        } else {

          console.log("🔁 Duplicate webhook ignored");

        }

      } catch (dbErr) {

        console.error("❌ DB ERROR:", dbErr);

      }
    }

    res.json({ received: true });
  }
);

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



async function isPremium(userId) {

  if (!userId) return false;

  const result = await pool.query(
    `
    SELECT premium_until
    FROM subscriptions
    WHERE user_id = $1
    `,
    [userId]
  );

  const row = result.rows[0];

  if (!row) return false;

  return Number(row.premium_until) > Date.now();
}
//---------------------------
 // PREMIUM CHECK
//--------------------------
app.get("/api/premium/check", async (req, res) => {

  try {

    const { userId } = req.query;

    const premium = await isPremium(userId);

    res.json({ premium });

  } catch (err) {

    console.error("❌ PREMIUM CHECK ERROR:", err);

    res.status(500).json({
      premium: false
    });
  }
});

// =========================
// TELEGRAM PREMIUM LINK
// =========================
app.post("/api/telegram/create-link", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        allowed: false,
        error: "Missing email"
      });
    }

    const userId = String(email).trim().toLowerCase();
    const premium = await isPremium(userId);

    if (!premium) {
      return res.status(403).json({
        allowed: false,
        redirect: "#pricing"
      });
    }

    const botUsername = "hakob_ai_it_bot";
    const telegramUrl =
      `https://t.me/${botUsername}?start=${encodeURIComponent(userId)}`;

    res.json({
      allowed: true,
      url: telegramUrl
    });

  } catch (err) {
    console.error("❌ TELEGRAM CREATE LINK ERROR:", err);

    res.status(500).json({
      allowed: false,
      error: "Server error"
    });
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
  try {
    const { email, telegramId } = req.body;

    if (!email || !telegramId) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      `
      INSERT INTO users (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [email]
    );

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

    res.json({ success: true });

  } catch (err) {
    console.error("❌ TELEGRAM LINK ERROR:", err);
    res.status(500).json({ error: "Server error" });
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

    await client.query(
      `
      DELETE FROM users
      WHERE user_id = $1
      `,
      [oldUserId]
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

  const key = req.headers["x-admin-key"];
  if (key !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const users = await pool.query(`SELECT COUNT(*) FROM users`);
const premium = await pool.query(
  `
  SELECT COUNT(*)
  FROM subscriptions
  WHERE premium_until > $1
  `,
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
