
class InternalConflictAnalyzer {

    static analyze(
        characterExtraction,
        characterTransformation,
        characterConsequences
    ) {

        const results = [];
        let totalScore = 0;

        const characters =
            characterExtraction?.characters || [];

        const transformationCharacters =
            characterTransformation?.characters || [];

        const consequenceCharacters =
            characterConsequences?.characters || [];


        for (const character of characters) {

            let score = 0;

            const observations = [];
            const problems = [];

            const textData =
                JSON.stringify(character).toLowerCase();

            const transformationCharacter =
                transformationCharacters.find(
                    c => c.name === character.name
                );

            const consequenceCharacter =
                consequenceCharacters.find(
                    c => c.name === character.name
                );


            /*
             * =========================
             * 1. Fear / Vulnerability
             * =========================
             */

            const hasFear =
                textData.includes("fear") ||
                textData.includes("afraid") ||
                textData.includes("danger") ||
                textData.includes("risk");

            if (hasFear) {

                score += 15;

                observations.push(
                    "Character fear or vulnerability detected."
                );

            }
            else {

                problems.push(
                    "No visible fear or vulnerability."
                );

            }


            /*
             * =========================
             * 2. Doubt / Uncertainty
             * =========================
             */

            const hasDoubt =
                textData.includes("doubt") ||
                textData.includes("uncertain") ||
                textData.includes("question") ||
                textData.includes("wondered");

            if (hasDoubt) {

                score += 15;

                observations.push(
                    "Character uncertainty detected."
                );

            }
            else {

                problems.push(
                    "No visible internal doubt."
                );

            }


            /*
             * =========================
             * 3. Internal Contradiction
             * =========================
             */

            const hasChoice =
                character.decisions &&
                character.decisions.length > 0;

            const contradictionWords = [
                "refused",
                "accepted",
                "decided",
                "chose",
                "choice",
                "but",
                "instead"
            ];

            const hasContradiction =
                hasChoice &&
                contradictionWords.some(
                    word => textData.includes(word)
                );

            if (hasContradiction) {

                score += 20;

                observations.push(
                    "Character faces conflicting desires through choices."
                );

            }
            else {

                problems.push(
                    "No internal contradiction detected."
                );

            }


            /*
             * =========================
             * 4. Desire vs Obligation
             * =========================
             */

            const desireWords = [
                "want",
                "need",
                "wish",
                "goal",
                "protect",
                "save",
                "prove"
            ];

            const obligationWords = [
                "must",
                "cannot",
                "refused",
                "sacrifice",
                "choice",
                "decision",
                "duty",
                "responsibility"
            ];

            const hasDesire =
                desireWords.some(
                    word => textData.includes(word)
                );

            const hasObligation =
                obligationWords.some(
                    word => textData.includes(word)
                );

            const hasDesireConflict =
                hasDesire &&
                hasObligation;

            if (hasDesireConflict) {

                score += 20;

                observations.push(
                    "Character has internal desire versus obligation conflict."
                );

            }
            else {

                problems.push(
                    "Character desire versus obligation conflict is unclear."
                );

            }


            /*
             * =========================
             * 5. Moral Dilemma
             * =========================
             */

            const moralWords = [
                "choice",
                "sacrifice",
                "betray",
                "responsibility",
                "duty",
                "loyalty"
            ];

            const moralEvidenceCount =
                moralWords.filter(
                    word => textData.includes(word)
                ).length;

            const hasMoralDilemma =
                moralEvidenceCount >= 2;

            if (hasMoralDilemma) {

                score += 15;

                observations.push(
                    "Character faces possible moral dilemma."
                );

            }
            else {

                problems.push(
                    "No clear moral dilemma detected."
                );

            }


            /*
             * =========================
             * 6. Emotional Pressure
             * =========================
             */

            const hasExternalPressure =
                character.conflicts &&
                character.conflicts.length > 0;

            if (hasExternalPressure) {

                score += 15;

                observations.push(
                    "External events create emotional pressure."
                );

            }
            else {

                problems.push(
                    "External pressure is not clearly established."
                );

            }


            /*
             * =========================
             * Evidence
             *
             * Transformation and consequences
             * support the analysis but DO NOT
             * inflate the score.
             * =========================
             */

            if (
                transformationCharacter?.beforeAfter?.changed
            ) {

                observations.push(
                    "Character transformation provides evidence of internal pressure."
                );

            }


            if (
                consequenceCharacter?.consequenceScore >= 30
            ) {

                observations.push(
                    "Character consequences reinforce internal conflict."
                );

            }


            /*
             * =========================
             * Conflict Strength
             * =========================
             */

            if (score >= 85) {

                observations.push(
                    "Deep internal conflict detected."
                );

            }
            else if (score >= 70) {

                observations.push(
                    "Strong internal conflict detected."
                );

            }
            else if (score >= 50) {

                observations.push(
                    "Moderate internal conflict detected."
                );

            }
            else if (score >= 30) {

                observations.push(
                    "Emerging internal conflict detected."
                );

            }
            else {

                problems.push(
                    "Internal conflict depth is weak."
                );

            }


            /*
             * =========================
             * Final safety clamp
             * =========================
             */

            score =
                Math.max(
                    0,
                    Math.min(score, 100)
                );


            results.push({

                name: character.name,

                internalConflictScore:
                    score,

                observations,

                problems,

                layers: {

                    fear:
                        hasFear,

                    doubt:
                        hasDoubt,

                    contradiction:
                        hasContradiction,

                    desireConflict:
                        hasDesireConflict,

                    moralDilemma:
                        hasMoralDilemma,

                    emotionalPressure:
                        hasExternalPressure

                }

            });


            totalScore += score;

        }


        return {

            internalConflictScore:
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
    InternalConflictAnalyzer;
