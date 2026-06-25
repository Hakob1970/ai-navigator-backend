const authMiddleware = require("../middleware/auth");
const pool = require("../db/pool");
const express = require("express");
const router = express.Router();
const axios = require("axios");

// =========================
// TELEGRAM ALERT (WITH ACTION BUTTONS)
// =========================
async function sendTelegramAlert(message, email = null, type = "UNKNOWN") {
  try {
    const token = process.env.TELEGRAM_SECURITY_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    let replyMarkup = undefined;

    if (email) {
      const SECRET = process.env.ADMIN_SECRET;
      const blockUrl = `https://ai-navigator-backend-mcb3.onrender.com/api/admin/block?email=${encodeURIComponent(email)}&secret=${SECRET}`;
      const ignoreUrl = `https://ai-navigator-backend-mcb3.onrender.com/api/admin/ignore?email=${encodeURIComponent(email)}&secret=${SECRET}`;

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "🚫 BLOCK", url: blockUrl },
            { text: "🟢 IGNORE", url: ignoreUrl }
          ]
        ]
      };
    }

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: `🚨 <b>SECURITY ALERT</b>\n\n👤 User: ${email || "UNKNOWN"}\n⚠️ Type: ${type}\n\n${message}`,
      parse_mode: "HTML",
      reply_markup: replyMarkup
    });
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
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
    sendTelegramAlert("🚨 Too many requests detected", email, "RATE_LIMIT");
    return res.status(429).json({ error: "TOO_FAST_REQUEST" });
  }

  userRateMap.set(email, now);
  next();
}

// =========================
// MAIN ROUTE
// =========================
router.post("/", authMiddleware, abuseGuard, async (req, res) => {
  console.log("BODY:", req.body);
  console.log("USER:", req.user);

  try {
    const { problem, car, year, engine, vin } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ error: "NO_USER" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    console.log("USER ROW:", user);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    if (user.is_blocked) {
      return res.status(403).json({ error: "USER_BLOCKED" });
    }

    const subResult = await pool.query(
      `SELECT * FROM subscriptions WHERE email = $1 AND module = $2`,
      [email, "auto-mechanic"]
    );

    const sub = subResult.rows[0];

    if (!sub) {
      return res.status(403).json({ error: "NO_SUBSCRIPTION" });
    }

    if (sub.status !== "active") {
      return res.status(403).json({ error: "AUTO_MECHANIC_PREMIUM_REQUIRED" });
    }

    if (sub.requests_left <= 0) {
      return res.status(403).json({ error: "NO_REQUESTS_LEFT" });
    }

    // ANTI ABUSE CHECK
    const hits = user.suspicious_hits || 0;
    if (hits > 20) {
      await sendTelegramAlert("🚨 USER FLAGGED", email, "SUSPICIOUS_HITS");
      return res.status(403).json({ error: "ACCOUNT_TEMP_BLOCKED" });
    }

    // =========================
    // OPENROUTER
    // =========================
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    console.log("➡️ BEFORE OPENROUTER REQUEST");

    const prompt = `
Car: ${car}
Year: ${year}
Engine: ${engine || "not provided"}
VIN: ${vin || "not provided"}
Problem: ${problem}
`;

    try {
      console.log("➡️ ABOUT TO CALL OPENROUTER");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-navigator-backend-mcb3.onrender.com",
          "X-Title": "AI Navigator Auto Mechanic"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are an automotive diagnostic API.

CRITICAL RULES:
- You MUST return ONLY valid JSON.
- NO text before or after JSON.
- NO markdown.
- NO emojis.
- NEVER wrap response in explanation.

OUTPUT FORMAT:

{
  "title": "Short problem name",
  "most_likely_cause": "Main cause",
  "secondary_causes": ["cause1", "cause2"],
  "recommended_checks": ["check1", "check2"],
  "suggested_fix": ["fix1", "fix2"],
  "system": "engine | fuel | electrical | suspension | transmission | air"
}

IMPORTANT:
- Return ONLY JSON object
- No extra characters allowed
`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1
        })
      });

      console.log("STATUS:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenRouter error:", response.status, errText);

        return res.status(502).json({
          error: "OPENROUTER_FAILED",
          result: "AI service error. Try again."
        });
      }

      const data = await response.json();
      const aiResultRaw = data?.choices?.[0]?.message?.content || "";

      // =========================
      // CLEAN + SAFE JSON
      // =========================
      let cleaned = aiResultRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/❌/g, "")
        .trim();

      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");

      const safeJson =
        jsonStart !== -1 && jsonEnd !== -1
          ? cleaned.slice(jsonStart, jsonEnd + 1)
          : cleaned;

      // =========================
      // PARSE JSON
      // =========================
      let aiResult;

      try {
        aiResult = JSON.parse(safeJson);
      } catch (e) {
        console.error("❌ BAD JSON FROM AI:", safeJson);

        // Получаем текущий баланс перед ошибкой
        const currentSub = await pool.query(
          `SELECT requests_left, reset_at
           FROM subscriptions
           WHERE email = $1
           AND module = 'auto-mechanic'`,
          [email]
        );

        const remaining = currentSub.rows[0]?.requests_left ?? 0;
        const resetAt = currentSub.rows[0]?.reset_at ?? 0;

        return res.json({
          result: {
            title: "Invalid AI response",
            most_likely_cause: "AI returned broken format",
            secondary_causes: [],
            recommended_checks: [],
            suggested_fix: [],
            system: "unknown"
          },
          remaining,
          resetAt
        });
      }

      // =========================
      // UPDATE LIMITS
      // =========================
      await pool.query(
        `UPDATE subscriptions
         SET requests_left = requests_left - 1
         WHERE email = $1
         AND module = 'auto-mechanic'`,
        [email]
      );

      const updatedSub = await pool.query(
        `SELECT requests_left, reset_at
         FROM subscriptions
         WHERE email = $1
         AND module = 'auto-mechanic'`,
        [email]
      );

      const remaining = updatedSub.rows[0]?.requests_left ?? 0;
      const resetAt = updatedSub.rows[0]?.reset_at ?? 0;

      // =========================
      // RESPONSE
      // =========================
           return res.json({
        result: aiResult,
        remaining,
        resetAt
      });

    } catch (err) {
      console.error("OPENROUTER ERROR:", err);

      if (err.name === "AbortError") {
        return res.status(504).json({ error: "AI_TIMEOUT" });
      }

      return res.status(500).json({ error: "AI_ERROR" });

    } finally {
      clearTimeout(timeout);
    }
  }   // <--- ЭТА СКОБКА ЗАКРЫВАЕТ ВНЕШНИЙ try (ДОБАВЬТЕ!)

});   // <--- ЭТО ЗАКРЫВАЕТ router.post

module.exports = router;
