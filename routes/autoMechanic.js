const express = require("express");
const router = express.Router();

const pool = require("../server").pool;

router.post("/", async (req, res) => {
    try {

        const { problem, car, year, vin } = req.body;

        const email = req.user.email; // 👈 уже даёт authMiddleware

        // 1. найти пользователя
        const user = await db.users.findUnique({
            where: { email }
        });

        if (!user || !user.auto_mechanic_premium) {
            return res.status(403).json({
                error: "AUTO_MECHANIC_PREMIUM_REQUIRED"
            });
        }

        // 2. лимиты
        const used = user.auto_mechanic_used || 0;
        const limit = 50;

        if (used >= limit) {
            return res.status(403).json({
                error: "MONTHLY_LIMIT_REACHED"
            });
        }

        // 3. prompt
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

        // 4. увеличить usage
        await db.users.update({
            where: { email },
            data: {
                auto_mechanic_used: used + 1
            }
        });

        // 5. ответ
        return res.json({
            result: data.choices[0].message.content,
            remaining: limit - (used + 1)
        });

    } catch (err) {
        console.error("AUTO MECHANIC ERROR:", err);

        return res.status(500).json({
            error: "AI_ERROR"
        });
    }
});

module.exports = router;
