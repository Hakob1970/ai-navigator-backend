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


    idea: {
        title: "",
        summary: "",
        inspiration: "",

        keywords: []
    },


    world: {

    name: "",

    description: "",


    era: "",


    geography: {

        regions: [],

        climate: "",

        importantPlaces: []

    },


    society: {

        cultures: [],

        governments: [],

        traditions: [],

        conflicts: []

    },


    rules: [],


    magicSystem: {

        enabled: false,

        description: "",

        limitations: []

    },


    technologyLevel: "",


    history: {

        events: [],

        wars: [],

        legends: []

    },


    locations: []

},


    characters: [],


    storyArchitecture: {

        theme: "",
        premise: "",

        acts: {

            act1: {
                title: "",
                summary: ""
            },

            act2: {
                title: "",
                summary: ""
            },

            act3: {
                title: "",
                summary: ""
            }
        },

        conflicts: {
            internal: [],
            external: []
        }
    },


    outline: {
        premise: "",
        acts: []
    },


    chapters: [],

        scenes: [],

    ending: {

    // тип концовки
    type: "",

    // краткое описание финала
    summary: "",

    // основная идея/мораль
    themeResolution: "",

    // судьба главных персонажей
    characterOutcomes: [],

    // последствия для мира
    worldImpact: "",

    // финальная сцена
    finalScene: "",

    // эмоциональный эффект
    emotionalTone: "",

    // сгенерирована ли концовка
    generated: false
},


    memory: {

    // факты, которые нельзя нарушать
    globalFacts: [],

    // хронология событий
    timeline: [],

    // активные конфликты
    conflicts: [],

    // память о персонажах
    characterMemory: [],

    // отношения между персонажами
    relationships: [],

    // важные события
    importantEvents: [],

    // сюжетные линии
    plotThreads: [],

    // раскрытые тайны
    revealedSecrets: [],

    // незавершённые сюжетные линии
    unresolvedThreads: []
},


    generation: {
        currentStep: null,
        status: "idle",

        lastPrompt: "",
        lastResponse: ""
    }
};


module.exports = BookProject;
