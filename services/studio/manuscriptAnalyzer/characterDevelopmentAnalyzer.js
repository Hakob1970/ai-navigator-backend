class CharacterDevelopmentAnalyzer {


    static analyze(chapters, characters) {


        if (
            !characters ||
            characters.length === 0
        ) {

            return {
                developmentScore: 0,
                characters: []
            };

        }


        const results =
            characters.map(character => {

                const characterName =
                    character.name || "";

                const name =
                    characterName.toLowerCase();


                let score = 0;

                const strengths = [];
                const weaknesses = [];


                const chapterStates =
                    chapters.map(chapter => {

                        const text =
                            chapter.text || "";


                        /*
                         * Split chapter into sentences.
                         *
                         * Development evidence must be
                         * connected to the specific character.
                         */
                        const sentences =
                            text
                                .split(/(?<=[.!?])\s+/)
                                .map(sentence =>
                                    sentence.trim()
                                )
                                .filter(Boolean);


                        /*
                         * Keep only sentences where the
                         * character is actually mentioned.
                         */
                        const characterSentences =
                            sentences.filter(sentence =>
                                sentence
                                    .toLowerCase()
                                    .includes(name)
                            );


                        const characterText =
                            characterSentences.join(" ");


                        return {

                            chapterId:
                                chapter.id,

                            mentions:
                                characterSentences.length > 0,


                            /*
                             * Decision evidence is now
                             * character-specific.
                             */
                            hasDecision:
                                /choice|decided|chose|accepted|refused|ignored|left|stayed|saved|escaped|agreed|rejected/i
                                    .test(characterText),


                            /*
                             * Change evidence is now
                             * character-specific.
                             */
                            hasChange:
                                /changed|realized|understood|became|learned|lost|gained|discovered|recognized|admitted|accepted/i
                                    .test(characterText),


                            /*
                             * Emotional evidence is now
                             * character-specific.
                             */
                            hasEmotion:
                                /fear|anger|hope|regret|love|hate|confused|afraid|worried|wondered|relief|grief|sad|angry|terrified/i
                                    .test(characterText)

                        };

                    });


                const decisions =
                    chapterStates.filter(
                        c => c.hasDecision
                    ).length;


                const changes =
                    chapterStates.filter(
                        c => c.hasChange
                    ).length;


                const emotions =
                    chapterStates.filter(
                        c => c.hasEmotion
                    ).length;


                /*
                 * Decision evidence
                 */
                if (decisions > 0) {

                    score += 30;

                    strengths.push(
                        "Character decisions detected"
                    );

                }
                else {

                    weaknesses.push(
                        "No important character decisions detected"
                    );

                }


                /*
                 * Change evidence
                 */
                if (changes > 0) {

                    score += 40;

                    strengths.push(
                        "Character transformation signs detected"
                    );

                }
                else {

                    weaknesses.push(
                        "Character transformation unclear"
                    );

                }


                /*
                 * Emotional evidence
                 */
                if (emotions > 0) {

                    score += 20;

                    strengths.push(
                        "Emotional development detected"
                    );

                }
                else {

                    weaknesses.push(
                        "Emotional journey unclear"
                    );

                }


                /*
                 * Low development warning
                 */
                if (score < 50) {

                    weaknesses.push(
                        "Character arc may feel incomplete"
                    );

                }


                return {

                    character:
                        character.name,

                    developmentScore:
                        score,

                    strengths,

                    weaknesses,

                    chapterStates

                };

            });


        const average =
            results.length
                ? Math.round(
                    results.reduce(
                        (sum, c) =>
                            sum + c.developmentScore,
                        0
                    )
                    /
                    results.length
                )
                : 0;


        return {

            developmentScore:
                average,

            characters:
                results

        };

    }

}


module.exports =
    CharacterDevelopmentAnalyzer;
