const express = require("express");
const router = express.Router();

const pool = require("../db/pool");
const authMiddleware = require("../middleware/auth");


// =========================
// DEVICE CHECK + REGISTER
// =========================
router.post("/check", authMiddleware, async (req, res) => {
  try {

    const email = req.user?.email;
    const deviceId = req.body.deviceId;

    // =========================
    // NO AUTH
    // =========================
    if (!email) {
      return res.status(401).json({
        allowed: false,
        error: "UNAUTHORIZED"
      });
    }

    // =========================
    // NO DEVICE
    // =========================
    if (!deviceId) {
      return res.json({
        allowed: false,
        error: "NO_DEVICE"
      });
    }

    // =========================
    // DEVICE EXISTS
    // =========================
    const existing = await pool.query(
      `SELECT 1 FROM user_devices WHERE email=$1 AND device_id=$2 LIMIT 1`,
      [email, deviceId]
    );

    if (existing.rowCount > 0) {
      await pool.query(
        `UPDATE user_devices SET last_seen = NOW() WHERE email=$1 AND device_id=$2`,
        [email, deviceId]
      );

      return res.json({
        allowed: true,
        status: "EXISTING_DEVICE"
      });
    }

    // =========================
    // DEVICE LIMIT CHECK (max 3 devices)
    // =========================
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM user_devices WHERE email=$1`,
      [email]
    );

    const count = parseInt(countResult.rows[0].count || "0");

    if (count >= 3) {
      return res.json({
        allowed: false,
        error: "DEVICE_LIMIT"
      });
    }

    // =========================
    // INSERT NEW DEVICE
    // =========================
    await pool.query(
      `INSERT INTO user_devices (email, device_id, last_seen)
       VALUES ($1, $2, NOW())`,
      [email, deviceId]
    );

    return res.json({
      allowed: true,
      status: "NEW_DEVICE_ADDED"
    });

  } catch (err) {
    console.error("DEVICE ERROR:", err);

    return res.status(500).json({
      allowed: false,
      error: "DEVICE_CHECK_FAILED"
    });
  }
});

module.exports = router;
