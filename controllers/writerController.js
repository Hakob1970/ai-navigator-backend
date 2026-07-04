const validation = require("../services/studio/validationService");
const promptBuilder = require("../services/studio/promptBuilder");
const openrouter = require("../services/studio/ai/openrouter");

// =========================
// MAIN CONTROLLER
// =========================
exports.generate = async (req, res) => {
  try {
    const { category, mode, formData } = req.body;

    // 1. VALIDATION
    const check = validation.validateGenerateInput({
      category,
      mode,
      formData,
    });

    if (!check.ok) {
      return res.status(400).json({
        error: check.error,
      });
    }

    const validData = check.data;

    // 2. BUILD PROMPT
    const prompt = promptBuilder.build({
      mode: validData.mode,
      formData: validData.formData,
    });

    if (!prompt) {
      return res.status(500).json({
        error: "PROMPT_BUILD_FAILED",
      });
    }

    // 3. OPTIONAL MEMORY (пока заглушка)
    const memory = null;

    // 4. CALL OPENROUTER
    const result = await openrouter.generate({
      prompt,
      memory,
    });

    if (!result) {
      return res.status(500).json({
        error: "EMPTY_AI_RESPONSE",
      });
    }

    // 5. RESPONSE
    return res.json({
      success: true,
      result,
    });

  } catch (err) {
    console.error("WRITER_CONTROLLER_ERROR:", err.message);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
