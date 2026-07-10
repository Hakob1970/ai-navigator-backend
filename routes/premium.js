const express = require("express");
const router = express.Router();

const pool = require("../db/pool");
const authMiddleware = require("../middleware/auth");


// =========================
// GET PREMIUM FLOW (FRONT BUTTON)
// =========================
router.post("/get-premium", async (req, res) => {

  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.json({
      action: "GO_DASHBOARD",
      message: "SEND_EMAIL"
    });
  }

const result = await pool.query(
  `
  SELECT premium_until
  FROM subscriptions
  WHERE user_id = $1
  AND module = 'ai-navigator'
  AND status = 'active'
  `,
  [email]
);

  const row = result.rows[0];

  const now = Date.now();
  const premiumUntil = Number(row?.premium_until || 0);

  if (premiumUntil > now) {
    return res.json({
      action: "ALREADY_PREMIUM"
    });
  }

  return res.json({
    action: "GO_PAYMENT"
  });
});


// =========================
// SECURE CHECK (USED BY FRONTEND)
// =========================
router.get("/check", authMiddleware, async (req, res) => {

  try {

    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        premium: false,
        error: "UNAUTHORIZED"
      });
    }

 const result = await pool.query(
  `
  SELECT premium_until
  FROM subscriptions
  WHERE user_id = $1
  AND module = 'ai-navigator'
  AND status = 'active'
  `,
  [email]
);

    const row = result.rows[0];

    const now = Date.now();
    const premiumUntil = Number(row?.premium_until || 0);

    const isPremium = premiumUntil > now;

    const daysLeft = premiumUntil > now
  ? Math.ceil((premiumUntil - now) / (1000 * 60 * 60 * 24))
  : 0;

 return res.json({
  premium: isPremium,
  resetAt: premiumUntil,
  daysLeft
});

  } catch (err) {
    console.error("PREMIUM CHECK ERROR:", err);

    return res.status(500).json({
      premium: false,
      error: "SERVER_ERROR"
    });
  }
});

module.exports = router;
