const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// =========================
// ADMIN AUTH MIDDLEWARE
// =========================
function adminAuth(req, res, next) {
  const secret = req.query.secret;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(403).send("FORBIDDEN");
  }

  next();
}

// =========================
// BLOCK USER
// =========================
router.get("/block", adminAuth, async (req, res) => {
  try {
    const email = req.query.email;

    console.log("🚫 BLOCK CALLED FOR:", email);

    if (!email) {
      return res.status(400).send("NO EMAIL");
    }

    await pool.query(
      `UPDATE users SET is_blocked = true WHERE email = $1`,
      [email]
    );

    return res.send(`
      <h2 style="color:red;">🚫 USER BLOCKED</h2>
      <p>${email}</p>
      <a href="javascript:history.back()">← Go Back</a>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
  }
});

// =========================
// IGNORE USER
// =========================
router.get("/ignore", adminAuth, async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send("NO EMAIL");
    }

    await pool.query(
      `UPDATE users SET suspicious_hits = 0 WHERE email = $1`,
      [email]
    );

    return res.send(`
      <h2 style="color:green;">🟢 USER IGNORED</h2>
      <p>${email}</p>
      <a href="javascript:history.back()">← Go Back</a>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
  }
});

module.exports = router;
