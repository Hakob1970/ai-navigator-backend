/**
 * ✍️ Editor Revision Engine
 *
 * Применяет одобренные редакторские изменения
 * к структуре проекта.
 *
 * Не генерирует текст.
 * Только изменяет архитектурные элементы.
 */


class EditorRevisionEngine {


    static revise(project, proposal) {


        if (!project || !proposal) {
            return project;
        }



        switch(proposal.type) {



            // =========================
            // 🧩 STORY LOGIC
            // =========================

            case "story_logic_update":


                this.applyStoryLogic(
                    project,
                    proposal
                );

                break;



            // =========================
            // 🧠 MEMORY
            // =========================

            case "memory_update":


                this.applyMemory(
                    project,
                    proposal
                );

                break;



            // =========================
            // 🎭 CHARACTER
            // =========================

            case "character_update":


                this.applyCharacter(
                    project,
                    proposal
                );

                break;



            // =========================
            // 🎬 SCENE
            // =========================

            case "scene_update":


                this.applyScene(
                    project,
                    proposal
                );

                break;



        }



        return project;

    }





    // =========================
    // STORY LOGIC
    // =========================


    static applyStoryLogic(
        project,
        proposal
    ) {


        if (
            !project.storyArchitecture
        ) {

            project.storyArchitecture = {};

        }



        if (
            !project.storyArchitecture.revisions
        ) {

            project.storyArchitecture.revisions = [];

        }



        project.storyArchitecture.revisions.push({

            target:
                proposal.target,


            instruction:
                proposal.change,


            revisedAt:
                new Date().toISOString()

        });


    }






    // =========================
    // MEMORY
    // =========================


    static applyMemory(
        project,
        proposal
    ) {


        if (
            !project.memory
        ) {

            project.memory = {};

        }



        if (
            !project.memory.revisions
        ) {

            project.memory.revisions = [];

        }



        project.memory.revisions.push({

            target:
                proposal.target,


            instruction:
                proposal.change,


            revisedAt:
                new Date().toISOString()

        });


    }






    // =========================
    // CHARACTER
    // =========================


    static applyCharacter(
        project,
        proposal
    ) {


        if (
            !project.characters
        ) {

            return;

        }


        project.characters.forEach(
            character => {


                if (
                    character.name === proposal.character
                ) {


                    if (
                        !character.editorNotes
                    ) {

                        character.editorNotes = [];

                    }



                    character.editorNotes.push({

                        target:
                            proposal.target,


                        instruction:
                            proposal.change,


                        revisedAt:
                            new Date().toISOString()

                    });


                }


            }
        );


    }






    // =========================
    // SCENE
    // =========================


    static applyScene(
        project,
        proposal
    ) {


        if (
            !project.scenes
        ) {

            return;

        }


        project.scenes.forEach(
            scene => {


                if (
                    scene.id === proposal.scene
                ) {


                    if (
                        !scene.editorNotes
                    ) {

                        scene.editorNotes = [];

                    }



                    scene.editorNotes.push({

                        target:
                            proposal.target,


                        instruction:
                            proposal.change,


                        revisedAt:
                            new Date().toISOString()

                    });


                }


            }
        );


    }



}



module.exports =
    EditorRevisionEngine;
