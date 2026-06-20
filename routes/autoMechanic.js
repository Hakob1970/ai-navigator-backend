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

    // кнопки только если есть email
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

  // rate limit
  if (now - last < 2000) {
    sendTelegramAlert(
      "🚨 Too many requests detected",
      email,
      "RATE_LIMIT"
    );

    return res.status(429).json({
      error: "TOO_FAST_REQUEST"
    });
  }

  userRateMap.set(email, now);
  next();
}

module.exports = {
  abuseGuard,
  sendTelegramAlert
};

// =========================
// MAIN ROUTE
// =========================
router.post("/", authMiddleware, abuseGuard, async (req, res) => {

  console.log("BODY:", req.body);
  console.log("USER:", req.user);
  
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
  "SELECT * FROM users WHERE email = $1",
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

const subResult = await pool.query(
  `SELECT * FROM subscriptions WHERE email = $1 AND module = $2`,
  [email, "auto-mechanic"]
);

const sub = subResult.rows[0];

if (!sub) {
  return res.status(403).json({
    error: "NO_SUBSCRIPTION"
  });
}

if (sub.status !== "active") {
  return res.status(403).json({
    error: "AUTO_MECHANIC_PREMIUM_REQUIRED"
  });
}

if (sub.requests_left <= 0) {
  return res.status(403).json({
    error: "NO_REQUESTS_LEFT"
  });
}


    // =========================
    // ANTI ABUSE CHECK (DB)
    // =========================
    const hits = user.suspicious_hits || 0;

if (hits > 20) {
  await sendTelegramAlert(`🚨 USER FLAGGED: ${email}`);

  return res.status(403).json({
    error: "ACCOUNT_TEMP_BLOCKED"
  });
}


// =========================
// OPENROUTER
// =========================

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 25000);

const prompt = `
Car: ${car}
Year: ${year}
VIN: ${vin || "not provided"}
Problem: ${problem}
`;

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  signal: controller.signal,
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an expert automotive diagnostic AI (OBD-style mechanic assistant).

You MUST respond in this exact structure:

📊 DIAGNOSTIC REPORT (OBD STYLE)

🔍 Symptom analysis:
- Identify what the user is experiencing

⚠️ Possible causes (ranked):
- Most likely cause
- Secondary cause
- Less likely cause

🧪 Diagnosis steps:
- Step-by-step checks to confirm the issue

🛠 Repair instructions:
1. First action
2. Next action
3. Final fix

💡 Mechanic advice:
- Practical professional recommendation

Rules:
- Be precise and practical
- No vague answers
- Focus on real mechanical reasoning
- Do NOT ask questions back unless necessary
`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.4
  })
});

clearTimeout(timeout);

    if (!response.ok) {
  console.error("OpenRouter error status:", response.status);

  return res.json({
    result: "AI service error. Try again."
  });
}

let data;
try {
  data = await response.json();
} catch (err) {
  console.error("OpenRouter JSON parse error:", err);

  return res.json({
    result: "AI response format error. Try again."
  });
}

// =========================
// SAFETY CHECK
// =========================
if (!data.choices?.[0]?.message?.content) {
  return res.json({
    result: "AI temporarily unavailable. Try again."
  });
}

const aiResult = data.choices?.[0]?.message?.content || "No AI response";

// уменьшить запросы
await pool.query(
  `UPDATE subscriptions
   SET requests_left = requests_left - 1
   WHERE email = $1 AND module = $2`,
  [email, "auto-mechanic"]
);

// получить новое количество
const updatedSub = await pool.query(
  `SELECT requests_left
   FROM subscriptions
   WHERE email = $1 AND module = $2`,
  [email, "auto-mechanic"]
);

// ответ
return res.json({
  result: aiResult,
  remaining: updatedSub.rows[0]?.requests_left ?? 0
});

  } catch (err) {
    console.error("AUTO MECHANIC ERROR:", err);

    return res.status(500).json({
      error: "AI_ERROR"
    });
  }
});

module.exports = router;
