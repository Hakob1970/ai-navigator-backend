class CharacterPsychologyAnalyzer {


    static analyze(
        characterExtraction,
        motivationArc,
        internalConflict,
        characterTransformationDepth
    ) {


        const characters =
            characterExtraction?.characters || [];

        const motivationCharacters =
            motivationArc?.characters || [];

        const conflictCharacters =
            internalConflict?.characters || [];

        const transformationCharacters =
            characterTransformationDepth?.characters || [];


        const results = [];

        let totalScore = 0;



        for (const character of characters) {


            let score = 0;

            const observations = [];
            const problems = [];


            const motivation =
                motivationCharacters.find(
                    c => c.name === character.name
                );

            const conflict =
                conflictCharacters.find(
                    c => c.name === character.name
                );

            const transformation =
                transformationCharacters.find(
                    c => c.name === character.name
                );



            /*
             * Evidence layers
             */

            const hasDesire =
                motivation?.motivationLayers?.desire === true;

            const hasFear =
                motivation?.motivationLayers?.fear === true ||
                conflict?.layers?.fear === true;

            const hasChoice =
                motivation?.motivationLayers?.choice === true;

            const hasConsequence =
                motivation?.motivationLayers?.consequence === true ||
                conflict?.layers?.emotionalPressure === true;

            const hasInternalNeed =
                motivation?.motivationLayers?.internalNeed === true;

            const hasContradiction =
                conflict?.layers?.contradiction === true ||
                conflict?.layers?.desireConflict === true;

            const hasMoralDilemma =
                conflict?.layers?.moralDilemma === true;

            const hasEmotionalPressure =
                conflict?.layers?.emotionalPressure === true;

            const hasTransformation =
                transformation?.transformationLayers?.behavior === true ||
                transformation?.transformationLayers?.choices === true ||
                transformation?.transformationLayers?.consequences === true ||
                transformation?.transformationLayers?.conflict === true ||
                transformation?.transformationLayers?.emotion === true;



            /*
             * Desire
             */

            if (hasDesire) {

                score += 15;

                observations.push(
                    "Character desire influences behavior."
                );

            }
            else {

                problems.push(
                    "Character desire is not sufficiently supported."
                );

            }



            /*
             * Fear
             */

            if (hasFear) {

                score += 10;

                observations.push(
                    "Character fear affects behavior or decisions."
                );

            }
            else {

                problems.push(
                    "Character fear motivation is unclear."
                );

            }



            /*
             * Internal need
             */

            if (hasInternalNeed) {

                score += 10;

                observations.push(
                    "Character has evidence of an internal psychological need."
                );

            }
            else {

                problems.push(
                    "Character deeper internal need is unclear."
                );

            }



            /*
             * Emotional wound
             *
             * Do NOT invent a wound from a score.
             * Require pressure + consequence/transformation evidence.
             */

            if (
                hasFear &&
                (
                    hasConsequence ||
                    hasTransformation
                )
            ) {

                score += 10;

                observations.push(
                    "Emotional wound or formative psychological pressure is supported."
                );

            }
            else {

                problems.push(
                    "Emotional wound or formative psychological event is unclear."
                );

            }



            /*
             * Choice psychology
             */

            if (
                hasChoice &&
                (
                    hasConsequence ||
                    hasTransformation
                )
            ) {

                score += 15;

                observations.push(
                    "Character choices have psychological consequences."
                );

            }
            else {

                problems.push(
                    "Character choices lack sufficient psychological evidence."
                );

            }



            /*
             * Belief
             *
             * Psychology must not infer beliefs from
             * desire/fear alone.
             */

            const hasBelief =
                transformation?.transformationLayers?.belief === true;

            if (hasBelief) {

                score += 15;

                observations.push(
                    "Character belief system influences transformation."
                );

            }
            else {

                problems.push(
                    "Character belief system is unclear."
                );

            }



            /*
             * Internal contradiction
             */

            if (
                hasContradiction ||
                hasMoralDilemma
            ) {

                score += 15;

                observations.push(
                    "Internal psychological contradiction is supported."
                );

            }
            else {

                problems.push(
                    "Internal psychological contradiction is not clearly supported."
                );

            }



            /*
             * Psychological coherence
             *
             * Requires several connected layers.
             */

            const connectedLayers = [
                hasDesire,
                hasFear,
                hasChoice,
                hasConsequence,
                hasInternalNeed,
                hasContradiction,
                hasTransformation
            ].filter(Boolean).length;


            if (connectedLayers >= 5) {

                score += 10;

                observations.push(
                    "Character psychological elements form a coherent pattern."
                );

            }
            else {

                problems.push(
                    "Character psychological elements are not sufficiently connected."
                );

            }



            /*
             * Depth conclusion
             */

            if (score >= 70) {

                observations.push(
                    "Strong character psychological depth detected."
                );

            }
            else if (score >= 50) {

                observations.push(
                    "Moderate character psychological depth detected."
                );

            }
            else {

                problems.push(
                    "Character psychological depth remains limited."
                );

            }



            /*
             * Layer state
             *
             * IMPORTANT:
             * Layers represent evidence,
             * not score thresholds.
             */

            results.push({

                name: character.name,

                psychologyScore: score,

                observations,

                problems,

                layers: {

                    desire:
                        hasDesire,

                    fear:
                        hasFear,

                    wound:
                        hasFear &&
                        (
                            hasConsequence ||
                            hasTransformation
                        ),

                    choice:
                        hasChoice &&
                        (
                            hasConsequence ||
                            hasTransformation
                        ),

                    belief:
                        hasBelief,

                    contradiction:
                        hasContradiction ||
                        hasMoralDilemma,

                    coherence:
                        connectedLayers >= 5

                }

            });


            totalScore += score;


        }



        return {

            psychologyScore:
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
    CharacterPsychologyAnalyzer;
