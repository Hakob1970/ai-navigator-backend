/**
 * 🧠 Improvement Executor
 *
 * Превращает Improvement Tasks
 * в конкретные предложения изменений.
 *
 * НЕ изменяет проект напрямую.
 * Создает Change Proposal.
 */

const PriorityService =
    require("./priorityService");



class ImprovementExecutor {


    static createProposals(project, tasks) {


        const proposals = [];


        if (!tasks || !Array.isArray(tasks)) {
            return proposals;
        }



        tasks.forEach(task => {


            let proposal = null;



            // =========================
            // 🎭 CHARACTER IMPROVEMENT
            // =========================

            if (
                task.type === "character"
            ) {


                proposal = {

                    type:
                        "character_update",


                    character:
                        task.character,


                    target:
                        task.target,


                    change:


                        this.characterSuggestion(
                            task.target,
                            task.character
                        ),


                    status:
                        "waiting_approval"

                };

            }





            // =========================
            // 🎭 CHARACTER EVIDENCE
            // =========================

            else if (
                task.type === "character_evidence"
            ) {


                proposal = {


                    type:
                        "scene_character_evidence",


                    character:
                        task.character,


                    change:

                        `Create meaningful scenes showing ${task.character} through actions, decisions and dialogue.`,


                    status:
                        "waiting_approval"

                };

            }





            // =========================
            // ⚔️ CHARACTER ACTION
            // =========================

            else if (
                task.type === "character_action"
            ) {


                proposal = {


                    type:
                        "character_action_update",


                    character:
                        task.character,


                    change:

                        `Create important decisions for ${task.character} that influence story events and create consequences.`,


                    status:
                        "waiting_approval"

                };

            }





            // =========================
            // 🎬 SCENE
            // =========================

            else if (
                task.type === "scene"
            ) {


                proposal = {


                    type:
                        "scene_update",


                    scene:
                        task.scene,


                    target:
                        task.target,


                    change:

                        this.sceneSuggestion(task.target),


                    status:
                        "waiting_approval"

                };

            }





            // =========================
            // 🧩 STORY LOGIC
            // =========================

            else if (
                task.type === "story_logic"
            ) {


                proposal = {


                    type:
                        "story_logic_update",


                    target:
                        task.target,


                    change:

                        "Strengthen cause-and-effect relationships and connect events with character motivations.",


                    status:
                        "waiting_approval"

                };

            }





            // =========================
            // 🧠 MEMORY / CONTINUITY
            // =========================

            else if (
    task.type === "memory"
) {


    proposal = {


        type:
            "memory_update",


        target:
            task.target,


        change:

            "Create memory records to preserve important events, consequences, secrets and character knowledge changes.",


        status:
            "waiting_approval"

    };

}



else if (
    task.type === "continuity"
) {


    proposal = {


        type:
            "continuity_update",


        target:
            task.target,


        change:

            "Improve story continuity by maintaining timeline consistency, world rules and connections between past events and future consequences.",


        status:
            "waiting_approval"

    };

}



            if (proposal) {

                proposals.push({


                   id:
            "proposal_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 1000
            ),


            taskId:
                task.taskId,

           issueId:
                task.issueId,

                    ...proposal,

                    priority:

 PriorityService.getLevel(
     task.priority || task.priorityScore
 ),

priorityScore:
    task.priority || task.priorityScore || 0,

        createdAt:
            new Date().toISOString(),


        approvedAt:
            null,


        rejectedAt:
            null,


        editorNote:
            null

                });

            }


        });

          proposals.sort(
    (a, b) => {

        const scoreA =
            a.priorityScore || 0;

        const scoreB =
            b.priorityScore || 0;

        return scoreB - scoreA;

    }
);



        return proposals;

    }






    // =========================
    // CHARACTER HELPERS
    // =========================


    static characterSuggestion(target, character) {


        const suggestions = {


            "background history":

                `${character} needs a deeper personal history explaining past experiences, motivations and important life events.`,



            "external conflict":

                `${character} needs stronger external obstacles that challenge goals and force meaningful choices.`,



            "internal conflict":

                `${character} needs an internal struggle between desires, fears and responsibilities.`,



            "character arc":

                `${character} needs a transformation path showing how experiences change the character.`,



            "personal goal":

                `${character} needs a clear personal objective driving decisions.`,



            "fear":

                `${character} needs a meaningful fear influencing behavior and choices.`,



            "personality traits":

                `${character} needs distinctive traits demonstrated through actions and dialogue.`


        };


        return suggestions[target] ||
            `Improve ${target} for ${character}.`;

    }



         static sceneSuggestion(target) {

    const suggestions = {


        "scene goal":

            "Clarify what each character wants, what prevents them from achieving it, and why the scene matters.",


        "conflict":

            "Increase tension by creating opposing goals, obstacles and meaningful choices.",


        "scene outcome":

            "Create a clear result that changes the situation and moves the story forward.",


        "character decision":

            "Add a meaningful choice that reveals character values and creates consequences.",


        "scene change":

            "Ensure the scene changes characters, relationships or the direction of the story.",


        "future consequence":

            "Connect the scene event with future consequences that influence later chapters.",


        "emotional shift":

            "Show how emotions change through actions, dialogue and character experiences."

    };


    return suggestions[target] ||
        `Improve ${target} in scene.`;

}



}


module.exports = ImprovementExecutor;
