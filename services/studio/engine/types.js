// services/studio/engine/types.js

/**
 * 📖 BookProject — главный объект Writer Studio
 * Это единая структура всей книги
 */

const BookProject = {
    
    // =========================
    // 📌 METADATA
    // =========================
    metadata: {
        id: null,
        title: "",
        createdAt: null,
        updatedAt: null,

        author: {
            name: "",
            id: null
        },

        version: 1
    },

    engine: {
    mode: "book"
},

    // =========================
    // ⚙️ SETTINGS
    // =========================
    settings: {
        genre: "fantasy",
        subGenre: "",

        language: "en",
        tone: "neutral",
        style: "novel",

        targetAudience: "adult",

        length: {
            type: "medium",
            chapters: 10
        }
    },

    // =========================
    // 🌍 WORLD
    // =========================
    world: {
        name: "",
        description: "",

        rules: [],
        magicSystem: "",
        technologyLevel: "",

        locations: []
    },

    // =========================
    // 👤 CHARACTERS
    // =========================
    characters: [],

    // =========================
    // 🗺️ OUTLINE
    // =========================
    outline: {
        premise: "",
        acts: []
    },

    // =========================
    // 📖 CHAPTERS
    // =========================
    chapters: [],

    // =========================
    // 🧠 MEMORY
    // =========================
    memory: {
        globalFacts: [],
        timeline: [],
        conflicts: []
    },

    // =========================
    // 🔄 GENERATION STATE
    // =========================
    generation: {
        currentStep: null,
        status: "idle", // idle | generating | completed | error

        lastPrompt: "",
        lastResponse: ""
    }
};

module.exports = BookProject;
