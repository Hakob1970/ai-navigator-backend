/**
 * 🎬 Scene Analyzer
 * Анализирует качество сцен:
 * цель, конфликт, действие, результат и влияние на историю
 */

class SceneAnalyzer {


    static analyze(project) {


        const result = {

            scenes: [],

            observations: []

        };


        if (
            !project.scenes ||
            project.scenes.length === 0
        ) {

            result.observations.push(
                "No scenes found."
            );

            return result;

        }



        project.scenes.forEach(scene => {


            const missing = [];



            if (
                !scene.goal
            ) {

                missing.push(
                    "scene goal"
                );

            }



            if (
                !scene.conflict &&
                !scene.obstacle
            ) {

                missing.push(
                    "conflict"
                );

            }



            if (
                !scene.characters ||
                scene.characters.length === 0
            ) {

                missing.push(
                    "character involvement"
                );

            }



            if (
                !scene.outcome
            ) {

                missing.push(
                    "scene outcome"
                );

            }


          // 🧠 SCENE INTELLIGENCE


if (
    !scene.decision
) {

    missing.push(
        "character decision"
    );

}



if (
    !scene.change
) {

    missing.push(
        "scene change"
    );

}



if (
    !scene.consequence
) {

    missing.push(
        "future consequence"
    );

}



if (
    !scene.emotionalShift
) {

    missing.push(
        "emotional shift"
    );

}



            const completeness =
    Math.max(
        0,
        100 - (missing.length * 12)
    );



            result.scenes.push({

                id:
                    scene.id,

                title:
                    scene.title || "",


                missing,


                completeness

            });


        });



        const weakScenes =
            result.scenes.filter(
                scene =>
                    scene.completeness < 70
            );



        if (
            weakScenes.length > 0
        ) {

            result.observations.push(
                "Some scenes require improvement."
            );

        }
        else {

            result.observations.push(
                "Scenes have strong structure."
            );

        }



        return result;

    }


}


module.exports = SceneAnalyzer;
