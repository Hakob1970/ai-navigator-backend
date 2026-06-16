const authMiddleware = require("../middleware/auth");
const pool = require("../db/pool");
const express = require("express");
const router = express.Router();
const axios = require("axios");

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
// ANTI SPAM MEMORY (PER USER)
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
// SECURITY: ANTI SPAM CHECK
// =========================
function abuseGuard(req, res, next) {

    const email = req.user?.email;

    // дополнительная защита
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

router.post("/", authMiddleware, abuseGuard, async (req, res) => {
    try {

        const { problem, car, year, vin } = req.body;

        const email = req.user.email;

        // =========================


        // =========================
        // 1. GET USER (POSTGRES)
        // =========================
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

const user = userResult.rows[0];

        // BLOCK CHECK
// =========================
if (user.is_blocked) {
    return res.status(403).json({
        error: "USER_BLOCKED"
    });
}

// =========================
// 1. PREMIUM CHECK
// =========================
if (!user || !user.auto_mechanic_premium) {
    return res.status(403).json({
        error: "AUTO_MECHANIC_PREMIUM_REQUIRED"
    });
}

// =========================
// 2. RESET LOGIC (30 DAYS)
// =========================
const now = Date.now();

if (!user.auto_mechanic_reset_at || now > Number(user.auto_mechanic_reset_at)) {
    const resetAt = now + 30 * 24 * 60 * 60 * 1000;

    await pool.query(
        `UPDATE users 
         SET auto_mechanic_used = 0,
             auto_mechanic_reset_at = $1
         WHERE email = $2`,
        [resetAt, email]
    );

    user.auto_mechanic_used = 0;
    user.auto_mechanic_reset_at = resetAt;
}

            const refreshed = await pool.query(
        "SELECT auto_mechanic_used FROM users WHERE email = $1",
        [email]
    );

    user.auto_mechanic_used = refreshed.rows[0].auto_mechanic_used || 0;

        // =========================
        // 2. LIMIT CHECK
        // =========================
        const used = user.auto_mechanic_used || 0;
        const limit = 50;

        if (used >= limit) {
            return res.status(403).json({
                error: "MONTHLY_LIMIT_REACHED"
            });
        }

        // =========================
// ANTI ABUSE CHECK (HITS)
// =========================
const suspiciousResult = await pool.query(
    "SELECT suspicious_hits FROM users WHERE email = $1",
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
        // 3. OPENROUTER PROMPT
        // =========================
const prompt = `
You are an expert automotive mechanic AI.

IMPORTANT RULE:
- Always respond in the same language as the user's message.
- Detect the language automatically.
- Do not translate or change language unless user requests it.

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
            return res.json({
                result: "AI temporarily unavailable"
            });
        }

        // =========================
        // 4. UPDATE USAGE
        // =========================
       // =========================
// 4. ATOMIC UPDATE (SAFE)
// =========================
const updateResult = await pool.query(
  `UPDATE users 
   SET auto_mechanic_used = COALESCE(auto_mechanic_used, 0) + 1 
   WHERE email = $1
   RETURNING auto_mechanic_used`,
  [email]
);

const newUsed = updateResult.rows[0].auto_mechanic_used;

        // =========================
        // 5. RESPONSE
        // =========================
     return res.json({
  result: data.choices[0].message.content,
  remaining: 50 - newUsed,
    resetAt: user.auto_mechanic_reset_at      
});

    } catch (err) {
        console.error("AUTO MECHANIC ERROR:", err);

        return res.status(500).json({
            error: "AI_ERROR"
        });
    }
});

module.exports = router;
