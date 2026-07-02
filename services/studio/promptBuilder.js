// =========================
// PROMPT BUILDER (CORE)
// =========================

const buildBaseInstruction = (type, options = {}) => {
  const language = options.language || "English";
  const tone = options.tone || "Professional";
  const style = options.style || "Natural and engaging";

  return `
You are a professional AI writer.

Your task is to generate high-quality ${type} content.

Rules:
- Write in ${language}
- Tone: ${tone}
- Style: ${style}
- Do not mention that you are AI
- Do not add explanations
- Output only the final content
`;
};

// =========================
// TYPE TEMPLATES
// =========================

const typeTemplates = {
  book: (prompt) => `
Write a book based on the following idea:

"${prompt}"

Structure:
- Introduction
- Main storyline
- Character development
- Conflict and resolution
- Conclusion
`,

  novel: (prompt) => `
Write a novel based on this idea:

"${prompt}"

Focus on:
- Deep characters
- Emotional storytelling
- Strong narrative flow
`,

  story: (prompt) => `
Write a short story:

"${prompt}"

Keep it:
- Engaging
- Short and impactful
- With a clear ending
`,

  essay: (prompt) => `
Write an essay:

Topic: "${prompt}"

Structure:
- Introduction
- Arguments
- Conclusion
`,

  script: (prompt) => `
Write a script:

"${prompt}"

Format:
- Scene descriptions
- Dialogue
- Clear structure
`,

  poem: (prompt) => `
Write a poem:

"${prompt}"

Style:
- Emotional
- Rhythmic
- Creative
`,

  character: (prompt) => `
Create a detailed character:

"${prompt}"

Include:
- Background
- Personality
- Motivation
- Weaknesses
`,

  world: (prompt) => `
Create a fictional world:

"${prompt}"

Include:
- Geography
- Culture
- Rules of the world
- History
`,

  chapter: (prompt) => `
Write a book chapter:

"${prompt}"

Make it:
- Continuation of a story
- Rich in detail
- Narrative-driven
`,

  rewrite: (prompt) => `
Rewrite the following text in a better style:

"${prompt}"

Improve:
- Clarity
- Flow
- Grammar
- Engagement
`,
};

// =========================
// MAIN FUNCTION
// =========================

exports.build = ({ type, prompt, options = {}, user }) => {
  const base = buildBaseInstruction(type, options);

  const template = typeTemplates[type];

  if (!template) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  const finalPrompt = `
${base}

${template(prompt)}

---

User context:
- Email: ${user?.email || "unknown"}
`;

  return finalPrompt;
};
