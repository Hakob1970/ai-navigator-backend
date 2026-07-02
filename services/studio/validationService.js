// =========================
// ALLOWED TYPES
// =========================
const ALLOWED_TYPES = [
  "book",
  "novel",
  "story",
  "essay",
  "article",
  "script",
  "poem",
  "character",
  "world",
  "chapter",
  "rewrite",
];

// =========================
// MAIN VALIDATION
// =========================
exports.validateGenerateInput = ({ type, prompt, options }) => {
  // 1. type check
  if (!type) {
    return { ok: false, error: "TYPE_REQUIRED" };
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return { ok: false, error: "INVALID_TYPE" };
  }

  // 2. prompt check
  if (!prompt || typeof prompt !== "string") {
    return { ok: false, error: "PROMPT_REQUIRED" };
  }

  if (prompt.trim().length < 3) {
    return { ok: false, error: "PROMPT_TOO_SHORT" };
  }

  if (prompt.length > 20000) {
    return { ok: false, error: "PROMPT_TOO_LONG" };
  }

  // 3. options check
  if (options && typeof options !== "object") {
    return { ok: false, error: "OPTIONS_MUST_BE_OBJECT" };
  }

  // 4. normalize
  return {
    ok: true,
    data: {
      type: type.trim(),
      prompt: prompt.trim(),
      options: options || {},
    },
  };
};
