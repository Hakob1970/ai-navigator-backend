const writerConfig = require("../../config/writer");

// =========================
// VALIDATION
// =========================
exports.validateGenerateInput = ({ category, mode, formData }) => {

  // 1. category
  if (!category) {
    return { ok: false, error: "CATEGORY_REQUIRED" };
  }

  if (!writerConfig[category]) {
    return { ok: false, error: "INVALID_CATEGORY" };
  }

  // 2. mode
  if (!mode) {
    return { ok: false, error: "MODE_REQUIRED" };
  }

  const allowedModes = writerConfig[category];

  if (!allowedModes.includes(mode)) {
    return { ok: false, error: "INVALID_MODE_FOR_CATEGORY" };
  }

  // 3. formData
  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    return { ok: false, error: "FORMDATA_REQUIRED" };
  }

  const hasData = Object.values(formData)
    .some(v => String(v ?? "").trim().length > 0);

  if (!hasData) {
    return { ok: false, error: "EMPTY_FORMDATA" };
  }

  // OK
  return {
    ok: true,
    data: {
      category,
      mode,
      formData
    }
  };
};
