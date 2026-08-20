class CharacterImportanceAnalyzer {

    static analyze(characterTransformationDepth) {

        const characters =
            characterTransformationDepth?.characters || [];

        const results = [];

        let totalScore = 0;


        for (const character of characters) {

            let score = 0;

            const observations = [];


            /*
             * Story presence
             */

            if (
                character.observations?.includes(
                    "Character has long-term story presence."
                )
            ) {

                score += 30;

            }


            /*
             * Transformation
             */

            if (
                character.depthScore >= 60
            ) {

                score += 30;

            }


            /*
             * Consequences
             */

            if (
                character.observations?.includes(
                    "Choices create story consequences."
                )
            ) {

                score += 20;

            }


            /*
             * Conflict
             */

            if (
                character.observations?.includes(
                    "Character transformation is tested by conflict."
                )
            ) {

                score += 20;

            }


            let role = "Minor";

            let weight = 0.5;


            if(score >= 80){

                role = "Main";
                weight = 3;

            }
            else if(score >= 60){

                role = "Major";
                weight = 2;

            }
            else if(score >= 30){

                role = "Supporting";
                weight = 1;

            }


            observations.push(
                `Character classified as ${role}.`
            );


            results.push({

                name: character.name,

                importanceScore: score,

                role,

                weight,

                observations

            });


            totalScore += score;

        }


        return {

            importanceScore:
                characters.length
                    ? Math.round(
                        totalScore /
                        characters.length
                    )
                    : 0,

            characters: results

        };

    }

}

module.exports =
    CharacterImportanceAnalyzer;
