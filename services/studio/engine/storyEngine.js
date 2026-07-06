// services/studio/engine/storyEngine.js

const ProjectBuilder = require("./projectBuilder");
const promptBuilder = require("../promptBuilder");
const OpenRouter = require("../ai/openrouter");

class StoryEngine {

    static async start(input) {

        // 1. Создаём проект
        const project = ProjectBuilder.create(input);

        project.generation.status = "generating";
        project.generation.currentStep = "prompt";

        // 2. Строим prompt
        const prompt = promptBuilder.build({
            mode: project.settings.genre,
            formData: input
        });

        project.generation.lastPrompt = prompt;

        // 3. Генерируем через AI
        const result = await OpenRouter.generate({
            prompt,
            memory: project.memory
        });

        // 4. Сохраняем результат
        project.generation.lastResponse = result;

        project.chapters.push({
            index: 1,
            title: project.metadata.title,
            content: result
        });

        project.generation.status = "completed";
        project.generation.currentStep = null;

        return project;
    }
}

module.exports = StoryEngine;
