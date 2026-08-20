/**
 * 🛠 Improvement Planner
 * Превращает рекомендации ОТК
 * в конкретные задачи для StoryEngine.
 */

const TaskPriorityEngine =
require("./taskPriorityEngine");


class ImprovementPlanner {

    static createTasks(project, improvements) {

        const tasks = [];

        if (!improvements) {
            return tasks;
        }

        // =========================
        // 🎭 CHARACTERS
        // =========================

        if (
            improvements.characters &&
            improvements.characters.actions
        ) {

            improvements.characters.actions.forEach(
                action => {

                    if (
                        action.missing
                    ) {

                        action.missing.forEach(
                            missing => {

                                tasks.push({

                                    type:
                                        "character",

                                    character:
                                        action.character,

                                    target:
                                        missing,

                                    task:
                                        `Improve ${missing} for ${action.character}`

                                });

                            }
                        );

                    }

                }
            );

        }

        // =========================
        // 🎬 SCENES
        // =========================

        if (
            improvements.sceneAnalysis &&
            improvements.sceneAnalysis.actions
        ) {

            improvements.sceneAnalysis.actions.forEach(
                scene => {

                    if (
                        scene.missing
                    ) {

                        scene.missing.forEach(
                            missing => {

                                tasks.push({

                                    type:
                                        "scene",

                                    scene:
                                        scene.scene,

                                    target:
                                        missing,

                                    task:
                                        `Improve ${missing} in scene ${scene.scene}`

                                });

                            }
                        );

                    }

                }
            );

        }




         // =========================
        // 🧠 MEMORY
       // =========================

if (
    improvements.memoryAnalysis &&
    improvements.memoryAnalysis.actions
) {

    improvements.memoryAnalysis.actions.forEach(
        action => {


            if (action.issues) {


                action.issues.forEach(
                    issue => {


                        tasks.push({

                            type:
                                "memory",

                            target:
                                issue.type,

                            task:
                                `Improve story memory: ${issue.missing}`

                        });


                    }
                );


            }


        }
    );

}





        // =========================
       // 🔄 CONTINUITY
      // =========================

if (
    improvements.continuity &&
    improvements.continuity.actions
) {


    improvements.continuity.actions.forEach(
        action => {


            if (action.issues) {


                action.issues.forEach(
                    issue => {


                        tasks.push({

                            type:
                                "continuity",

                            target:
                                issue.type,

                            task:
                                `Fix continuity: ${issue.description}`

                        });


                    }
                );

            }


        }
    );


}



         // =========================
         // 🧩 STORY LOGIC
         // =========================

if (
    improvements.storyLogic &&
    improvements.storyLogic.actions
) {

    improvements.storyLogic.actions.forEach(
        action => {


            if (action.issues) {


                action.issues.forEach(
                    issue => {


                        tasks.push({

                            type:
                                "story_logic",

                            target:
                                issue.type,

                            task:
                                `Fix story logic: ${issue.description}`

                        });


                    }
                );


            }


        }
    );

}


        // =========================
       // 🎭 CHARACTER EVIDENCE
       // =========================

if (
    improvements.characterEvidence &&
    improvements.characterEvidence.actions
) {

    improvements.characterEvidence.actions.forEach(
        action => {

            tasks.push({

                type:
                    "character_evidence",

                character:
                    action.character,

                task:
                    "Show character through meaningful scenes"

            });

        }
    );

}



          // =========================
         // ⚔️ CHARACTER ACTIONS
        // =========================

if (
    improvements.characterActions &&
    improvements.characterActions.actions
) {

    improvements.characterActions.actions.forEach(
        action => {

            tasks.push({

                type:
                    "character_action",

                character:
                    action.character,

                task:
                    "Create meaningful decisions and consequences"

            });

        }
    );

}

        return TaskPriorityEngine.prioritize(tasks);

    }

}

module.exports = ImprovementPlanner;
