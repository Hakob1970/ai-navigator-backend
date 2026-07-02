const validationService = require("../services/studio/validationService");
const promptBuilder = require("../services/studio/promptBuilder");
const projectService = require("../services/studio/projectService");
const historyService = require("../services/studio/historyService");
const memoryService = require("../services/studio/memoryService");
const exportService = require("../services/studio/exportService");
const openrouter = require("../services/studio/ai/openrouter");

// =========================
// MAIN GENERATE
// =========================
exports.generate = async (req, res) => {
  try {
    const email = req.user?.email;
    const user = req.userDB;

    const { type, prompt, options } = req.body;

    // 1. VALIDATION
    const validation = validationService.validateGenerateInput({
      type,
      prompt,
      options,
    });

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // 2. BUILD PROMPT
    const finalPrompt = promptBuilder.build({
      type,
      prompt,
      options,
      user,
    });

    // 3. MEMORY LOAD (future use)
    const memory = await memoryService.loadUserMemory(email);

    // 4. CALL AI
    const aiResult = await openrouter.generate({
      prompt: finalPrompt,
      memory,
    });

    // 5. SAVE HISTORY
    await historyService.save({
      email,
      type,
      prompt,
      response: aiResult,
    });

    return res.json({
      success: true,
      data: aiResult,
    });

  } catch (err) {
    console.error("WRITER GENERATE ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "WRITER_GENERATE_FAILED",
    });
  }
};

// =========================
// PLACEHOLDERS (NEXT STEPS)
// =========================
exports.getProjects = async (req, res) => {
  return res.json({ ok: true, message: "getProjects not implemented yet" });
};

exports.getProjectById = async (req, res) => {
  return res.json({ ok: true, message: "getProjectById not implemented yet" });
};

exports.saveProject = async (req, res) => {
  return res.json({ ok: true, message: "saveProject not implemented yet" });
};

exports.deleteProject = async (req, res) => {
  return res.json({ ok: true, message: "deleteProject not implemented yet" });
};

exports.exportProject = async (req, res) => {
  return res.json({ ok: true, message: "exportProject not implemented yet" });
};
