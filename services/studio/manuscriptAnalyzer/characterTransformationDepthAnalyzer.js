class CharacterTransformationDepthAnalyzer {

    static analyze(
        characterTransformation,
        characterExtraction,
        characterConsequences
    ) {

        const results = [];

        let totalScore = 0;

        const characters =
            characterTransformation?.characters || [];

        const extractedCharacters =
            characterExtraction?.characters || [];

        const consequenceCharacters =
            characterConsequences?.characters || [];


        for (const character of characters) {

            const extractedCharacter =
                extractedCharacters.find(
                    c => c.name === character.name
                ) || {};

            const consequenceCharacter =
                consequenceCharacters.find(
                    c => c.name === character.name
                ) || {};


            const beforeAfter =
                character.beforeAfter || {};

            const decisions =
                Array.isArray(beforeAfter.decisions)
                    ? beforeAfter.decisions
                    : [];

            const pressure =
                Array.isArray(beforeAfter.pressure)
                    ? beforeAfter.pressure
                    : [];

            const changeIndicators =
                Array.isArray(beforeAfter.changeIndicators)
                    ? beforeAfter.changeIndicators
                    : [];


            let score = 0;

            const observations = [];
            const problems = [];


            /*
             * 1. STORY PRESENCE
             */

            const chapters =
                Array.isArray(extractedCharacter.chapters)
                    ? extractedCharacter.chapters
                    : [];

            if (chapters.length >= 2) {

                score += 15;

                observations.push(
                    "Character has long-term story presence."
                );

            }
            else {

                problems.push(
                    "Character has limited story presence."
                );

            }


            /*
             * 2. BEHAVIOR EVOLUTION
             *
             * Important:
             *
             * changeIndicators are only evidence
             * of behavioral variation.
             *
             * They do NOT automatically mean
             * deep transformation.
             */

            if (changeIndicators.length > 0) {

                score += 15;

                observations.push(
                    "Behavioral evolution evidence detected."
                );

            }
            else {

                problems.push(
                    "No behavioral evolution evidence detected."
                );

            }


            /*
             * 3. MEANINGFUL CHOICES
             */

            if (decisions.length > 0) {

                score += 15;

                observations.push(
                    "Character makes meaningful choices."
                );

            }
            else {

                problems.push(
                    "Character choices are unclear."
                );

            }


            /*
             * 4. CONSEQUENCES
             */

            const consequenceScore =
                Number(
                    consequenceCharacter.consequenceScore
                ) || 0;


            if (consequenceScore >= 20) {

                score += 15;

                observations.push(
                    "Character choices create consequences."
                );

            }
            else {

                problems.push(
                    "Choices have weak consequences."
                );

            }


            /*
             * 5. CONFLICT PRESSURE
             */

            if (pressure.length > 0) {

                score += 15;

                observations.push(
                    "Character transformation is tested by conflict."
                );

            }
            else {

                problems.push(
                    "No major conflict affecting character."
                );

            }


            /*
             * 6. EMOTIONAL PRESSURE
             *
             * We do NOT claim emotional transformation
             * from conflict alone.
             *
             * Conflict + consequence gives us
             * evidence of emotional pressure.
             */

            if (
                pressure.length > 0 &&
                consequenceScore >= 20
            ) {

                score += 10;

                observations.push(
                    "Emotional transformation pressure detected."
                );

            }
            else {

                problems.push(
                    "Emotional development is not sufficiently supported."
                );

            }


            /*
             * 7. BELIEF TRANSFORMATION
             *
             * Do not invent belief transformation.
             *
             * It requires stronger evidence than
             * behavioral change.
             */

            const hasMultipleDecisions =
                new Set(
                    decisions
                        .map(d => d.decision)
                        .filter(Boolean)
                ).size >= 2;


            if (
                hasMultipleDecisions &&
                changeIndicators.length > 0 &&
                consequenceScore >= 20
            ) {

                score += 10;

                observations.push(
                    "Possible belief transformation detected."
                );

            }
            else {

                problems.push(
                    "Belief transformation not sufficiently evidenced."
                );

            }


            /*
             * 8. DEEP TRANSFORMATION
             *
             * Deep transformation requires
             * causal evidence.
             */

            const strongCausalEvidence =
                decisions.length > 0 &&
                pressure.length > 0 &&
                consequenceScore >= 20;


            if (strongCausalEvidence) {

                observations.push(
                    "Character has a causally supported transformation arc."
                );

            }
            else {

                problems.push(
                    "Character transformation lacks sufficient causal depth."
                );

            }


            /*
             * 9. TRANSFORMATION LAYERS
             *
             * Layers represent evidence,
             * not absolute truth.
             */

            const transformationLayers = {

                behavior:
                    changeIndicators.length > 0,

                choices:
                    decisions.length > 0,

                consequences:
                    consequenceScore >= 20,

                conflict:
                    pressure.length > 0,

                emotion:
                    pressure.length > 0 &&
                    consequenceScore >= 20,

                belief:
                    hasMultipleDecisions &&
                    changeIndicators.length > 0 &&
                    consequenceScore >= 20,

                identity:
                    false

            };


            /*
             * Identity is deliberately NOT inferred here.
             *
             * IdentityTransformationAnalyzer is responsible
             * for that higher-level judgment.
             */


            /*
             * 10. FINAL DEPTH ASSESSMENT
             */

            score =
                Math.min(score, 100);


            if (score >= 70) {

                observations.push(
                    "Deep character transformation detected."
                );

            }
            else if (score >= 40) {

                observations.push(
                    "Moderate character transformation."
                );

            }
            else {

                problems.push(
                    "Character remains mostly unchanged."
                );

            }


            results.push({

                name:
                    character.name,

                depthScore:
                    score,

                observations,

                problems,

                transformationLayers

            });


            totalScore += score;

        }


        return {

            depthScore:
                characters.length
                    ? Math.round(
                        totalScore /
                        characters.length
                    )
                    : 0,

            characters:
                results

        };

    }

}


module.exports =
    CharacterTransformationDepthAnalyzer;
