
const path = require("path");

// =========================
// MODE NORMALIZATION
// =========================
function normalizeMode(mode) {
  if (!mode) return null;

  return mode
    .toLowerCase()
    .replace(/\s+/g, "")     // remove spaces
    .replace(/-/g, "");      // remove hyphens
}

// =========================
// PROMPT BUILDER
// =========================
exports.build = ({ mode, formData }) => {
  if (!mode) {
    throw new Error("MODE_REQUIRED");
  }

  const normalized = normalizeMode(mode);

  let promptPath;

  try {
    promptPath = path.join(
      __dirname,
      `../../prompts/${normalized}.js`
    );

    const builder = require(promptPath);

    if (typeof builder !== "function") {
      throw new Error("INVALID_PROMPT_MODULE");
    }

    return builder(formData);

  } catch (err) {
    console.error("PROMPT_BUILDER_ERROR:", err.message);

    throw new Error("PROMPT_NOT_FOUND: " + mode);
  }
};
