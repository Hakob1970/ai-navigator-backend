class MotivationArcAnalyzer {

    static analyze(
        characterExtraction,
        characterJourney,
        characterTransformation,
        characterConsequences
    ) {

        const results = [];
        let totalScore = 0;

        const characters =
            characterExtraction?.characters || [];

        const journeyCharacters =
            characterJourney?.characters || [];

        const transformationCharacters =
            characterTransformation?.characters || [];

        const consequenceCharacters =
            characterConsequences?.characters || [];


        for (const character of characters) {

            let score = 0;

            const observations = [];
            const problems = [];

            let hasDesire = false;
            let hasFear = false;
            let hasChoice = false;
            let hasSacrifice = false;
            let hasMotivationChange = false;
            let hasConsequence = false;
            let hasInternalNeed = false;


            const journey =
                journeyCharacters.find(
                    c => c.name === character.name
                ) || {};

            const transformation =
                transformationCharacters.find(
                    c => c.name === character.name
                ) || {};

            const consequences =
                consequenceCharacters.find(
                    c => c.name === character.name
                ) || {};


            /*
             * Character desire / goal
             *
             * Use extracted motivation data first.
             */

            const motivation =
                character.motivation || {};

            if (
                motivation.goal ||
                character.motivationLayers?.desire
            ) {

                score += 20;

                hasDesire = true;

                observations.push(
                    "Character has a defined external desire or goal."
                );

            }
            else {

                problems.push(
                    "Character external desire or goal is unclear."
                );

            }


            /*
             * Internal need
             *
             * Internal need must be supported by
             * character arc / transformation evidence.
             */

            const arcText =
                typeof character.arc === "string"
                    ? character.arc.toLowerCase()
                    : "";

            const internalNeedWords = [
                "change",
                "accept",
                "learn",
                "understand",
                "forgive",
                "overcome",
                "become",
                "realize",
                "responsibility"
            ];

            if (
                internalNeedWords.some(
                    word => arcText.includes(word)
                )
            ) {

                score += 15;

                hasInternalNeed = true;

                observations.push(
                    "Character arc contains evidence of an internal need."
                );

            }
            else {

                problems.push(
                    "Character deeper internal need is not explicitly supported."
                );

            }


            /*
             * Fear
             *
             * Prefer structured motivation data.
             */

            if (
                motivation.fear
            ) {

                score += 15;

                hasFear = true;

                observations.push(
                    "Character fear is connected to motivation."
                );

            }
            else {

                problems.push(
                    "Character fear is not clearly connected to motivation."
                );

            }


            /*
             * Choices
             *
             * A motivation arc requires actual decisions.
             */

            if (
                Array.isArray(journey.decisions) &&
                journey.decisions.length > 0
            ) {

                score += 20;

                hasChoice = true;

                observations.push(
                    "Character makes visible motivation-related choices."
                );

            }
            else {

                problems.push(
                    "No significant motivation-driven choices detected."
                );

            }


            /*
             * Consequences
             *
             * Conflict alone is NOT a consequence.
             */

            if (
                Array.isArray(consequences.consequences) &&
                consequences.consequences.length > 0
            ) {

                score += 15;

                hasConsequence = true;

                observations.push(
                    "Character choices produce visible consequences."
                );

            }
            else {

                problems.push(
                    "Character choices lack clearly recorded consequences."
                );

            }


            /*
             * Sacrifice / Cost
             *
             * Cost must be supported by consequence data.
             */

            if (
                hasConsequence &&
                (
                    consequences.consequenceScore >= 30 ||
                    consequences.consequences.some(
                        consequence =>
                            JSON.stringify(consequence)
                                .toLowerCase()
                                .includes("loss")
                    )
                )
            ) {

                score += 15;

                hasSacrifice = true;

                observations.push(
                    "Character pays a meaningful cost for a choice."
                );

            }
            else {

                problems.push(
                    "No sufficiently supported motivational cost detected."
                );

            }


            /*
             * Motivation transformation
             *
             * IMPORTANT:
             *
             * High score alone does NOT prove
             * motivation transformation.
             *
             * Transformation requires evidence that
             * the character changes between stages.
             */

            const changed =
                transformation.beforeAfter?.changed === true;

            const changeIndicators =
                transformation.beforeAfter?.changeIndicators || [];

            if (
                changed &&
                changeIndicators.length > 0
            ) {

                score += 10;

                hasMotivationChange = true;

                observations.push(
                    "Character motivation shows evidence of change across story stages."
                );

            }
            else {

                problems.push(
                    "No clear change in character motivation across story stages."
                );

            }


            /*
             * Motivation arc quality
             */

            if (
                hasDesire &&
                hasFear &&
                hasChoice &&
                hasConsequence &&
                hasMotivationChange
            ) {

                observations.push(
                    "Character has a causally supported motivation arc."
                );

            }
            else if (
                hasDesire &&
                hasChoice
            ) {

                observations.push(
                    "Character motivation is active but the full arc is incomplete."
                );

            }
            else {

                problems.push(
                    "Character motivation arc lacks sufficient causal structure."
                );

            }


            /*
             * Final result
             */

            results.push({

                name: character.name,

                motivationScore:
                    Math.min(score, 100),

                observations,

                problems,

                motivationLayers: {

                    desire:
                        hasDesire,

                    internalNeed:
                        hasInternalNeed,

                    fear:
                        hasFear,

                    choice:
                        hasChoice,

                    consequence:
                        hasConsequence,

                    sacrifice:
                        hasSacrifice,

                    motivationChange:
                        hasMotivationChange

                }

            });


            totalScore += Math.min(score, 100);

        }


        return {

            motivationArcScore:
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
    MotivationArcAnalyzer;
