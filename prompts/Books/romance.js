module.exports = (formData) => {

const title = formData?.title || "Untitled Love Story";
const mainCharacter = formData?.mainCharacter || "Unknown character";
const world = formData?.world || "A world of emotions and relationships";
const style = formData?.style || "emotional and cinematic";
const improvements =
    formData?.improvements || null;

const ImprovementService =
    require("../../services/studio/improvementService");


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
- Create deep and realistic characters
- Develop meaningful relationships between characters
- Show emotions, feelings and inner conflicts
- Include challenges that test the characters
- Create emotional turning points
- Show personal growth and transformation
- Build a strong connection between characters
- Make the story engaging and cinematic
`.trim();


// =========================
// 🛠️ IMPROVEMENTS
// =========================

let improvementBlock = "";

if (improvements) {

    improvementBlock = `

${ImprovementService.toPrompt(
    improvements
)}

`;

}

// =========================
// FINAL PROMPT
// =========================
return `
You are a professional romance novelist.

Write a high-quality romantic story based on the input below.

IMPORTANT RULES:
${rules}

INPUT:
${input}

${input}

${improvementBlock}

STORY REQUIREMENTS:
${requirements}

Begin the story now.
`;

};
