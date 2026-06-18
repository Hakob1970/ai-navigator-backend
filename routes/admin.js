const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// =========================
// BLOCK USER
// =========================
router.get("/block", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send("NO EMAIL");
    }

    await pool.query(
      `UPDATE users SET is_blocked = true WHERE email = $1`,
      [email]
    );

    return res.send(`USER BLOCKED: ${email}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
  }
});

// =========================
// IGNORE USER
// =========================
router.get("/ignore", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send("NO EMAIL");
    }

    await pool.query(
      `UPDATE users SET suspicious_hits = 0 WHERE email = $1`,
      [email]
    );

    return res.send(`USER IGNORED: ${email}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
  }
});

module.exports = router;
