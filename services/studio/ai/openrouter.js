const axios = require("axios");

// =========================
// OPENROUTER CONFIG
// =========================
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

// =========================
// MAIN AI GENERATION
// =========================
exports.generate = async ({ prompt, memory }) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY_NOT_SET");
    }

    // Build messages
    const messages = [];

    // optional memory injection
    if (memory) {
      messages.push({
        role: "system",
        content: `
You have memory context from previous interactions:

${JSON.stringify(memory)}
        `,
      });
    }

    // main prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",

          // важно для OpenRouter (рекомендация API)
          "HTTP-Referer": "https://ai-navigator.app",
          "X-Title": "AI Writer Studio",
        },
      }
    );

    const result = response.data?.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("EMPTY_AI_RESPONSE");
    }

    return result;
  } catch (err) {
    console.error("OPENROUTER ERROR:", err.response?.data || err.message);

    throw new Error("OPENROUTER_GENERATION_FAILED");
  }
};
