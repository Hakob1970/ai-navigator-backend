
class IdentityTransformationAnalyzer {

    static analyze(
        characterTransformationDepth,
        beliefSystem,
        characterContradiction
    ) {

        const results = [];
        let totalScore = 0;

        const depthCharacters =
            characterTransformationDepth?.characters || [];

        const beliefCharacters =
            beliefSystem?.characters || [];

        const contradictionCharacters =
            characterContradiction?.characters || [];


        for (const character of depthCharacters) {

            let score = 0;

            const observations = [];
            const problems = [];


            const transformationLayers =
                character.transformationLayers || {};


            const beliefData =
                beliefCharacters.find(
                    c => c.name === character.name
                ) || {};


            const contradictionData =
                contradictionCharacters.find(
                    c => c.name === character.name
                ) || {};


            /*
             * 1. BEHAVIOR TRANSFORMATION
             *
             * Behavioral change is the lowest
             * transformation layer.
             */

            const hasBehaviorChange =
                transformationLayers.behavior === true;

            if (hasBehaviorChange) {

                score += 25;

                observations.push(
                    "Behavior transformation detected."
                );

            } else {

                problems.push(
                    "Behavior remains mostly unchanged."
                );

            }


            /*
             * 2. BELIEF EVOLUTION
             *
             * Important:
             *
             * belief existence is NOT enough.
             *
             * We require evidence that the belief
             * itself changed or was transformed.
             */

            const hasBeliefEvolution =
                transformationLayers.belief === true;

            if (hasBeliefEvolution) {

                score += 25;

                observations.push(
                    "Belief evolution is supported by transformation evidence."
                );

            } else {

                problems.push(
                    "Belief evolution is not sufficiently supported."
                );

            }


            /*
             * 3. INTERNAL CONTRADICTION
             *
             * Contradiction must already be supported
             * by the dedicated contradiction analyzer.
             */

            const hasContradiction =
                contradictionData.layers?.contradiction === true;

            if (hasContradiction) {

                score += 20;

                observations.push(
                    "Internal contradiction contributes to character change."
                );

            } else {

                problems.push(
                    "No sufficiently supported internal contradiction."
                );

            }


            /*
             * 4. BELIEF / CONTRADICTION CONNECTION
             *
             * Stronger evidence exists when the character
             * has both belief evolution and contradiction.
             */

            const hasBeliefConflict =
                hasBeliefEvolution &&
                hasContradiction;

            if (hasBeliefConflict) {

                score += 15;

                observations.push(
                    "Belief change is connected to internal contradiction."
                );

            } else {

                problems.push(
                    "Belief change and contradiction are not sufficiently connected."
                );

            }


            /*
             * 5. IDENTITY-LEVEL EVIDENCE
             *
             * Identity shift must NOT be inferred merely
             * from a high score.
             *
             * We require:
             *
             * behavior change
             * +
             * belief evolution
             * +
             * contradiction
             *
             * +
             * sufficiently strong transformation depth.
             */

            const hasIdentityEvidence =
                hasBehaviorChange &&
                hasBeliefEvolution &&
                hasContradiction &&
                character.depthScore >= 70;


            if (hasIdentityEvidence) {

                score += 15;

                observations.push(
                    "Evidence supports a deeper identity transformation."
                );

            } else {

                problems.push(
                    "Identity-level transformation is not sufficiently supported."
                );

            }


            /*
             * 6. PSYCHOLOGICAL SUPPORT
             *
             * The belief analyzer can provide additional
             * supporting evidence, but it must not create
             * identity transformation by itself.
             */

            const hasPsychologicalSupport =
                beliefData.layers?.transformation === true;


            if (hasPsychologicalSupport) {

                observations.push(
                    "Belief-system analysis provides supporting evidence for transformation."
                );

            }


            /*
             * 7. FINAL SCORE
             */

            score =
                Math.min(score, 100);


            /*
             * 8. INTERPRETATION
             */

            if (score >= 85) {

                observations.push(
                    "Strong identity transformation detected."
                );

            }
            else if (score >= 65) {

                observations.push(
                    "Meaningful character transformation detected."
                );

            }
            else if (score >= 40) {

                observations.push(
                    "Moderate character transformation detected."
                );

            }
            else {

                problems.push(
                    "Character identity remains largely unchanged."
                );

            }


            /*
             * 9. TRANSFORMATION LAYERS
             *
             * Layers represent actual evidence.
             * They are NOT calculated from the final score.
             */

            const identityLayers = {

                behavior:
                    hasBehaviorChange,

                belief:
                    hasBeliefEvolution,

                contradiction:
                    hasContradiction,

                identityShift:
                    hasIdentityEvidence

            };


            /*
             * 10. RESULT
             */

            results.push({

                name:
                    character.name,

                identityScore:
                    score,

                observations,

                problems,

                layers:
                    identityLayers

            });


            totalScore += score;

        }


        /*
         * FINAL MANUSCRIPT SCORE
         */

        return {

            identityTransformationScore:

                depthCharacters.length
                    ? Math.round(
                        totalScore /
                        depthCharacters.length
                    )
                    : 0,

            characters:
                results

        };

    }

}


module.exports =
    IdentityTransformationAnalyzer;
