/**
 * 📖 BookProject — главный объект Writer Studio
 * Единая структура всей книги
 */

const BookProject = {

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


    world: {
        name: "",
        description: "",

        rules: [],
        magicSystem: "",
        technologyLevel: "",

        locations: []
    },


    characters: [],


    outline: {
        premise: "",
        acts: []
    },


    chapters: [],


    memory: {
        globalFacts: [],
        timeline: [],
        conflicts: []
    },


    generation: {
        currentStep: null,
        status: "idle",

        lastPrompt: "",
        lastResponse: ""
    }
};


module.exports = BookProject;
