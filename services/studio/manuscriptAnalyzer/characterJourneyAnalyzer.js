class CharacterJourneyAnalyzer {

    static analyze(characterExtraction) {

        if (
            !characterExtraction ||
            !Array.isArray(characterExtraction.characters)
        ) {
            return {
                journeyScore: 0,
                characters: []
            };
        }


        const characters =
            characterExtraction.characters.map(
                character => {

                    let score = 0;

                    const observations = [];
                    const problems = [];


                    const journey = {

                        beginning:
                            character.actions?.[0] || null,

                        pressure:
                            character.conflicts || [],

                        choices:
                            character.decisions || [],

                        consequences:
                            [],

                        changeIndicators:
                            []

                    };


                    const chapters =
                        Array.isArray(character.chapters)
                            ? character.chapters
                            : [];


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
                     */

                    if (chapters.length > 0) {

                        score += 20;

                        observations.push(
                            "Character has visible story presence."
                        );

                    }
                    else {

                        problems.push(
                            "Character has no visible story presence."
                        );

                    }


                    /*
                     * 2. ACTIONS
                     */

                    if (actions.length > 0) {

                        score += 20;

                        observations.push(
                            "Character actions detected."
                        );

                    }
                    else {

                        problems.push(
                            "No visible character actions."
                        );

                    }


                    /*
                     * 3. PRESSURE / CONFLICT
                     */

                    if (conflicts.length > 0) {

                        score += 20;

                        observations.push(
                            "Character faces story pressure."
                        );

                    }
                    else {

                        problems.push(
                            "Character has no visible conflict."
                        );

                    }


                    /*
                     * 4. CHOICES
                     */

                    if (decisions.length > 0) {

                        score += 20;

                        observations.push(
                            "Character makes visible choices."
                        );

                    }
                    else {

                        problems.push(
                            "Character has no visible choices."
                        );

                    }


                    /*
                     * 5. TEMPORAL JOURNEY
                     *
                     * We only record that the character
                     * appears across multiple story stages.
                     *
                     * We DO NOT call this transformation.
                     */

                    if (chapters.length >= 2) {

                        observations.push(
                            "Character appears across multiple story stages."
                        );

                    }
                    else {

                        problems.push(
                            "Character journey is limited to one story stage."
                        );

                    }


                    /*
                     * 6. BEGINNING / ENDING
                     */

                    const beginning =
                        actions.length > 0
                            ? actions[0]
                            : null;


                    const ending =
                        actions.length > 0
                            ? actions[actions.length - 1]
                            : null;


                    journey.beginning =
                        beginning;


                    journey.ending =
                        ending;


                    /*
                     * 7. BEHAVIOR CHANGE INDICATOR
                     *
                     * This is ONLY evidence.
                     *
                     * It does not automatically mean
                     * character transformation.
                     */

                    if (
                        beginning &&
                        ending &&
                        beginning.action &&
                        ending.action &&
                        beginning.action !== ending.action
                    ) {

                        journey.changeIndicators.push({

                            from:
                                beginning.action,

                            to:
                                ending.action,

                            evidence:
                                `${character.name} shows different behavior between recorded stages.`

                        });


                        observations.push(
                            "Possible behavior change detected."
                        );

                    }


                    /*
                     * 8. SCORE LIMIT
                     */

                    score =
                        Math.min(score, 100);


                    /*
                     * 9. RETURN CHARACTER JOURNEY
                     */

                    return {

                        name:
                            character.name,

                        journeyScore:
                            score,

                        chapters,

                        actions,

                        decisions,

                        conflicts,

                        observations,

                        problems,

                        journey

                    };

                }
            );


        /*
         * AVERAGE JOURNEY SCORE
         */

        const journeyScore =
            characters.length
                ? Math.round(
                    characters.reduce(
                        (sum, character) =>
                            sum + character.journeyScore,
                        0
                    ) / characters.length
                )
                : 0;


        return {

            journeyScore,

            characters

        };

    }

}


module.exports =
    CharacterJourneyAnalyzer;
