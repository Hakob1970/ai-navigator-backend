/**
 * 🔄 Continuity Analyzer
 * Проверяет непрерывность истории:
 * персонажи, события, время, отношения и мир.
 */

class ContinuityAnalyzer {


    static analyze(project) {


        const result = {

            issues: [],

            observations: []

        };


        if (!project) {

            result.observations.push(
                "Project not found."
            );

            return result;

        }



                console.log(
            "========== TIMELINE DEBUG =========="
        );

        console.log(
            "project.memory:",
            JSON.stringify(project.memory, null, 2)
        );

        console.log(
            "project.memory.timeline:",
            JSON.stringify(
                project.memory?.timeline,
                null,
                2
            )
        );

        console.log(
            "===================================="
        );



        // =========================
        // 👤 CHARACTER CONTINUITY
        // =========================


        if (
            project.characters &&
            project.characters.length > 0
        ) {


            project.characters.forEach(character => {


                if (
                    !character.motivation ||
                    !character.motivation.goal
                ) {

                    result.issues.push({

                        type:
                            "character_motivation",

                        character:
                            character.name,

                        description:
                            "Character has no clear motivation or goal."

                    });

                }



                if (
                    !character.development ||
                    !character.development.arc
                ) {

                    result.issues.push({

                        type:
                            "character_development",

                        character:
                            character.name,

                        description:
                            "Character development path is unclear."

                    });

                }


            });


        }




        // =========================
        // 🕒 TIMELINE CONTINUITY
        // =========================


        if (
            project.memory &&
            project.memory.timeline
        ) {


            const timeline =
                project.memory.timeline;


            if (
                timeline.length === 0
            ) {

                result.issues.push({

                    type:
                        "timeline",

                    description:
                        "No timeline events tracked."

                });

            }


        }




        // =========================
        // 🎬 SCENE CONTINUITY
        // =========================


        if (
            project.scenes &&
            project.scenes.length > 0
        ) {


            project.scenes.forEach(scene => {


                if (
                    scene.status === "completed" &&
                    !scene.outcome
                ) {

                    result.issues.push({

                        type:
                            "scene_result",

                        scene:
                            scene.title,

                        description:
                            "Completed scene has no recorded outcome."

                    });

                }



                if (
                    scene.change &&
                    !scene.consequence
                ) {

                    result.issues.push({

                        type:
                            "cause_effect",

                        scene:
                            scene.title,

                        description:
                            "Scene change has no future consequence."

                    });

                }


            });


        }




        // =========================
        // 🌍 WORLD CONTINUITY
        // =========================


        if (
            project.world
        ) {


            if (
                !project.world.rules ||
                project.world.rules.length === 0
            ) {

                result.issues.push({

                    type:
                        "world_rules",

                    description:
                        "World rules are not defined."

                });

            }


        }




        // =========================
        // 📊 SCORE
        // =========================


        const score =
            Math.max(
                0,
                100 - (result.issues.length * 10)
            );


        result.score =
            score;



        if (
            score < 70
        ) {

            result.observations.push(
                "Story continuity requires improvement."
            );

        }
        else {

            result.observations.push(
                "Story continuity is consistent."
            );

        }


        return result;


    }


}


module.exports = ContinuityAnalyzer;
