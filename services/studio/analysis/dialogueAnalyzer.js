class DialogueAnalyzer {


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
                "No scenes found for dialogue analysis."
            );

            return result;

        }



        project.scenes.forEach(scene => {


            const missing = [];



            if (
                !scene.dialogue ||
                scene.dialogue.length === 0
            ) {

                missing.push(
                    "dialogue"
                );

            }



            if (
                scene.dialogue &&
                scene.dialogue.length > 0
            ) {


                const speakers =
                    new Set(
                        scene.dialogue.map(
                            line => line.character
                        )
                    );


                if (
                    speakers.size < 2
                ) {

                    missing.push(
                        "dialogue interaction"
                    );

                }


            }



            const quality =
                Math.max(
                    0,
                    100 - (missing.length * 30)
                );



            result.scenes.push({

                id:
                    scene.id,


                title:
                    scene.title || "",


                missing,


                quality

            });


        });



        const weakDialogue =
            result.scenes.filter(
                scene =>
                    scene.quality < 70
            );



        if (
            weakDialogue.length > 0
        ) {

            result.observations.push(
                "Some scenes require dialogue improvement."
            );

        }
        else {

            result.observations.push(
                "Dialogue structure is strong."
            );

        }



        return result;


    }


}


module.exports = DialogueAnalyzer;
