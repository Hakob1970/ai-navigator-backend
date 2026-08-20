class CharacterArcAnalyzer {

    static analyze(
        chapters = [],
        characters = []
    ) {

        const results = [];

        /*
         * CharacterArcAnalyzer is a BASELINE analyzer.
         *
         * It does NOT declare deep transformation.
         *
         * Its job is to determine whether the manuscript
         * contains the basic observable components of
         * a character arc:
         *
         * presence
         * actions
         * choices
         * pressure
         * consequences
         * behavioral change
         *
         * Evidence must belong to the character.
         *
         * We deliberately do NOT scan the whole chapter
         * for generic words.
         */


        if (
            !Array.isArray(characters) ||
            characters.length === 0
        ) {

            return {

                characterArcScore: 0,

                characters: []

            };

        }


        /*
         * Normalize manuscript chapters.
         */

        const manuscriptChapters =
            Array.isArray(chapters)
                ? chapters
                : [];


        /*
         * Helpers
         */

        const getName =
            character =>
                typeof character === "string"
                    ? character
                    : character?.name || "";


        const escapeRegExp =
            value =>
                String(value)
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );


        const containsCharacter =
            (text, name) => {

                if (!text || !name) {
                    return false;
                }

                return new RegExp(
                    `\\b${escapeRegExp(name)}\\b`,
                    "i"
                ).test(text);

            };


        /*
         * Split chapter into sentences.
         */

        const getSentences =
            text => {

                return String(text || "")
                    .replace(/\r?\n/g, " ")
                    .split(/(?<=[.!?])\s+/)
                    .map(
                        sentence =>
                            sentence
                                .replace(/\s+/g, " ")
                                .trim()
                    )
                    .filter(Boolean);

            };


        /*
         * IMPORTANT:
         *
         * These are only supporting evidence.
         *
         * They do NOT automatically prove
         * transformation.
         */



        const conflictWords = [

            "danger",
            "risk",
            "problem",
            "conflict",
            "threat",
            "enemy",
            "battle",
            "betrayal",
            "arrested",
            "prison",
            "fought",
            "fight",
            "opposition"

        ];


        const characterChangeWords = [

    "changed",
    "became",
    "forgave",
    "overcame",
    "abandoned",
    "accepted",
    "rejected",
    "trusted",
    "distrusted"

];


        /*
         * Check whether a sentence contains
         * a word from a category.
         */

        const containsWord =
            (sentence, words) => {

                return words.some(
                    word =>
                        new RegExp(
                            `\\b${escapeRegExp(word)}\\b`,
                            "i"
                        ).test(sentence)
                );

            };


           /*
 * Determine whether a sentence contains
 * observable character change.
 *
 * IMPORTANT:
 *
 * Learning information is NOT automatically
 * treated as character transformation.
 *
 * We require the character to be explicitly
 * connected to a change of state, behavior,
 * attitude, or response.
 */

      const characterChangeEvidence =
    (
        sentence,
        name,
        stageProfiles = []
    ) => {

        if (
            !sentence ||
            !name
        ) {

            return false;

        }


        const escapedName =
            escapeRegExp(name);


        /*
         * 1. Direct observable transformation.
         *
         * Examples:
         *
         * Alex changed.
         * Alex became stronger.
         * Maya forgave him.
         * Victor overcame his fear.
         */

        const directChangePattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:had\\s+|has\\s+|have\\s+|was\\s+|is\\s+)?(?:${characterChangeWords.map(escapeRegExp).join("|")})\\b`,
                "i"
            );


        if (
            directChangePattern.test(
                sentence
            )
        ) {

            return true;

        }


        /*
         * 2. Behavioral / attitude change.
         *
         * Examples:
         *
         * Alex stopped trusting the guards.
         * Maya started trusting Alex.
         * Victor began to cooperate.
         */

        const behavioralChangePattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:stopped|started|began|began\\s+to|started\\s+to)\\s+(?:\\w+\\s+){0,3}\\w+`,
                "i"
            );


        if (
            behavioralChangePattern.test(
                sentence
            )
        ) {

            return true;

        }


        /*
         * 3. Explicit "no longer" behavioral change.
         */

        const noLongerPattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:no\\s+longer|never\\s+again)\\s+(?:\\w+\\s+){0,3}\\w+`,
                "i"
            );


        if (
            noLongerPattern.test(
                sentence
            )
        ) {

            return true;

        }

        return false;

    };


            const characterMadeDecision =
    (sentence, name) => {

        if (
            !sentence ||
            !name
        ) {

            return false;

        }


        const escapedName =
            escapeRegExp(name);


        /*
         * Strong decision / agency verbs.
         *
         * IMPORTANT:
         *
         * We only accept decisions when the
         * character name is explicitly connected
         * to the decision verb.
         *
         * We do NOT infer:
         *
         * Maya ...
         * He decided...
         *
         * because the pronoun may belong to
         * another character.
         */

        const decisionWords = [

            "chose",
            "choose",
            "chooses",

            "decided",
            "decide",
            "decides",

            "refused",
            "refuse",
            "refuses",

            "accepted",
            "accept",
            "accepts",

            "rejected",
            "reject",
            "rejects",

            "betrayed",
            "betray",

            "sacrificed",
            "sacrifice",

            "saved",
            "save",
            "saves"

        ];


        /*
         * Direct decision only.
         *
         * Examples:
         *
         * Alex decided to investigate.
         * Alex chose Maya.
         * Victor refused to surrender.
         *
         * These are valid because the character
         * name is explicitly present.
         */

        const directDecisionPattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:had\\s+|has\\s+|have\\s+)?(?:${decisionWords.map(escapeRegExp).join("|")})\\b`,
                "i"
            );


        return directDecisionPattern.test(
            sentence
        );

    };



               /*
 * Determine whether the character is
 * actually connected to the sentence.
 *
 * This is intentionally conservative.
 *
 * We do not claim perfect NLP parsing here.
 * We only prevent the old catastrophic error:
 *
 * "Victor's soldiers escaped."
 *
 * from becoming:
 *
 * Victor -> escaped
 */

