module.exports = (formData) => {

  const title = formData?.Title || "Untitled World";
  const mainCharacter = formData?.["Main Character"] || "Unknown hero";
  const world = formData?.World || "A mysterious world";
  const style = formData?.Style || "cinematic and immersive";

  // =========================
  // RULES
  // =========================
  const rules = `
- Do not explain anything
- Do not describe your process
- Output only the final story
- Write in a ${style} style
`.trim();

  // =========================
  // INPUT BLOCK
  // =========================
  const input = `
Title: ${title}
Main Character: ${mainCharacter}
World: ${world}
`.trim();

  // =========================
  // STORY REQUIREMENTS
  // =========================
  const requirements = `
- Create a strong opening hook
- Develop a rich fantasy world
- Include emotional character development
- Add conflict and resolution
- Make the story engaging and cinematic
`.trim();

  // =========================
  // FINAL PROMPT
  // =========================
  return `
You are a professional fantasy novelist.

Write a high-quality fantasy story based on the input below.

IMPORTANT RULES:
${rules}

INPUT:
${input}

STORY REQUIREMENTS:
${requirements}

Now write the full fantasy story.
`.trim();
};
