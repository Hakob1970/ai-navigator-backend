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

    const { userId, telegramId } = req.body;

    if (!userId || !telegramId) {
      return res.status(400).json({
        error: "Missing data"
      });
    }

    // user create
    await pool.query(
      `
      INSERT INTO users (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [userId]
    );

    // telegram link
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
      [userId, telegramId]
    );

    console.log("🔗 TELEGRAM LINKED:", userId);

    res.json({
      success: true
    });

  } catch (err) {

    console.error("❌ TELEGRAM LINK ERROR:", err);

    res.status(500).json({
      error: "Server error"
    });
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
