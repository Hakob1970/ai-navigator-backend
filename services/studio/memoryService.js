/**
 * 🧠 MemoryService
 * Управление памятью книги Writer Studio
 */

class MemoryService {


    /**
     * Инициализация памяти проекта
     */
    static initialize(project) {

    if (!project.memory) {

        project.memory = {};

    }


    project.memory.globalFacts =
        project.memory.globalFacts || [];


    project.memory.timeline =
        project.memory.timeline || [];


    project.memory.conflicts =
        project.memory.conflicts || [];


    project.memory.characterMemory =
        project.memory.characterMemory || [];


    project.memory.relationships =
        project.memory.relationships || [];


    project.memory.importantEvents =
        project.memory.importantEvents || [];


    project.memory.plotThreads =
        project.memory.plotThreads || [];


    project.memory.revealedSecrets =
        project.memory.revealedSecrets || [];


    project.memory.unresolvedThreads =
        project.memory.unresolvedThreads || [];


    return project.memory;
}



    /**
     * Добавить общий факт о мире/книге
     */
    static addFact(project, fact) {

        this.initialize(project);


        if (!fact) {
            return;
        }


        project.memory.globalFacts.push({

            id: this._generateId(),

            text: fact,

            createdAt:
                new Date().toISOString()
        });


        return project.memory.globalFacts;
    }



    /**
     * Добавить событие в хронологию
     */
    static addTimelineEvent(project, event) {

        this.initialize(project);


        if (!event) {
            return;
        }


        project.memory.timeline.push({

            id: this._generateId(),

            event,

            createdAt:
                new Date().toISOString()
        });


        return project.memory.timeline;
    }



    /**
     * Добавить конфликт
     */
    static addConflict(project, conflict) {

        this.initialize(project);


        if (!conflict) {
            return;
        }


        project.memory.conflicts.push({

            id: this._generateId(),

            conflict,

            createdAt:
                new Date().toISOString()
        });


        return project.memory.conflicts;
    }


     
         /**
     * Добавить важное событие
     */
    static addImportantEvent(project, event = {}) {

        this.initialize(project);


        project.memory.importantEvents.push({

            id:
                "event_" +
                Date.now() +
                "_" +
                Math.floor(Math.random() * 10000),

            title:
                event.title || "",

            description:
                event.description || "",

            chapter:
                event.chapter || null,

            type:
                event.type || "major",

            importance:
                event.importance || "medium",

            characters:
                event.characters || [],

            consequences:
                event.consequences || []

        });


        return project.memory.importantEvents;
    }



    /**
     * Добавить сюжетную линию
     */
    static addPlotThread(project, thread = {}) {

        this.initialize(project);


        project.memory.plotThreads.push({

            id:
                "thread_" +
                Date.now() +
                "_" +
                Math.floor(Math.random() * 10000),

            title:
                thread.title || "",

            description:
                thread.description || "",

            type:
                thread.type || "main",

            status:
                thread.status || "active",

            importance:
                thread.importance || "medium",

            relatedCharacters:
                thread.relatedCharacters || [],

            events:
                thread.events || []

        });


        return project.memory.plotThreads;
    }



    /**
     * Получить всю память проекта
     */
    static getMemory(project) {

        this.initialize(project);


        return project.memory;
    }



    /**
     * Генерация ID
     */
    static _generateId() {

        return (
            "memory_" +
            Date.now() +
            "_" +
            Math.floor(Math.random() * 10000)
        );
    }

}


module.exports = MemoryService;
