module.exports = (formData) => {

const title = formData?.title || "Untitled Historical Story";
const mainCharacter = formData?.mainCharacter || "Unknown historical figure";
const world = formData?.world || "A forgotten era of history";
const style = formData?.style || "cinematic and immersive";
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
- Create a realistic historical atmosphere
- Describe the culture, society and traditions of the era
- Develop believable historical characters
- Include political, social and personal conflicts
- Show how historical events affect human lives
- Balance historical details with creative storytelling
- Create emotional character development
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
You are a professional historical novelist.

Write a high-quality historical story based on the input below.

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
