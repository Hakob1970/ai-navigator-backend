const authMiddleware = require("../middleware/auth");
const pool = require("../db/pool");
const express = require("express");
const router = express.Router();
const axios = require("axios");

// =========================
// TELEGRAM ALERT
// =========================
async function sendTelegramAlert(message) {
  try {
    const token = process.env.TELEGRAM_SECURITY_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message
    });
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
}

// =========================
// ANTI SPAM MEMORY
// =========================
const userRateMap = new Map();

setInterval(() => {
  const now = Date.now();

  for (const [email, timestamp] of userRateMap.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      userRateMap.delete(email);
    }
  }
}, 5 * 60 * 1000);

// =========================
// ABUSE GUARD
// =========================
function abuseGuard(req, res, next) {
  const email = req.user?.email;

  console.log("EMAIL FROM TOKEN:", email);
  if (!email) return next();

  const now = Date.now();
  const last = userRateMap.get(email) || 0;

  if (now - last < 2000) {
    sendTelegramAlert(`🚨 SPAM DETECTED: ${email}`);

    return res.status(429).json({
      error: "TOO_FAST_REQUEST"
    });
  }

  userRateMap.set(email, now);
  next();
}

// =========================
// MAIN ROUTE
// =========================
router.post("/", authMiddleware, abuseGuard, async (req, res) => {
  try {
    const { problem, car, year, vin } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ error: "NO_USER" });
    }

    // =========================
    // GET USER
    // =========================
const userResult = await pool.query(
  "SELECT suspicious_hits FROM users WHERE user_id = $1",
  [email]
);

    const user = userResult.rows[0];

    console.log("USER ROW:", user);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    // =========================
    // BLOCK CHECK
    // =========================
    if (user.is_blocked) {
      return res.status(403).json({ error: "USER_BLOCKED" });
    }

    // =========================
    // PREMIUM CHECK (CLEAN)
    // =========================
    const now = Date.now();

    const premiumResult = await pool.query(
      `SELECT premium_until FROM subscriptions WHERE user_id = $1`,
      [email]
    );

    const premiumRow = premiumResult.rows[0];

    console.log("PREMIUM ROW:", premiumRow);
    const premiumUntil = Number(premiumRow?.premium_until || 0);

    if (premiumUntil <= now) {
      return res.status(403).json({
        error: "AUTO_MECHANIC_PREMIUM_REQUIRED"
      });
    }

    // =========================
    // LIMIT CHECK (fallback safe)
    // =========================
    const used = user.auto_mechanic_used || 0;
    const limit = 50;

    if (used >= limit) {
      return res.status(403).json({
        error: "MONTHLY_LIMIT_REACHED"
      });
    }

    // =========================
    // ANTI ABUSE CHECK (DB)
    // =========================
    const suspiciousResult = await pool.query(
      "SELECT suspicious_hits FROM users WHERE user_id = $1",
      [email]
    );

    const hits = suspiciousResult.rows[0]?.suspicious_hits || 0;

    if (hits > 20) {
      await sendTelegramAlert(`🚨 USER FLAGGED: ${email}`);

      return res.status(403).json({
        error: "ACCOUNT_TEMP_BLOCKED"
      });
    }

    // =========================
    // OPENROUTER
    // =========================
    const prompt = `
You are an expert automotive mechanic AI.

Car: ${car}
Year: ${year}
VIN: ${vin || "not provided"}
Problem: ${problem}

Provide:
- Possible causes (ranked)
- Diagnosis steps
- Repair advice
- What to tell mechanic
- What to avoid
`;

    console.log("OPENROUTER CALL START");
console.log("PROMPT:", prompt);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional mechanic assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices?.[0]) {
      return res.json({ result: "AI temporarily unavailable" });
    }

    // =========================
    // UPDATE USAGE
    // =========================
    const updateResult = await pool.query(
      `UPDATE users 
SET auto_mechanic_used = COALESCE(auto_mechanic_used, 0) + 1
WHERE user_id = $1
       RETURNING auto_mechanic_used`,
      [email]
    );

    const newUsed = updateResult.rows[0]?.auto_mechanic_used || 0;

    // =========================
    // RESPONSE
    // =========================
    return res.json({
      result: data.choices[0].message.content,
      remaining: Math.max(0, limit - newUsed)
    });

  } catch (err) {
    console.error("AUTO MECHANIC ERROR:", err);

    return res.status(500).json({
      error: "AI_ERROR"
    });
  }
});

module.exports = router;
