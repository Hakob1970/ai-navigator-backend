const validation = require("../services/studio/validationService");
const promptBuilder = require("../services/studio/promptBuilder");
const openrouter = require("../services/studio/ai/openrouter");
const StoryEngine = require("../services/studio/engine/storyEngine");


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


exports.generateBook = async (req, res) => {
    try {

        const { mode, ...input } = req.body;


        // =========================
        // 🧠 NEW ENGINE MODE
        // =========================

        if (mode === "engine") {

            const project = await StoryEngine.start(input);

            return res.json({
                success: true,
                mode: "engine",
                project
            });
        }


        // =========================
        // 📚 OLD FANTASY MODE (НЕ ТРОГАЕМ)
        // =========================
        if (mode === "fantasy") {

            // тут остаётся твоя текущая логика
            // НЕ меняем её вообще

            const result = await generateFantasyBook(input);

            return res.json({
                success: true,
                mode: "fantasy",
                result
            });
        }


        return res.status(400).json({
            success: false,
            message: "Unknown mode"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
