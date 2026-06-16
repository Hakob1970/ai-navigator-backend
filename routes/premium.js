const express = require("express");
const router = express.Router();

const pool = require("../db/pool");
const authMiddleware = require("../middleware/auth");


// =========================
// 1. GET PREMIUM FLOW (FRONT BUTTON)
// =========================
router.post("/get-premium", async (req, res) => {

  const email = req.body.email?.trim().toLowerCase();

  // NO EMAIL
  if (!email) {
    return res.json({
      action: "GO_DASHBOARD",
      message: "SEND_EMAIL"
    });
  }

  const userResult = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = userResult.rows[0];

  // NO USER
  if (!user) {
    return res.json({
      action: "GO_DASHBOARD",
      message: "SEND_EMAIL"
    });
  }

  // ALREADY PREMIUM
  if (user.auto_mechanic_premium) {
    return res.json({
      action: "ALREADY_PREMIUM"
    });
  }

  // GO PAYMENT (later Polar)
  return res.json({
    action: "GO_PAYMENT"
  });
});


// =========================
// 2. PREMIUM CHECK (SECURE)
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
      "SELECT auto_mechanic_premium FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.json({
        premium: false
      });
    }

    return res.json({
      premium: !!user.auto_mechanic_premium
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