const characterIsActive =
    (sentence, name) => {

        const escapedName =
            escapeRegExp(name);


        /*
         * Possessive protection
         *
         * Example:
         *
         * Victor's soldiers escaped.
         *
         * This does NOT count as:
         *
         * Victor -> escaped
         */

        if (
            new RegExp(
                `\\b${escapedName}'s\\b`,
                "i"
            ).test(sentence)
        ) {

            return false;

        }


        /*
         * Character appears as
         * grammatical subject before
         * a relevant verb.
         *
         * Examples:
         *
         * Alex chose Maya.
         * Alex decided to leave.
         * Victor accepted the offer.
         */

        const activePattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:had\\s+|has\\s+|have\\s+|was\\s+|is\\s+|were\\s+|are\\s+)?(?:\\w+\\s+){0,4}\\w+`,
                "i"
            );


        if (
            activePattern.test(sentence)
        ) {

            return true;

        }


        /*
         * Passive construction.
         *
         * Example:
         *
         * Maya was rescued.
         */

        const passivePattern =
            new RegExp(
                `\\b${escapedName}\\b\\s+(?:was|were|is|are|been|being)\\s+\\w+`,
                "i"
            );


        if (
            passivePattern.test(sentence)
        ) {

            return true;

        }


        return false;

    };


/*
 * Conservative pronoun continuation.
 *
 * Example:
 *
 * Alex stood in the darkness.
 * He chose Maya.
 *
 * The second sentence may still belong
 * to Alex.
 *
 * We only use this for strong agency verbs.
 */

const characterPronounAction =
    (sentence, name, previousSentence) => {

        if (
            !sentence ||
            !name ||
            !previousSentence
        ) {

            return false;

        }


        /*
         * The previous sentence must contain
         * an active reference to this character.
         */

        if (
            !characterIsActive(
                previousSentence,
                name
            )
        ) {

            return false;

        }


        /*
         * Explicit third-person pronoun.
         */

        if (
            !/\b(he|she|they)\b/i.test(
                sentence
            )
        ) {

            return false;

        }


        /*
         * Strong decision / agency verbs only.
         *
         * These are NOT generic actions.
         */

        const agencyWords = [

            "chose",
            "choose",
            "chooses",

            "decided",
            "decide",
            "decides",

            "refused",
            "refuse",
            "refuses",

            "accepted",
            "accept",
            "accepts",

            "agreed",
            "agree",
            "agrees",

            "rejected",
            "reject",
            "rejects"

        ];


        return containsWord(
            sentence,
            agencyWords
        );

    };



        /*
 * Extract broad observable action categories.
 *
 * IMPORTANT:
 *
 * These categories describe behavior only.
 * They do NOT interpret personality or
 * psychological transformation.
 */

const extractActionTypes =
    sentence => {

        const text =
            String(sentence || "")
                .toLowerCase();


        const actionTypes = [];


        const categories = {

            protection: [
                "saved",
                "save",
                "saves",
                "protected",
                "protect",
                "protects",
                "rescued",
                "rescue",
                "rescues",
                "defended",
                "defend",
                "defends"
            ],

            confrontation: [
                "fought",
                "fight",
                "fights",
                "confronted",
                "confront",
                "confronts",
                "challenged",
                "challenge",
                "challenges",
                "attacked",
                "attack",
                "attacks"
            ],

            avoidance: [
                "avoided",
                "avoid",
                "avoids",
                "hid",
                "hide",
                "hides",
                "waited",
                "wait",
                "waits",
                "escaped",
                "escape",
                "escapes",
                "fled",
                "flee",
                "flees"
            ],

            investigation: [
                "investigated",
                "investigate",
                "investigates",
                "searched",
                "search",
                "searches",
                "examined",
                "examine",
                "examines",
                "questioned",
                "question",
                "questions",
                "discovered",
                "discover",
                "discovers"
            ],

            resistance: [
                "refused",
                "refuse",
                "refuses",
                "resisted",
                "resist",
                "resists",
                "rejected",
                "reject",
                "rejects",
                "opposed",
                "oppose",
                "opposes"
            ],

            cooperation: [
                "agreed",
                "agree",
                "agrees",
                "helped",
                "help",
                "helps",
                "joined",
                "join",
                "joins",
                "supported",
                "support",
                "supports"
            ],

            movement: [
                "went",
                "go",
                "goes",
                "entered",
                "enter",
                "enters",
                "left",
                "leave",
                "leaves",
                "returned",
                "return",
                "returns",
                "approached",
                "approach",
                "approaches"
            ],

            communication: [
    "explained",
    "explain",
    "explains",
    "told",
    "tell",
    "tells",
    "asked",
    "ask",
    "asks",
    "answered",
    "answer",
    "answers",
    "warned",
    "warn",
    "warns",
    "informed",
    "inform",
    "informs"
],

control: [
    "controlled",
    "control",
    "controls",
    "commanded",
    "command",
    "commands",
    "ordered",
    "order",
    "orders",
    "seized",
    "seize",
    "seizes"
],


    sacrifice: [
                "sacrificed",
                "sacrifice",
                "sacrifices",
                "gave up",
                "give up",
                "risked",
                "risk",
                "risks",
                "endured",
                "endure",
                "endures"
            ],

            commitment: [
                "decided",
                "decide",
                "decides",
                "chose",
                "choose",
                "chooses",
                "committed",
                "commit",
                "commits",
                "promised",
                "promise",
                "promises",
                "swore",
                "swear"
            ],

            betrayal: [
                "betrayed",
                "betray",
                "betrays",
                "deceived",
                "deceive",
                "deceives",
                "lied",
                "lie",
                "lies"
            ],

            leadership: [
                "led",
                "lead",
                "leads",
                "commanded",
                "command",
                "commands",
                "organized",
                "organize",
                "organizes",
                "took control",
                "assumed control"
            ]


        };


        Object.entries(
            categories
        ).forEach(
            ([type, words]) => {

                const matched =
                    words.some(
                        word =>
                            new RegExp(
                                `\\b${escapeRegExp(word)}\\b`,
                                "i"
                            ).test(text)
                    );


                if (
                    matched
                ) {

                    actionTypes.push(
                        type
                    );

                }

            }
        );


        return actionTypes;

    };




        /*
         * Analyze each character separately.
         */

        characters.forEach(character => {

            const name =
                getName(character);


            if (!name) {
                return;
            }


            let appearances = 0;

            let actionEvidence = 0;

            let decisionEvidence = 0;

            let conflictEvidence = 0;

            let changeEvidence = 0;

            const stages = [];

            const decisions = [];

            const conflicts = [];

            const changes = [];


            /*
 * Track observable character behavior
 * across story stages.
 *
 * This is NOT psychological inference.
 *
 * We only record observable decisions
 * and pressure connected to the character.
 */

           const stageProfiles = [];



            /*
             * Analyze every chapter independently.
             */

            manuscriptChapters.forEach(
                (chapter, chapterIndex) => {

                    const text =
                        chapter?.text || "";

                    if (
                        !containsCharacter(
                            text,
                            name
                        )
                    ) {

                        return;

                    }


                    appearances++;


                    const chapterId =
                        chapter?.id ||
                        chapter?.chapterId ||
                        chapter?.number ||
                        chapterIndex + 1;


                    stages.push(chapterId);

                    const stageProfile = {

    chapter:
        chapterId,

    actions: 0,

    actionTypes: [],

    decisions: [],

    conflicts: 0

};


stageProfiles.push(
    stageProfile
);


                    const sentences =
                        getSentences(text);


                    sentences.forEach(
    (sentence, sentenceIndex) => {

        const containsName =
            containsCharacter(
                sentence,
                name
            );


        const previousSentences =
            sentenceIndex > 0
            ? sentences
            .slice(
                Math.max(0, sentenceIndex - 3),
                sentenceIndex
            )
            .join(" ")
        : "";


        /*
         * Direct participation:
         *
         * Alex chose Maya.
         */

        const directActive =
            containsName &&
            characterIsActive(
                sentence,
                name
            );


        const pronounActive =
            characterPronounAction(
            sentence,
            name,
            previousSentences
            );


         const active =
             directActive ||
             pronounActive;


        if (!active) {

            return;

        }



         /*
 * DEBUG:
 * Show active sentences that produce
 * no action category.
 */

const debugActionTypes =
    extractActionTypes(
        sentence
    );

if (
    debugActionTypes.length === 0
) {

    console.log(
        "ACTION TYPE DEBUG:",
        {
            character: name,
            chapter: chapterId,
            sentence
        }
    );

}


        /*
         * Any active sentence is
         * basic action evidence.
         */

        actionEvidence++;

        stageProfile.actions++;


const actionTypes =
    extractActionTypes(
        sentence
    );


actionTypes.forEach(
    type => {

        if (
            !stageProfile.actionTypes.includes(
                type
            )
        ) {

            stageProfile.actionTypes.push(
                type
            );

        }

    }
);


                        /*
                         * Decisions
                         */

                         if (
    characterMadeDecision(
        sentence,
        name,
        previousSentences
    )
) {

    decisionEvidence++;


    decisions.push({

        chapter:
            chapterId,

        evidence:
            sentence

    });


    stageProfile.decisions.push(
        sentence
    );

}


                        /*
                         * Conflict / pressure
                         */

                        if (
                            containsWord(
                                sentence,
                                conflictWords
                            )
                        ) {

                            conflictEvidence++;

                            stageProfile.conflicts++;

                            conflicts.push({

                                chapter:
                                    chapterId,

                                evidence:
                                    sentence

                            });

                        }


                      /*
 * Possible change evidence.
 *
 * IMPORTANT:
 *
 * A change indicator must be explicitly
 * connected to this character.
 *
 * We do NOT treat every event involving
 * the character as character change.
 */

if (
    characterChangeEvidence(
        sentence,
        name,
        stageProfiles
    )
) {

    changeEvidence++;

    changes.push({

        chapter:
            chapterId,

        evidence:
            sentence

    });

}

                    });

                }
            );



            /*
 * Detect observable behavioral change
 * across story stages.
 *
 * We do NOT infer psychological transformation.
 *
 * We only look for observable decisions
 * occurring at different story stages and
 * expressed through different agency verbs.
 */

const decisionStages =
    stageProfiles.filter(
        stage =>
            stage.decisions.length > 0
    );


const extractDecisionVerb =
    sentence => {

        const decisionVerbPattern =
            /\b(chose|choose|chooses|decided|decide|decides|refused|refuse|refuses|accepted|accept|accepts|agreed|agree|agrees|rejected|reject|rejects|betrayed|betray|sacrificed|sacrifice|saved|save|saves)\b/i;


        const match =
            String(sentence || "")
                .match(
                    decisionVerbPattern
                );


        return match
            ? match[1].toLowerCase()
            : null;

    };


const decisionPatterns =
    decisionStages.map(
        stage => ({

            chapter:
                stage.chapter,

            verbs:
                stage.decisions
                    .map(
                        extractDecisionVerb
                    )
                    .filter(Boolean)

        })
    );


const stagesWithDecisionVerbs =
    decisionPatterns.filter(
        stage =>
            stage.verbs.length > 0
    );


if (
    stagesWithDecisionVerbs.length >= 2
) {

    const firstStage =
        stagesWithDecisionVerbs[0];


    const laterStages =
        stagesWithDecisionVerbs.slice(1);


    const firstVerbs =
        new Set(
            firstStage.verbs
        );


    const behavioralShift =
        laterStages.some(
            stage =>
                stage.verbs.some(
                    verb =>
                        !firstVerbs.has(
                            verb
                        )
                )
        );


    if (
        behavioralShift
    ) {

        changeEvidence++;


        const changedStage =
            laterStages.find(
                stage =>
                    stage.verbs.some(
                        verb =>
                            !firstVerbs.has(
                                verb
                            )
                    )
            );


        changes.push({

            chapter:
                changedStage.chapter,

            evidence:
                `Observable decision pattern changed from [${firstStage.verbs.join(", ")}] to [${changedStage.verbs.join(", ")}].`

        });

    }

}




              /*
 * Detect observable behavioral shift
 * across story stages.
 *
 * IMPORTANT:
 *
 * A behavioral shift is NOT treated as
 * proof of psychological transformation.
 *
 * It only means that different observable
 * action categories appear at different
 * stages.
 */

const actionStages =
    stageProfiles.filter(
        stage =>
            stage.actionTypes.length > 0
    );


if (
    actionStages.length >= 2
) {

    const midpoint =
        Math.ceil(
            actionStages.length / 2
        );


    const earlyStages =
        actionStages.slice(
            0,
            midpoint
        );


    const laterStages =
        actionStages.slice(
            midpoint
        );


    const earlyActionTypes =
        new Set();


    earlyStages.forEach(
        stage => {

            stage.actionTypes.forEach(
                type => {

                    earlyActionTypes.add(
                        type
                    );

                }
            );

        }
    );


    const laterActionTypes =
        new Set();


    laterStages.forEach(
        stage => {

            stage.actionTypes.forEach(
                type => {

                    laterActionTypes.add(
                        type
                    );

                }
            );

        }
    );


        const laterActionTypeCounts = {};

laterStages.forEach(
    stage => {

        stage.actionTypes.forEach(
            type => {

                laterActionTypeCounts[type] =
                    (laterActionTypeCounts[type] || 0) + 1;

            }
        );

    }
);


/*
 * A new behavior appearing once is not
 * automatically enough to prove a shift.
 *
 * Strong evidence:
 *
 * 1. The behavior appears in at least
 *    two later stages.
 *
 * OR
 *
 * 2. The behavior appears in one later stage
 *    and that same stage also contains
 *    observable decision evidence.
 *
 * This keeps the baseline conservative
 * without requiring every behavioral change
 * to repeat twice.
 */

const newLaterBehavior =
    Object.entries(
        laterActionTypeCounts
    )
    .filter(
        ([type, count]) => {

            if (
                earlyActionTypes.has(type)
            ) {

                return false;

            }


            /*
             * Repeated behavior across
             * multiple later stages.
             */

            if (
                count >= 2
            ) {

                return true;

            }


            /*
             * Single later occurrence can
             * still be meaningful when it is
             * connected to an observable decision.
             */

            const decisionConnected =
                laterStages.some(
                    stage =>

                        stage.actionTypes.includes(
                            type
                        ) &&

                        stage.decisions.length > 0
                );


            return decisionConnected;

        }
    )
    .map(
        ([type]) =>
            type
    );


    if (
        newLaterBehavior.length > 0
    ) {

        changeEvidence++;


        const changedStage =
            laterStages.find(
                stage =>
                    stage.actionTypes.some(
                        type =>
                            newLaterBehavior.includes(
                                type
                            )
                    )
            );


        changes.push({

            chapter:
                changedStage.chapter,

            evidence:
                `Observable behavioral shift detected: later stage introduced action type(s) [${newLaterBehavior.join(", ")}].`

        });

    }

}



            /*
             * Score the BASELINE arc.
             *
             * Maximum = 100.
             *
             * This score is NOT transformation depth.
             */

            let score = 0;

            const observations = [];
            const problems = [];


            /*
             * 1. Presence
             */

            if (
                appearances > 0
            ) {

                score += 20;

                observations.push(
                    "Character appears in the manuscript."
                );

            }
            else {

                problems.push(
                    "Character does not appear in the manuscript."
                );

            }


            /*
             * 2. Actions
             */

            if (
                actionEvidence > 0
            ) {

                score += 15;

                observations.push(
                    "Character has observable actions."
                );

            }
            else {

                problems.push(
                    "No clear character actions detected."
                );

            }


            /*
             * 3. Choices
             */

            if (
                decisionEvidence > 0
            ) {

                score += 20;

                observations.push(
                    "Character makes observable choices."
                );

            }
            else {

                problems.push(
                    "No clear character choices detected."
                );

            }


            /*
             * 4. Pressure
             */

            if (
                conflictEvidence > 0
            ) {

                score += 15;

                observations.push(
                    "Character faces observable pressure or conflict."
                );

            }
            else {

                problems.push(
                    "No clear pressure or conflict connected to the character."
                );

            }


            /*
             * 5. Multiple story stages
             *
             * A character appearing in only one
             * stage cannot demonstrate a developed arc.
             */

            const uniqueStages =
                [...new Set(stages)];


            if (
                uniqueStages.length >= 2
            ) {

                score += 15;

                observations.push(
                    "Character appears across multiple story stages."
                );

            }
            else {

                problems.push(
                    "Character appears in only one story stage."
                );

            }


            /*
             * 6. Possible change
             *
             * This is intentionally weak evidence.
             */

            if (
                changeEvidence > 0
            ) {

                score += 15;

                observations.push(
                    "Possible character change evidence detected."
                );

            }
            else {

                problems.push(
                    "No explicit change indicators detected."
                );

            }


            score =
                Math.min(
                    score,
                    100
                );


            /*
             * Arc status
             */

            let arcStatus =
                "insufficient";


            if (
                score >= 70
            ) {

                arcStatus =
                    "observable";

            }
            else if (
                score >= 45
            ) {

                arcStatus =
                    "partial";

            }


            /*
             * Return character result.
             */

            results.push({

                character:
                    name,

                score,

                arcStatus,

                evidence: {

                    appearances,

                    actionEvidence,

                    decisionEvidence,

                    conflictEvidence,

                    changeEvidence,

                    stageProfiles,

                    stages:
                        uniqueStages,

                    decisions,

                    conflicts,

                    changes

                },

                observations,

                problems

            });

        });


        /*
         * Manuscript-level score.
         */

        const characterArcScore =
            results.length
                ? Math.round(
                    results.reduce(
                        (sum, character) =>
                            sum + character.score,
                        0
                    ) /
                    results.length
                )
                : 0;


        return {

            characterArcScore,

            characters:
                results

        };

    }

}


module.exports =
    CharacterArcAnalyzer;
