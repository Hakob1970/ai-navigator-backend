const express = require("express");
const router = express.Router();


router.post("/", async (req, res) => {
    try {
        const { problem, car, year, vin } = req.body;

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

        res.json({
            result: data.choices[0].message.content
        });

    } catch (err) {
        res.status(500).json({ error: "AI error" });
    }
});

module.exports = router;
