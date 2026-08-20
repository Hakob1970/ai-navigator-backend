class BeliefSystemAnalyzer {

    static analyze(characterPsychology) {

        const characters =
            characterPsychology?.characters || [];

        const results = [];
        let totalScore = 0;

        for (const character of characters) {

            const layers =
                character.layers || {};

            let score = 0;

            const observations = [];
            const problems = [];


            /*
             * 1. Core belief
             *
             * Psychology analyzer does not directly prove
             * a belief. We therefore require supporting
             * psychological evidence.
             */

            const hasBeliefEvidence =
                layers.desire === true ||
                layers.fear === true ||
                layers.wound === true ||
                layers.choice === true ||
                layers.contradiction === true;

            if (hasBeliefEvidence) {

                score += 20;

                observations.push(
                    "Psychological evidence suggests an underlying belief system."
                );

            } else {

                problems.push(
                    "Character core beliefs are not sufficiently supported."
                );

            }


            /*
             * 2. Wound-based belief
             */

            const hasWoundBasedBelief =
                layers.wound === true &&
                layers.fear === true;

            if (hasWoundBasedBelief) {

                score += 15;

                observations.push(
                    "Possible core belief formed from fear and psychological wound."
                );

            } else {

                problems.push(
                    "Belief origin through fear or psychological wound is unclear."
                );

            }


            /*
             * 3. Fear → belief connection
             */

            const hasFearConnection =
                layers.fear === true &&
                (
                    layers.wound === true ||
                    layers.choice === true ||
                    layers.contradiction === true
                );

            if (hasFearConnection) {

                score += 20;

                observations.push(
                    "Fear appears connected to the character's belief system."
                );

            } else {

                problems.push(
                    "Fear and belief connection is unclear."
                );

            }


            /*
             * 4. Belief expressed through choices
             */

            const hasChoiceExpression =
                layers.choice === true &&
                (
                    layers.desire === true ||
                    layers.fear === true ||
                    layers.wound === true
                );

            if (hasChoiceExpression) {

                score += 20;

                observations.push(
                    "Character choices provide evidence of belief-driven behavior."
                );

            } else {

                problems.push(
                    "Character choices do not sufficiently reveal an underlying belief."
                );

            }


            /*
             * 5. Belief contradiction
             *
             * Contradiction requires psychological tension,
             * not merely the existence of a belief.
             */

            const hasBeliefContradiction =
                layers.contradiction === true &&
                (
                    layers.choice === true ||
                    layers.fear === true
                );

            if (hasBeliefContradiction) {

                score += 15;

                observations.push(
                    "Character behavior reveals tension between beliefs, fears, and choices."
                );

            } else {

                problems.push(
                    "No sufficiently supported conflict between beliefs and behavior."
                );

            }


            /*
             * 6. Belief transformation
             */

            const hasBeliefTransformation =
                hasBeliefContradiction &&
                layers.coherence === true;

            if (hasBeliefTransformation) {

                score += 10;

                observations.push(
                    "Character belief system shows evidence of transformation."
                );

            }


            /*
             * 7. Belief depth
             */

            if (score >= 70) {

                observations.push(
                    "Strong character belief structure detected."
                );

            } else if (score >= 40) {

                observations.push(
                    "Partial character belief structure detected."
                );

            } else {

                problems.push(
                    "Character belief system remains weak or insufficiently supported."
                );

            }


            /*
             * 8. Derived layers
             *
             * These layers become the contract for
             * CharacterContradictionAnalyzer.
             */

            const belief =
                hasBeliefEvidence;

            const tension =
                hasFearConnection;

            const contradiction =
                hasBeliefContradiction;

            const transformation =
                hasBeliefTransformation;


            results.push({

                name: character.name,

                beliefScore:
                    score,

                observations,

                problems,

                layers: {

                    woundBasedBelief:
                        hasWoundBasedBelief,

                    belief,

                    fearConnection:
                        hasFearConnection,

                    contradiction,

                    transformation

                }

            });


            totalScore += score;

        }


        return {

            beliefSystemScore:
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
    BeliefSystemAnalyzer;
