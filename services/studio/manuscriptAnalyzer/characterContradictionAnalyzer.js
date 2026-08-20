class CharacterContradictionAnalyzer {


    static analyze(
        beliefSystem
    ) {


        const characters =
            beliefSystem?.characters || [];


        const results = [];

        let totalScore = 0;



        for (const character of characters) {


            let score = 0;

            const observations = [];
            const problems = [];



            /*
             * Belief exists
             */

            if (
                character.layers?.belief
            ) {

                score += 20;

                observations.push(
                    "Character beliefs are established."
                );

            }
            else {

                problems.push(
                    "No stable belief system detected."
                );

            }



            /*
             * Fear connected to belief
             */

            if (
                character.layers?.fearConnection
            ) {

                score += 20;

                observations.push(
                    "Fear creates tension with beliefs."
                );

            }
            else {

                problems.push(
                    "Fear-belief tension is weak."
                );

            }



            /*
             * Possible contradiction
             */

            if (
                character.layers?.belief &&
                character.layers?.fearConnection
            ) {

                score += 20;

                observations.push(
                    "Potential internal contradiction detected."
                );

            }
            else {

                problems.push(
                    "No visible contradiction."
                );

            }



            /*
             * Strong contradiction
             */

            if(score >= 60){

                observations.push(
                    "Character may act against personal beliefs."
                );

            }



            results.push({

                name: character.name,

                contradictionScore: score,

                observations,

                problems,

                layers: {

                    belief:
                        score >=20,

                    tension:
                        score >=40,

                    contradiction:
                        score >=60,

                    transformationPotential:
                        score >=80

                }

            });


            totalScore += score;

        }



        return {

            contradictionScore:
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
    CharacterContradictionAnalyzer;
