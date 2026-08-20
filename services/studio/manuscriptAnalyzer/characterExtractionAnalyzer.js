class CharacterExtractionAnalyzer {

    static analyze(chapters = [], knownCharacters = []) {

        const characters = {};

        if (!chapters || !chapters.length) {
            return { characters: [] };
        }

        // =========================================
        // 1. SOURCE OF TRUTH — PROJECT CHARACTERS
        // =========================================

        const names = Array.isArray(knownCharacters)
            ? knownCharacters
                .map(character =>
                    typeof character === "string"
                        ? character
                        : character?.name
                )
                .filter(Boolean)
            : [];

        // =========================================
        // 2. CREATE ONLY KNOWN CHARACTERS
        // =========================================

        names.forEach(name => {

            characters[name] = {

                name,

                appearances: 0,

                chapters: [],

                actions: [],
                decisions: [],
                conflicts: [],
                goals: [],
                needs: [],
                fears: [],
                sacrifices: []

            };

        });

        if (!names.length) {
            return {
                characters: []
            };
        }

        // =========================================
        // 3. HELPERS
        // =========================================

        const escapeRegExp = value =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


        const containsCharacter = (text, name) => {

            const regex =
                new RegExp(
                    `\\b${escapeRegExp(name)}\\b`,
                    "i"
                );

            return regex.test(text);

        };


        /*
         * IMPORTANT:
         * Evidence is now the ACTUAL sentence
         * containing the character.
         *
         * This keeps:
         *
         * action
         * +
         * evidence
         *
         * inside the same semantic unit.
         */

        const getSentences = text => {

            return text
                .replace(/\r?\n/g, " ")
                .split(/(?<=[.!?])\s+/)
                .map(sentence =>
                    sentence
                        .replace(/\s+/g, " ")
                        .trim()
                )
                .filter(Boolean);

        };


        const addUnique = (array, item) => {

            const key =
                JSON.stringify(item);

            if (
                !array.some(
                    existing =>
                        JSON.stringify(existing) === key
                )
            ) {
                array.push(item);
            }

        };


        /*
         * Check that the verb actually belongs
         * to the sentence containing the character.
         *
         * We deliberately do NOT search 100 characters
         * before/after the name anymore.
         */

        const sentenceContainsWord = (
            sentence,
            word
        ) => {

            return new RegExp(
                `\\b${escapeRegExp(word)}\\b`,
                "i"
            ).test(sentence);

        };


        /*
         * Prevent false attribution such as:
         *
         * "Victor's soldiers escaped."
         *
         * from becoming:
         *
         * Victor -> escaped
         *
         * We only accept the verb if the character
         * itself participates in the local sentence
         * rather than appearing only as a possessive
         * modifier.
         */

        const characterIsSubjectLike = (
    sentence,
    name,
    verb
) => {

    const escapedName =
        escapeRegExp(name);

    const escapedVerb =
        escapeRegExp(verb);

    const normalized =
        sentence
            .replace(/\s+/g, " ")
            .trim();


    // =========================================
    // 1. DIRECT SUBJECT
    // =========================================
    //
    // Alex saved Maya.
    // Alex escaped.
    // Alex wanted to leave.
    //

    const directSubject =
        new RegExp(
            `\\b${escapedName}\\b\\s+(?:had\\s+|has\\s+|have\\s+|was\\s+|is\\s+|were\\s+|are\\s+)?(?:\\w+\\s+){0,3}\\b${escapedVerb}\\b`,
            "i"
        );

    if (directSubject.test(normalized)) {
        return true;
    }


    // =========================================
    // 2. PASSIVE SUBJECT
    // =========================================
    //
    // Maya was saved.
    // Maya was rescued by Alex.
    //
    // IMPORTANT:
    // verb must be followed by a passive
    // construction, not merely appear before name.
    //

    const passiveSubject =
        new RegExp(
            `\\b${escapedName}\\b\\s+(?:was|were|is|are|been|being)\\s+(?:\\w+\\s+){0,2}\\b${escapedVerb}\\b`,
            "i"
        );

    if (passiveSubject.test(normalized)) {
        return true;
    }


    // =========================================
    // 3. POSSESSIVE PROTECTION
    // =========================================
    //
    // Victor's soldiers escaped.
    //
    // Victor is NOT the subject.
    //

    const possessive =
        new RegExp(
            `\\b${escapedName}'s\\b`,
            "i"
        );

    if (possessive.test(normalized)) {
        return false;
    }


    // =========================================
    // 4. OBJECT PROTECTION
    // =========================================
    //
    // He chose Maya.
    // Alex saved Maya.
    //
    // Maya is the object, not the subject.
    //

    const objectAfterPronoun =
        new RegExp(
            `\\b(?:he|she|they|him|her|them)\\b[^.!?]{0,60}\\b${escapedVerb}\\b[^.!?]{0,60}\\b${escapedName}\\b`,
            "i"
        );

    if (objectAfterPronoun.test(normalized)) {
        return false;
    }


    // =========================================
    // 5. DEFAULT
    // =========================================

    return false;

};


        // =========================================
        // 4. ANALYSIS WORDS
        // =========================================

        const behaviorWords = [

            "looked",
            "walked",
            "ran",
            "opened",
            "closed",
            "prepared",
            "jumped",
            "waited",
            "followed",
            "watched",
            "entered",
            "left",
            "stood",
            "turned",
            "shook",
            "smiled",
            "cried"

        ];


        const decisionWords = [

            "chose",
            "decided",
            "refused",
            "accepted",
            "betrayed",
            "saved",
            "escaped",
            "revealed",
            "sacrificed",
            "attacked",
            "arrested",
            "returned"

        ];


        const conflictWords = [

            "danger",
            "fight",
            "problem",
            "risk",
            "conflict",
            "threat",
            "enemy",
            "battle",
            "betrayal"

        ];


        const goalWords = [

            "want",
            "wanted",
            "need",
            "needed",
            "seek",
            "protect",
            "save",
            "defend",
            "rescue",
            "survive",
            "escape",
            "find",
            "prove",
            "return",
            "revenge",
            "mission",
            "promise"

        ];


        const needWords = [

            "learn",
            "accept",
            "change",
            "understand",
            "forgive",
            "overcome",
            "realize",
            "discover"

        ];


        // =========================================
        // 5. CHAPTER ANALYSIS
        // =========================================

        chapters.forEach(chapter => {

            const text =
                chapter.text || "";

            const sentences =
                getSentences(text);

            const chapterId =
                chapter.id ||
                chapter.chapterId ||
                chapter.number;


            names.forEach(name => {

                if (!characters[name]) {
                    return;
                }

                // =================================
                // CHARACTER PRESENCE
                // =================================

                if (!containsCharacter(text, name)) {
                    return;
                }

                characters[name].appearances++;

                if (
                    chapterId &&
                    !characters[name]
                        .chapters
                        .includes(chapterId)
                ) {

                    characters[name]
                        .chapters
                        .push(chapterId);

                }


                // =================================
                // PROCESS EACH SENTENCE
                // =================================

                sentences.forEach(sentence => {

                    if (
                        !containsCharacter(
                            sentence,
                            name
                        )
                    ) {
                        return;
                    }


                    const evidence =
                        sentence;


                    // =================================
                    // ACTIONS
                    // =================================

                    behaviorWords.forEach(action => {

                        if (
                            !sentenceContainsWord(
                                sentence,
                                action
                            )
                        ) {
                            return;
                        }

                        if (
                            !characterIsSubjectLike(
                                sentence,
                                name,
                                action
                            )
                        ) {
                            return;
                        }

                        addUnique(
                            characters[name].actions,
                            {

                                chapter: chapterId,

                                action,

                                importance: "medium",

                                type: "behavior",

                                evidence

                            }
                        );

                    });


                    // =================================
                    // DECISIONS
                    // =================================

                    decisionWords.forEach(decision => {

                        if (
                            !sentenceContainsWord(
                                sentence,
                                decision
                            )
                        ) {
                            return;
                        }

                        if (
                            !characterIsSubjectLike(
                                sentence,
                                name,
                                decision
                            )
                        ) {
                            return;
                        }

                        addUnique(
                            characters[name].decisions,
                            {

                                chapter: chapterId,

                                decision,

                                evidence

                            }
                        );


                        addUnique(
                            characters[name].actions,
                            {

                                chapter: chapterId,

                                action: decision,

                                importance: "high",

                                type: "decision",

                                evidence

                            }
                        );

                    });


                    // =================================
                    // CONFLICT
                    // =================================

                    conflictWords.forEach(conflict => {

                        if (
                            !sentenceContainsWord(
                                sentence,
                                conflict
                            )
                        ) {
                            return;
                        }

                        addUnique(
                            characters[name].conflicts,
                            {

                                chapter: chapterId,

                                conflict,

                                evidence

                            }
                        );

                    });


                    // =================================
                    // GOALS
                    // =================================

                    goalWords.forEach(goal => {

                        if (
                            !sentenceContainsWord(
                                sentence,
                                goal
                            )
                        ) {
                            return;
                        }

                        if (
                            !characterIsSubjectLike(
                                sentence,
                                name,
                                goal
                            )
                        ) {
                            return;
                        }

                        addUnique(
                            characters[name].goals,
                            {

                                chapter: chapterId,

                                type: goal,

                                evidence

                            }
                        );

                    });


                    // =================================
                    // INTERNAL NEEDS
                    // =================================

                    needWords.forEach(need => {

                        if (
                            !sentenceContainsWord(
                                sentence,
                                need
                            )
                        ) {
                            return;
                        }

                        if (
                            !characterIsSubjectLike(
                                sentence,
                                name,
                                need
                            )
                        ) {
                            return;
                        }

                        addUnique(
                            characters[name].needs,
                            {

                                chapter: chapterId,

                                type: need,

                                evidence

                            }
                        );

                    });

                });

            });

        });


        // =========================================
        // 6. REMOVE EMPTY CHARACTER SHELLS
        // =========================================

        const result =
            Object.values(characters)
                .filter(
                    character =>
                        character.appearances > 0
                );


        // =========================================
        // 7. RETURN
        // =========================================

        return {

            characters: result

        };

    }

}


module.exports =
    CharacterExtractionAnalyzer;
