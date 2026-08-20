class CharacterArcCoherenceAnalyzer {


    static analyze(data) {


        const characters =
            data?.characters || [];


        const motivationCharacters =
            data?.motivationArc?.characters || [];

        const psychologyCharacters =
            data?.characterPsychology?.characters || [];

        const beliefCharacters =
            data?.beliefSystem?.characters || [];

        const contradictionCharacters =
            data?.characterContradiction?.characters || [];

        const identityCharacters =
            data?.identityTransformation?.characters || [];

        const transformationCharacters =
            data?.characterTransformationDepth?.characters || [];

        const conflictCharacters =
            data?.internalConflict?.characters || [];


        const results = [];

        let totalScore = 0;


        for (const character of characters) {


            let score = 0;

            const observations = [];
            const problems = [];


            /*
             * Gather evidence for this character
             */

            const motivationData =
                motivationCharacters.find(
                    c => c.name === character.name
                ) || {};

            const psychologyData =
                psychologyCharacters.find(
                    c => c.name === character.name
                ) || {};

            const beliefData =
                beliefCharacters.find(
                    c => c.name === character.name
                ) || {};

            const contradictionData =
                contradictionCharacters.find(
                    c => c.name === character.name
                ) || {};

            const identityData =
                identityCharacters.find(
                    c => c.name === character.name
                ) || {};

            const transformationData =
                transformationCharacters.find(
                    c => c.name === character.name
                ) || {};

            const conflictData =
                conflictCharacters.find(
                    c => c.name === character.name
                ) || {};


            const motivationLayers =
                motivationData.motivationLayers || {};

            const psychologyLayers =
                psychologyData.layers || {};

            const beliefLayers =
                beliefData.layers || {};

            const contradictionLayers =
                contradictionData.layers || {};

            const identityLayers =
                identityData.layers || {};

            const transformationLayers =
                transformationData.transformationLayers || {};

            const conflictLayers =
                conflictData.layers || {};


            /*
             * 1. STARTING STATE
             *
             * Arc requires an identifiable
             * starting condition.
             */

            const hasStartingState =
                Boolean(
                    character.beforeAfter ||
                    character.initialState ||
                    character.characterTransformation?.before ||
                    character.characterTransformation?.startingState
                );


            if (hasStartingState) {

                score += 10;

                observations.push(
                    "Character initial state detected."
                );

            } else {

                problems.push(
                    "Character starting state is unclear."
                );

            }


            /*
             * 2. DESIRE / MOTIVATION
             *
             * Motivation must provide evidence
             * of a character desire or goal.
             */

            const hasDesire =
                motivationLayers.desire === true;


            if (hasDesire) {

                score += 10;

                observations.push(
                    "Character desire supports the arc."
                );

            } else {

                problems.push(
                    "Character desire does not clearly drive the arc."
                );

            }


            /*
             * 3. FEAR / PRESSURE
             *
             * Fear may come from motivation
             * or internal conflict.
             */

            const hasFear =
                motivationLayers.fear === true ||
                conflictLayers.fear === true;


            if (hasFear) {

                score += 10;

                observations.push(
                    "Fear creates pressure within the character arc."
                );

            } else {

                problems.push(
                    "Fear does not clearly influence the character arc."
                );

            }


            /*
             * 4. PSYCHOLOGICAL SUPPORT
             *
             * Psychology provides supporting evidence.
             *
             * It does NOT automatically create
             * transformation.
             */

            const hasPsychologicalEvidence =
                Object.keys(psychologyLayers).some(
                    key => psychologyLayers[key] === true
                );


            if (hasPsychologicalEvidence) {

                score += 10;

                observations.push(
                    "Psychological evidence supports the character arc."
                );

            } else {

                problems.push(
                    "Psychological evidence for the arc is limited."
                );

            }


            /*
             * 5. CONFLICT
             *
             * Conflict must actually be present
             * in the transformation or conflict analysis.
             */

            const hasConflict =
                transformationLayers.conflict === true ||
                conflictLayers.emotionalPressure === true ||
                conflictLayers.pressure === true;


            if (hasConflict) {

                score += 15;

                observations.push(
                    "Conflict tests the character arc."
                );

            } else {

                problems.push(
                    "Character arc lacks clear conflict pressure."
                );

            }


            /*
             * 6. MEANINGFUL CHOICES
             *
             * Choices are evidence of agency.
             */

            const hasChoices =
                transformationLayers.choices === true ||
                motivationLayers.choice === true;


            if (hasChoices) {

                score += 15;

                observations.push(
                    "Character choices create arc progression."
                );

            } else {

                problems.push(
                    "Character evolution lacks meaningful choices."
                );

            }


            /*
             * 7. CONSEQUENCES
             *
             * IMPORTANT:
             *
             * Consequences must come from
             * CharacterTransformationDepth.
             *
             * Do NOT inspect character.transformationLayers
             * because the source character comes from
             * characterExtraction.
             */

            const hasConsequences =
                transformationLayers.consequences === true;


            if (hasConsequences) {

                score += 15;

                observations.push(
                    "Character choices produce consequences."
                );

            } else {

                problems.push(
                    "Character choices have insufficient consequences."
                );

            }


            /*
             * 8. BELIEF SYSTEM
             *
             * Belief existence is evidence,
             * but belief existence alone is NOT
             * belief transformation.
             */

            const hasBelief =
                beliefLayers.belief === true;


            if (hasBelief) {

                score += 5;

                observations.push(
                    "Belief-system analysis supports the character arc."
                );

            } else {

                problems.push(
                    "Character belief system is not sufficiently established."
                );

            }


            /*
             * 9. BELIEF / CONTRADICTION CONNECTION
             *
             * A contradiction requires both:
             *
             * belief
             * +
             * internal tension/contradiction
             */

            const hasContradiction =
                contradictionLayers.contradiction === true;


            const hasBeliefContradiction =
                hasBelief &&
                hasContradiction;


            if (hasBeliefContradiction) {

                score += 10;

                observations.push(
                    "Belief and internal contradiction reinforce the character arc."
                );

            } else {

                problems.push(
                    "Belief change and contradiction are not sufficiently connected."
                );

            }


            /*
             * 10. TRANSFORMATION
             *
             * Transformation must already be supported
             * by CharacterTransformationDepth.
             *
             * We do NOT infer it from the arc score.
             */

            const hasTransformation =
                transformationLayers.behavior === true &&
                transformationLayers.choices === true &&
                transformationLayers.consequences === true;


            if (hasTransformation) {

                score += 10;

                observations.push(
                    "Character transformation is supported by behavioral change, choices, and consequences."
                );

            } else {

                problems.push(
                    "Character transformation lacks sufficient causal evidence."
                );

            }


            /*
             * 11. IDENTITY SHIFT
             *
             * Identity shift is deliberately strict.
             *
             * We only accept explicit evidence from
             * IdentityTransformationAnalyzer.
             */

            const hasIdentityShift =
                identityLayers.identityShift === true;


            if (hasIdentityShift) {

                score += 5;

                observations.push(
                    "Identity-level transformation is supported."
                );

            } else {

                problems.push(
                    "Identity-level transformation is not sufficiently supported."
                );

            }


            /*
             * 12. ARC COHERENCE
             *
             * Coherence is based on connected evidence,
             * not simply on the accumulated score.
             */

            const causalChain =
                hasStartingState &&
                hasDesire &&
                hasChoices &&
                hasConsequences;


            const conflictChain =
                hasFear &&
                hasConflict;


            const psychologicalChain =
                hasPsychologicalEvidence &&
                hasBelief;


            const transformationChain =
                hasTransformation &&
                hasContradiction;


            const strongArc =
                causalChain &&
                conflictChain &&
                transformationChain;


            if (strongArc) {

                observations.push(
                    "Character arc contains a strong causal progression."
                );

            }


            if (
                causalChain &&
                psychologicalChain &&
                transformationChain
            ) {

                observations.push(
                    "Character arc connects external actions with internal development."
                );

            }


            /*
             * 13. FINAL ASSESSMENT
             */

            score =
                Math.min(
                    score,
                    100
                );


            /*
 * Final coherence assessment
 *
 * Score alone is NOT enough.
 *
 * A highly coherent character arc requires
 * an actual causal progression:
 *
 * starting state
 *      ↓
 * desire
 *      ↓
 * choices
 *      ↓
 * consequences
 *      ↓
 * conflict
 *      ↓
 * transformation
 */

if (
    strongArc &&
    score >= 80
) {

    observations.push(
        "Character arc is highly coherent."
    );

}
else if (
    causalChain &&
    conflictChain &&
    score >= 60
) {

    observations.push(
        "Character arc is substantially coherent."
    );

}
else if (
    score >= 40
) {

    observations.push(
        "Character arc is partially coherent."
    );

}
else {

    problems.push(
        "Character arc lacks sufficient structural connection."
    );

}


            /*
             * 14. RESULT
             */

            results.push({

                name:
                    character.name,

                arcScore:
                    score,

                observations,

                problems,

                layers: {

                    startingState:
                        hasStartingState,

                    desire:
                        hasDesire,

                    fear:
                        hasFear,

                    psychology:
                        hasPsychologicalEvidence,

                    conflict:
                        hasConflict,

                    choice:
                        hasChoices,

                    consequence:
                        hasConsequences,

                    belief:
                        hasBelief,

                    contradiction:
                        hasBeliefContradiction,

                    transformation:
                        hasTransformation,

                    identity:
                        hasIdentityShift,

                    causalChain,

                    conflictChain,

                    transformationChain,

                    coherence:
                        strongArc

                }

            });


            totalScore += score;

        }


        /*
         * Final manuscript-level score
         */

        return {

            arcScore:
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
    CharacterArcCoherenceAnalyzer;
