class CharacterTransformationAnalyzer {

    static analyze(characterJourney, characterConsequences) {

        const characters =
            characterJourney?.characters || [];

        if (!characters.length) {
            return {
                transformationScore: 0,
                characters: []
            };
        }


        const results = [];


        /*
         * IMPORTANT:
         *
         * Journey describes the character's path.
         *
         * Transformation is NOT proven by:
         *
         * action A !== action B
         *
         * Different actions only indicate
         * possible behavioral variation.
         *
         * Real transformation requires stronger evidence:
         *
         * - meaningful choices
         * - pressure / conflict
         * - consequences
         * - behavioral evolution
         */


        for (const character of characters) {

            let score = 0;

            const observations = [];
            const problems = [];


            const consequences =
                characterConsequences?.characters
                    ?.find(
                        c =>
                            c.name === character.name
                    );


            const journey =
                character.journey || {};


            const actions =
                Array.isArray(character.actions)
                    ? character.actions
                    : [];


            const decisions =
                Array.isArray(character.decisions)
                    ? character.decisions
                    : [];


            const conflicts =
                Array.isArray(character.conflicts)
                    ? character.conflicts
                    : [];


            /*
             * 1. STORY PRESENCE
             *
             * Presence is necessary,
             * but is NOT transformation.
             */

            if (
                character.chapters &&
                character.chapters.length >= 2
            ) {

                score += 10;

                observations.push(
                    "Character appears across multiple story stages."
                );

            }
            else {

                problems.push(
                    "Character has insufficient story presence."
                );

            }


            /*
             * 2. MEANINGFUL CHOICES
             *
             * A transformation arc needs
             * decisions that affect the story.
             */

            if (decisions.length > 0) {

                score += 20;

                observations.push(
                    "Character makes meaningful choices."
                );

            }
            else {

                problems.push(
                    "No meaningful character choices detected."
                );

            }


            /*
             * 3. CONFLICT / PRESSURE
             */

            if (conflicts.length > 0) {

                score += 15;

                observations.push(
                    "Character transformation is tested by conflict."
                );

            }
            else {

                problems.push(
                    "No significant conflict affecting character."
                );

            }


            /*
             * 4. CONSEQUENCES
             *
             * Consequences are stronger evidence
             * than simply having actions.
             */

            if (
                consequences &&
                consequences.consequenceScore >= 20
            ) {

                score += 20;

                observations.push(
                    "Character choices create story consequences."
                );

            }
            else {

                problems.push(
                    "Character choices lack clear consequences."
                );

            }


            /*
             * 5. BEHAVIORAL VARIATION
             *
             * IMPORTANT:
             *
             * We do NOT treat:
             *
             * stood → looked
             *
             * as transformation.
             *
             * We only record that Journey detected
             * a possible behavioral change.
             */

            const changeIndicators =
                journey.changeIndicators || [];


            if (
                changeIndicators.length > 0
            ) {

                score += 15;

                observations.push(
                    "Possible behavioral evolution detected."
                );

            }
            else {

                problems.push(
                    "No behavioral evolution evidence detected."
                );

            }


            /*
             * 6. DECISION EVOLUTION
             *
             * Different decisions can indicate
             * development, but only as supporting evidence.
             */

            const uniqueDecisions =
                new Set(
                    decisions
                        .map(
                            decision =>
                                decision.decision
                        )
                        .filter(Boolean)
                );


            const decisionEvolution =
                uniqueDecisions.size >= 2;


            if (decisionEvolution) {

                score += 10;

                observations.push(
                    "Character decision evolution detected."
                );

            }


            /*
             * 7. BEFORE / AFTER
             *
             * This describes evidence.
             * It does NOT declare transformation
             * automatically.
             */

            const beginning =
                journey.beginning || null;


            const ending =
                journey.ending || null;


            const changed =
                Boolean(
                    beginning &&
                    ending &&
                    (
                        beginning.action !==
                        ending.action
                    )
                );


            /*
             * IMPORTANT:
             *
             * Different actions alone are NOT
             * sufficient proof of transformation.
             */

            if (changed) {

                observations.push(
                    "Beginning and ending behavior differ."
                );

            }


            /*
             * 8. TRANSFORMATION CONFIDENCE
             *
             * Stronger transformation requires:
             *
             * choices
             * +
             * conflict
             * +
             * consequences
             *
             * Behavioral change is supporting evidence,
             * not the foundation.
             */

            const strongEvidence =
                decisions.length > 0 &&
                conflicts.length > 0 &&
                consequences &&
                consequences.consequenceScore >= 20;


            if (strongEvidence) {

                score += 10;

                observations.push(
                    "Strong transformation evidence detected."
                );

            }
            else {

                problems.push(
                    "Transformation lacks sufficient causal evidence."
                );

            }


            /*
             * LIMIT SCORE
             */

            score =
                Math.min(score, 100);


            /*
             * 9. TRANSFORMATION LEVEL
             */

            let transformationLevel =
                "minimal";


            if (score >= 70) {

                transformationLevel =
                    "strong";

                observations.push(
                    "Strong character transformation detected."
                );

            }
            else if (score >= 45) {

                transformationLevel =
                    "moderate";

                observations.push(
                    "Moderate character transformation detected."
                );

            }
            else {

                problems.push(
                    "Character transformation remains weak."
                );

            }


            /*
             * 10. RESULT
             */

            results.push({

                name:
                    character.name,

                transformationScore:
                    score,

                transformationLevel,

                observations,

                problems,

                beforeAfter: {

                    beginning,

                    pressure:
                        journey.pressure || conflicts,

                    decisions,

                    ending,

                    changed,

                    changeIndicators

                }

            });

        }


        /*
         * AVERAGE
         */

        const average =
            results.length
                ? Math.round(
                    results.reduce(
                        (sum, character) =>
                            sum +
                            character.transformationScore,
                        0
                    ) / results.length
                )
                : 0;


        return {

            transformationScore:
                average,

            characters:
                results

        };

    }

}


module.exports =
    CharacterTransformationAnalyzer;
