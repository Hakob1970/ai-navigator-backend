module.exports = (formData) => {

  const title = formData?.Title || "Untitled World";
  const mainCharacter = formData?.["Main Character"] || "Unknown hero";
  const world = formData?.World || "A mysterious world";
  const style = formData?.Style || "cinematic and immersive";

  return `
You are a professional fantasy novelist.

Write a high-quality fantasy story based on the input below.

IMPORTANT RULES:
- Do not explain anything
- Do not describe your process
- Output only the final story
- Write in a ${style} style

INPUT:
Title: ${title}
Main Character: ${mainCharacter}
World: ${world}

STORY REQUIREMENTS:
- Create a strong opening hook
- Develop a rich fantasy world
- Include emotional character development
- Add conflict and resolution
- Make the story engaging and cinematic

Now write the full fantasy story.
`.trim();

};
