module.exports = (formData) => {

const title = formData?.title || "Untitled Space Story";
const mainCharacter = formData?.mainCharacter || "Unknown explorer";
const world = formData?.world || "A distant future civilization";
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
- Create a believable science fiction universe
- Develop advanced technologies and civilizations
- Explore the relationship between humanity and technology
- Include discoveries, conflicts and challenges
- Create emotional character development
- Add mystery and philosophical questions
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
You are a professional science fiction novelist.

Write a high-quality sci-fi story based on the input below.

IMPORTANT RULES:
${rules}

INPUT:
${input}


${improvementBlock}

STORY REQUIREMENTS:
${requirements}

Begin the story now.
`;

};
