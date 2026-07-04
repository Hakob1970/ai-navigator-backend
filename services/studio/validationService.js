// =========================
// ALLOWED CATEGORIES
// =========================
const ALLOWED_CATEGORIES = [
  "Books",
  "Education",
  "Business",
  "Content",
  "Creative",
  "Tools"
];

// =========================
// ALLOWED MODES
// =========================
const ALLOWED_MODES = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Historical",
  "Mystery",

  "Essay",
  "Research",
  "Homework",
  "Summary",

  "Email",
  "Proposal",
  "Marketing",
  "Business Plan",

  "Blog",
  "SEO",
  "YouTube",
  "Instagram",

  "Characters",
  "Plot",
  "Dialogue",
  "World Builder",

  "Rewrite",
  "Grammar",
  "Translate",
  "Humanize"
];

// =========================
// VALIDATION
// =========================
exports.validateGenerateInput = ({ category, mode, formData }) => {

  // Category
  if (!category) {
    return { ok: false, error: "CATEGORY_REQUIRED" };
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { ok: false, error: "INVALID_CATEGORY" };
  }

  // Mode
  if (!mode) {
    return { ok: false, error: "MODE_REQUIRED" };
  }

  if (!ALLOWED_MODES.includes(mode)) {
    return { ok: false, error: "INVALID_MODE" };
  }

  // Form data
  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    return { ok: false, error: "FORMDATA_REQUIRED" };
  }

  // At least one field must be filled
  const hasData = Object.values(formData)
    .some(value => String(value ?? "").trim().length > 0);

  if (!hasData) {
    return { ok: false, error: "EMPTY_FORMDATA" };
  }

  // Success
  return {
    ok: true,
    data: {
      category,
      mode,
      formData
    }
  };
};
