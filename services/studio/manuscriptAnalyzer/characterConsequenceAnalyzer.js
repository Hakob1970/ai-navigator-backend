class CharacterConsequenceAnalyzer {


    static analyze(characterExtraction) {


        if (
            !characterExtraction ||
            !characterExtraction.characters
        ) {

            return {
                consequenceScore: 0,
                characters: []
            };

        }



        const results =
            characterExtraction.characters.map(character => {



                const consequences = [];

                let impactScore = 0;

                const consequenceChain = [];

                /*
                    Решения персонажа
                */

                const uniqueDecisions = [
    ...new Map(
        character.decisions.map(d =>
            [
                `${d.chapter}-${d.decision}`,
                d
            ]
        )
    ).values()
];


uniqueDecisions.forEach(decision => {


                    let impact = 0;

                    const possible = [];



                    if (
                        decision.decision === "refused"
                    ) {

                        possible.push(
                            "Decision creates unresolved tension"
                        );

                        impact += 10;

                    }



                    if (
                        decision.decision === "accepted"
                    ) {

                        possible.push(
                            "Character commits to a path"
                        );

                        impact += 15;

                    }



                    if (
                        decision.decision === "chose" ||
                        decision.decision === "decided"
                    ) {

                        possible.push(
                            "Story direction changed by decision"
                        );

                        impact += 20;

                    }



                    consequences.push({

                        chapter:
                            decision.chapter,

                        decision:
                            decision.decision,

                        possibleConsequences:
                            possible,

                        impact


                    });


                    consequenceChain.push({

    chapter:
        decision.chapter,

    trigger:
        decision.decision,

    type:
        "decision",

    impact

});

                    impactScore += impact;


                });



                /*
                    Конфликт персонажа
                */


                if (
                    character.conflicts.length
                ) {


                    const conflict =
    character.conflicts[0];


const conflictConsequence = {

    type:
        "conflict",

    chapter:
        conflict.chapter,

    trigger:
        conflict.conflict,

    message:
        "Character faces external pressure",

    impact:
        20

};


consequences.push(
    conflictConsequence
);


consequenceChain.push({

    type:
        "pressure",

    chapter:
        conflict.chapter,

    trigger:
        conflict.conflict,

    effect:
        "External pressure changes character situation",

    impact:
        20

});


                    impactScore += 20;

                }




                /*
                    Нормализация
                */


                if (
                    impactScore > 100
                ) {

                    impactScore = 100;

                }



                return {


                    name:
                        character.name,


                    consequenceScore:
                        impactScore,


                    consequences,

                    consequenceChain


                };


            });



        const average = results.length
            ? Math.round(
                results.reduce(
                    (sum,c)=>
                        sum + c.consequenceScore,
                    0
                )
                /
                results.length
            )
            : 0;



        return {


            consequenceScore:
                average,


            characters:
                results


        };


    }


}



module.exports =
    CharacterConsequenceAnalyzer;
