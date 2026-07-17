/**
 * 🧠 Story Logic Analyzer
 *
 * Проверяет внутреннюю логику истории:
 * причины, последствия,
 * мотивации персонажей,
 * развитие конфликтов,
 * подготовку финала.
 */


class StoryLogicAnalyzer {


    static analyze(project) {


        const result = {

            issues: [],

            observations: []

        };



        // =========================
        // 🎭 CHARACTER MOTIVATION
        // =========================


        if (
            project.characters &&
            project.characters.length > 0
        ) {


            project.characters.forEach(character => {


                if (
                    !character.motivation &&
                    !character.goal
                ) {

                    result.issues.push({

                        type:
                            "character_motivation",


                        character:
                            character.name,


                        description:
                            "Character actions lack clear motivation."

                    });

                }


            });


        }



        // =========================
        // ⚔️ ACTION → CONSEQUENCE
        // =========================


        if (
            project.scenes &&
            project.scenes.length > 0
        ) {


            project.scenes.forEach(scene => {


                if (
                    scene.decision &&
                    !scene.consequence
                ) {

                    result.issues.push({

                        type:
                            "missing_consequence",


                        scene:
                            scene.title,


                        description:
                            "Character decision has no visible consequence."

                    });

                }



            });


        }



        // =========================
        // 🔥 CONFLICT DEVELOPMENT
        // =========================


        if (
            !project.storyArchitecture ||
            !project.storyArchitecture.conflicts ||
            project.storyArchitecture.conflicts.length === 0
        ) {


            result.issues.push({

                type:
                    "conflict_structure",


                description:
                    "Story conflict development is not defined."

            });


        }



        // =========================
        // 🧵 OPEN THREADS
        // =========================


        if (
            project.memory &&
            project.memory.plotThreads
        ) {


            project.memory.plotThreads.forEach(thread => {


                if (
                    thread.status === "active" &&
                    thread.events.length === 0
                ) {


                    result.issues.push({

                        type:
                            "unresolved_thread",


                        thread:
                            thread.title,


                        description:
                            "Story thread exists without development."

                    });


                }


            });


        }



        // =========================
        // 🏁 ENDING PREPARATION
        // =========================


        if (
            project.ending &&
            !project.ending.summary
        ) {


            result.issues.push({

                type:
                    "ending_logic",


                description:
                    "Ending has no clear resolution."

            });


        }



        if (
            result.issues.length > 0
        ) {


            result.observations.push(
                "Story logic requires improvement."
            );


        }
        else {


            result.observations.push(
                "Story logic is consistent."
            );


        }



        return result;


    }


}


module.exports = StoryLogicAnalyzer;
