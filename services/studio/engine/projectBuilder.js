const BookProject = require("./types");
const { ENGINE_MODES } = require("./constants");

/**
 * 🏗️ ProjectBuilder
 * Создаёт BookProject из входных данных формы
 */

class ProjectBuilder {

    static create(input = {}) {

        const now = new Date().toISOString();

        const project = JSON.parse(JSON.stringify(BookProject));

        // =========================
        // 📌 METADATA
        // =========================
        project.metadata.id = this._generateId();
        project.metadata.title = input.title || "Untitled Book";
        project.metadata.createdAt = now;
        project.metadata.updatedAt = now;
        project.metadata.author.name = input.author || "";

        // =========================
        // 🧠 ENGINE
        // =========================
        project.engine.mode = input.mode || ENGINE_MODES.BOOK;

        // =========================
        // ⚙️ SETTINGS
        // =========================
        project.settings.genre = input.genre || "fantasy";
        project.settings.subGenre = input.subGenre || "";
        project.settings.language = input.language || "en";
        project.settings.tone = input.tone || "neutral";
        project.settings.style = input.style || "novel";
        project.settings.targetAudience = input.targetAudience || "adult";

        if (input.chapters) {
            project.settings.length.chapters = input.chapters;
        }

        // =========================
        // 🌍 WORLD (минимально)
        // =========================
        project.world.name = input.worldName || "";
        project.world.description = input.worldDescription || "";

        // =========================
        // 🔄 INITIAL STATE
        // =========================
        project.generation.currentStep = "initialized";
        project.generation.status = "idle";

        return project;
    }

    static _generateId() {
        return "book_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    }
}

module.exports = ProjectBuilder;
