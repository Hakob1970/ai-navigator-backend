/**
 * ✋ Improvement Applier
 *
 * Руки редактора.
 *
 * Применяет только APPROVED proposals.
 *
 * Не создает предложения.
 * Не анализирует книгу.
 * Только выполняет утвержденные изменения.
 */


class ImprovementApplier {



    static apply(project, proposal) {


        if (
            !project ||
            !proposal
        ) {

            return project;

        }



        if (
            proposal.status !== "approved"
        ) {

            return project;

        }




        // =========================
        // 🧩 STORY LOGIC
        // =========================


        if (
            proposal.type ===
            "story_logic_update"
        ) {


            if (
                !project.storyArchitecture
            ) {

                project.storyArchitecture = {};

            }



            if (
                !project.storyArchitecture.editorNotes
            ) {

                project.storyArchitecture.editorNotes = [];

            }



            project.storyArchitecture.editorNotes.push({

                target:
                    proposal.target,


                change:
                    proposal.change,


                appliedAt:
                    new Date().toISOString()

            });


        }






        // =========================
        // 🧠 MEMORY
        // =========================


        else if (
            proposal.type ===
            "memory_update"
        ) {


            if (
                !project.memory
            ) {

                project.memory = {};

            }



            if (
                !project.memory.editorNotes
            ) {

                project.memory.editorNotes = [];

            }



            project.memory.editorNotes.push({

                target:
                    proposal.target,


                change:
                    proposal.change,


                appliedAt:
                    new Date().toISOString()

            });


        }







        // =========================
        // 🔄 CONTINUITY
        // =========================


        else if (
            proposal.type ===
            "continuity_update"
        ) {


            if (
                !project.continuity
            ) {

                project.continuity = {};

            }



            if (
                !project.continuity.editorNotes
            ) {

                project.continuity.editorNotes = [];

            }



            project.continuity.editorNotes.push({

                target:
                    proposal.target,


                change:
                    proposal.change,


                appliedAt:
                    new Date().toISOString()

            });


        }




        return project;


    }



}


module.exports =
    ImprovementApplier;
