module.exports = (formData) => {

const title = formData?.title || "Untitled Mystery";
const mainCharacter = formData?.mainCharacter || "Unknown investigator";
const world = formData?.world || "A mysterious place full of secrets";
const style = formData?.style || "cinematic and suspenseful";
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
- Create a strong mystery from the beginning
- Build suspense and emotional tension
- Develop a complex investigation
- Include secrets, clues and unexpected discoveries
- Create believable characters with hidden motives
- Add twists and surprising revelations
- Keep the reader curious until the end
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
You are a professional mystery and detective novelist.

Write a high-quality mystery story based on the input below.

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
