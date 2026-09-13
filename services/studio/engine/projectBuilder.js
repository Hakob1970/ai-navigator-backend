const BookProject = require("./types");
const { ENGINE_MODES } = require("./constants");
const STORY_TEMPLATES =
    require("./storyTemplates");

/**
 * 🏗️ ProjectBuilder
 * Создаёт BookProject из входных данных
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

        project.metadata.author.name =
            input.author || "";


        // =========================
        // 🧠 ENGINE
        // =========================
        project.engine.mode =
            input.mode || ENGINE_MODES.BOOK;


        // =========================
        // ⚙️ SETTINGS
        // =========================
        project.settings.genre =
            input.genre || "fantasy";

        project.settings.subGenre =
            input.subGenre || "";

        project.settings.language =
            input.language || "en";

        project.settings.tone =
            input.tone || "neutral";

        project.settings.style =
            input.style || "novel";


        project.settings.targetAudience =
            input.targetAudience || "adult";


        if (input.chapters) {
            project.settings.length.chapters =
                input.chapters;
        }


        // =========================
        // 🌍 WORLD
        // =========================
        project.world.name =
            input.world || "";

        project.world.description =
            input.worldDescription || "";


        // =========================
        // 💡 IDEA
        // =========================
        project.idea.title =
            input.title || "Untitled Idea";

        project.idea.summary =
            input.idea || "";

        project.idea.inspiration =
            input.world || "";

        project.idea.keywords =
            input.keywords || [];




        // =========================
        // 🧩 STORY ARCHITECTURE
        // =========================

const customStory =
    typeof input.customStory === "string"
        ? input.customStory.trim()
        : "";

const selectedTemplate =
    input.storyTemplate &&
    STORY_TEMPLATES[input.storyTemplate]
        ? STORY_TEMPLATES[input.storyTemplate]
        : null;


// CUSTOM STORY HAS PRIORITY
if (customStory) {

    project.storyArchitecture.storyType =
        "custom";

    project.storyArchitecture.storyTemplate =
        "";

    project.storyArchitecture.customStory =
        customStory;

}


// TEMPLATE
else if (selectedTemplate) {

    project.storyArchitecture.storyType =
        "template";

    project.storyArchitecture.storyTemplate =
        selectedTemplate.id;

    project.storyArchitecture.customStory =
        "";

}


// DEFAULT
else {

    project.storyArchitecture.storyType =
        "template";

    project.storyArchitecture.storyTemplate =
        "";

    project.storyArchitecture.customStory =
        "";

}


project.storyArchitecture.theme =
    input.theme ||
    `Exploring human conflicts in ${project.settings.genre} world`;


project.storyArchitecture.premise =
    input.premise ||
    (
        customStory ||
        selectedTemplate?.description ||
        `${project.settings.genre} story set in ${project.world.name}`
    );


                  // =========================
                  // 🧩 TEMPLATE → ACTS
                 // =========================

          if (selectedTemplate && !customStory) {

              project.storyArchitecture.acts = {

                  act1: {
                      title:
                          selectedTemplate.acts?.act1?.title || "",
                      summary:
                          selectedTemplate.acts?.act1?.summary || ""
                  },

                  act2: {
                      title:
                          selectedTemplate.acts?.act2?.title || "",
                      summary:
                          selectedTemplate.acts?.act2?.summary || ""
                  },

                  act3: {
                      title:
                          selectedTemplate.acts?.act3?.title || "",
                      summary:
                          selectedTemplate.acts?.act3?.summary || ""
                  }

              };

          }



         // =========================
        // 🧩 OUTLINE
        // =========================
        project.outline.premise =
            project.storyArchitecture.premise;


                  project.outline.acts = [
              {
                  title:
                      project.storyArchitecture.acts.act1.title,

                  summary:
                      project.storyArchitecture.acts.act1.summary
              },

              {
                  title:
                      project.storyArchitecture.acts.act2.title,

                  summary:
                      project.storyArchitecture.acts.act2.summary
              },

              {
                  title:
                      project.storyArchitecture.acts.act3.title,

                  summary:
                      project.storyArchitecture.acts.act3.summary
              }
          ];


         // =========================
        // 👤 CHARACTERS
        // =========================
        if (input.characters && Array.isArray(input.characters)) {

            project.characters =
                input.characters.map((character, index) => {

                    return this._createCharacter({

    ...character,

    id:
        "char_" +
        Date.now() +
        "_" +
        index

});

 });

}

          else {

    project.characters = [];

}

         // =========================
        // 🎬 SCENES
        // =========================
        if (input.scenes && Array.isArray(input.scenes)) {

            project.scenes =
                input.scenes.map((scene, index) => {

                    return {

    id:
        "scene_" +
        Date.now() +
        "_" +
        index,


    // 📖 STRUCTURE

    chapter:
        scene.chapter || 1,

    order:
        scene.order || index + 1,


    // 🎬 BASIC INFO

    title:
        scene.title || "",

    location:
        scene.location || "",

    time:
        scene.time || "",


    // 👥 CHARACTERS

    characters:
        (scene.characters || []).map(characterName => {

            const found =
                project.characters.find(
                    character =>
                        character.name === characterName
                );

            return found
                ? found.id
                : characterName;

        }),


    pov:
        scene.pov || "",


    // 🎭 STORY PURPOSE

    purpose:
        scene.purpose || "",

    goal:
        scene.goal || "",

   decision:
    scene.decision || "",


    obstacle:
        scene.obstacle || "",


    // ⚔️ CONFLICT

    conflict:
        scene.conflict || "",

    tensionLevel:
        scene.tensionLevel || 0,


    // ❤️ EMOTION

    emotionalBeat:
        scene.emotionalBeat || "",

    atmosphere:
        scene.atmosphere || "",


    // 📝 CONTENT

    summary:
        scene.summary || "",

    importantEvents:
        scene.importantEvents || [],

    dialoguePoints:
        scene.dialoguePoints || [],


    // 🎯 RESULT

    outcome:
        scene.outcome || "",

     // 🧠 SCENE INTELLIGENCE

    change:
        scene.change || "",

    consequence:
        scene.consequence || "",


    // ❤️ EMOTIONAL MOVEMENT

    emotionalShift:
        scene.emotionalShift || "",



    status:
        scene.status || "planned"

};
         });
        }



           // =========================
           // 🏁 ENDING
           // =========================

            project.ending.type =
                input.endingType || "closed";

            project.ending.summary =
                input.endingSummary ||
                "The story reaches its final resolution after the main conflict.";

            project.ending.themeResolution =
                input.themeResolution ||
                "The central theme is resolved through the ending.";

            project.ending.worldImpact =
                input.worldImpact ||
                "The events of the story leave a lasting impact on the world.";

            project.ending.finalScene =
                input.finalScene ||
                "The final scene concludes the journey of the main characters.";

            project.ending.emotionalTone =
                input.emotionalTone || "hopeful";

            project.ending.generated = false;


           // =========================
           // 🧠 MEMORY
           // =========================

            project.memory.characterMemory =
                project.characters.map(character => ({

                    characterId: character.id,
                    name: character.name,

                    knownFacts: [],
                    goals: [],
                    fears: [],

                   status: "active"

              }));


               // =========================
               // 🤝 RELATIONSHIPS
              // =========================

             project.memory.relationships = [];

             for (let i = 0; i < project.characters.length; i++) {

                 for (let j = i + 1; j < project.characters.length; j++) {

                     project.memory.relationships.push({

                         from:
                             project.characters[i].id,

                         to:
                            project.characters[j].id,

                         type:
                             "unknown",

                        status:
                              "active",

                        history: []

        });

    }

}


                 // =========================
                 // 🧵 PLOT THREADS
                 // =========================

     project.memory.plotThreads = [

    {
        id:
            "thread_" +
            Date.now() +
            "_0",

        title:
            "Main Story Conflict",

        description:
            "The central conflict that drives the story.",

        type:
            "main",

        status:
            "active",

        importance:
            "high",

        relatedCharacters:
            project.characters.map(character => character.id),

        events: []

    },


    {
        id:
            "thread_" +
            Date.now() +
            "_1",

        title:
            "Character Development",

        description:
            "The personal growth journey of the main characters.",

        type:
            "character",

        status:
            "active",

        importance:
            "medium",

        relatedCharacters:
            project.characters.map(character => character.id),

        events: []

    }

];

             // =========================
            // ❓ UNRESOLVED THREADS
            // =========================

       project.memory.unresolvedThreads = [

    {
        id:
            "question_" +
            Date.now() +
            "_0",

        question:
            "What is the main mystery of the story?",

        relatedThread:
            project.memory.plotThreads[0]
                ? project.memory.plotThreads[0].id
                : null,

        status:
            "open",

        importance:
            "high",

        revealedInChapter:
            null
    }

];


           // =========================
          // 🔐 REVEALED SECRETS
          // =========================

   project.memory.revealedSecrets = [

    {
        id:
            "secret_" +
            Date.now() +
            "_0",

        title:
            "Hidden Truth",

        description:
            "A secret that affects the direction of the story.",

        status:
            "hidden",

        importance:
            "high",

        discoveredBy:
            [],

        revealedInChapter:
            null,

        consequences:
            []

    }

];


        // =========================
        // ⭐ IMPORTANT EVENTS
       // =========================

    project.memory.importantEvents = [

    {
        id:
            "event_" +
            Date.now() +
            "_0",

        title:
            "Story Beginning",

        description:
            "The event that starts the main journey.",

        chapter:
            1,

        type:
            "major",

        importance:
            "high",

        characters:
            project.characters.map(character => character.id),

        consequences:
            []

    }

];




        // =========================
        // 🔄 STATE
        // =========================
        project.generation.currentStep =
            "initialized";

        project.generation.status =
            "idle";


        return project;
    }



         // =========================
         // 👤 CREATE CHARACTER
         // =========================

           static _createCharacter(data = {}) {

               return {

                    id:
                      data.id ||
            (
                "char_" +
                Date.now() +
                "_" +
                Math.floor(Math.random() * 10000)
            ),

        name:
            data.name || "",

        role:
            data.role || "unknown",

        personality:
            data.personality || {
                traits: [],
                strengths: [],
                weaknesses: []
            },

        background:
            data.background || {
                history: "",
                origin: ""
            },

        motivation:
            data.motivation || {
                goal: "",
                fear: ""
            },

        conflict:
            data.conflict || {
                internal: "",
                external: ""
            },

        development:
            data.development || {
                arc: ""
            }
    };
}



          // =========================
         // 👤 CHARACTER ID
        // =========================

         static _generateCharacterId() {

             return (
                "char_" +
                Date.now() +
                "_" +
               Math.floor(Math.random() * 10000)
            );

}


         // =========================
         // 📖 BOOK ID
        // =========================

         static _generateId() {

             return (
                "book_" +
                Date.now() +
                "_" +
                Math.floor(Math.random() * 10000)
            );

        }

       }




module.exports = ProjectBuilder;
