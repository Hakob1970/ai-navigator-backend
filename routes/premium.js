const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

router.post("/get-premium", async (req, res) => {

  const email = req.body.email?.trim().toLowerCase();

  // =========================
  // NO EMAIL
  // =========================
  if (!email) {
    return res.json({
      action: "GO_DASHBOARD",
      message: "SEND_EMAIL"
    });
  }

  // =========================
  // GET USER
  // =========================
  const userResult = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = userResult.rows[0];

  // =========================
  // NO USER
  // =========================
  if (!user) {
    return res.json({
      action: "GO_DASHBOARD",
      message: "SEND_EMAIL"
    });
  }

  // =========================
  // ALREADY PREMIUM
  // =========================
  if (user.auto_mechanic_premium) {
    return res.json({
      action: "ALREADY_PREMIUM"
    });
  }

  // =========================
  // GO PAYMENT (later Polar)
  // =========================
  return res.json({
    action: "GO_PAYMENT"
  });

});

module.exports = router;
