// services/studio/engine/storyEngine.js

const ProjectBuilder = require("./projectBuilder");
const OpenRouter = require("../ai/openrouter"); // твой AI слой
const promptBuilder = require("../promptBuilder"); // уже существующий

/**
 * 🧠 StoryEngine
 * Главный мозг Writer Studio
 */

class StoryEngine {

    /**
     * 🚀 start()
     * Запуск генерации книги
     */
    static async start(input) {

        // 1. 📦 создаём BookProject
        const project = ProjectBuilder.create(input);

        project.generation.status = "generating";
        project.generation.currentStep = "world";

        // 2. 🌍 WORLD STEP
        await this._buildWorld(project);

        // 3. 👤 CHARACTERS STEP
        await this._buildCharacters(project);

        // 4. 🗺️ PLOT STEP
        await this._buildPlot(project);

        // 5. 📖 CHAPTERS STEP
        await this._buildChapters(project);

        project.generation.status = "completed";
        project.generation.currentStep = null;

        return project;
    }

    // =========================
    // 🌍 WORLD
    // =========================
    static async _buildWorld(project) {

        project.generation.currentStep = "world";

        const prompt = promptBuilder.buildWorld(project);

        project.generation.lastPrompt = prompt;

        const response = await OpenRouter.generate(prompt);

        project.world.description = response;

        project.generation.lastResponse = response;

        return project;
    }

    // =========================
    // 👤 CHARACTERS
    // =========================
    static async _buildCharacters(project) {

        project.generation.currentStep = "characters";

        const prompt = promptBuilder.buildCharacters(project);

        const response = await OpenRouter.generate(prompt);

        try {
            project.characters = JSON.parse(response);
        } catch (e) {
            project.characters = [];
        }

        return project;
    }

    // =========================
    // 🗺️ PLOT
    // =========================
    static async _buildPlot(project) {

        project.generation.currentStep = "plot";

        const prompt = promptBuilder.buildPlot(project);

        const response = await OpenRouter.generate(prompt);

        try {
            project.outline = JSON.parse(response);
        } catch (e) {
            project.outline = { premise: response, acts: [] };
        }

        return project;
    }

    // =========================
    // 📖 CHAPTERS
    // =========================
    static async _buildChapters(project) {

        project.generation.currentStep = "chapters";

        const prompt = promptBuilder.buildChapters(project);

        const response = await OpenRouter.generate(prompt);

        try {
            project.chapters = JSON.parse(response);
        } catch (e) {
            project.chapters = [{
                index: 1,
                title: "Chapter 1",
                content: response
            }];
        }

        return project;
    }
}

module.exports = StoryEngine;
