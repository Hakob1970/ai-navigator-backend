/**
 * 🎭 CharacterBuilder
 * Автоматически предлагает развитие персонажей
 */

class CharacterBuilder {

    static buildSuggestions(character) {

    const role =
        character.role || "supporting";


    // =========================
    // 🎭 PROTAGONIST
    // =========================

    if (role === "protagonist") {

        return {

            goal:
                "Find purpose and complete a meaningful mission",

            fear:
                "Failure, losing loved ones, or not being enough",

            internalConflict:
                "Struggles between personal desires and responsibility",

            externalConflict:
                "Faces powerful enemies and difficult obstacles",

            arc:
                "Grows from an uncertain person into a true leader"

        };

    }



    // =========================
    // 🦹 ANTAGONIST
    // =========================

    if (role === "antagonist") {

        return {

            goal:
                "Gain control and achieve personal ambitions",

            fear:
                "Losing power, influence, or control",

            internalConflict:
                "Conflict between ambition and hidden weaknesses",

            externalConflict:
                "Opposes the protagonist and creates major threats",

            arc:
                "Moves toward corruption, downfall, or possible redemption"

        };

    }



    // =========================
    // 🤝 SUPPORTING
    // =========================

    return {

        goal:
            "Support the main story while pursuing a personal purpose",

        fear:
            "Being forgotten, powerless, or unable to help",

        internalConflict:
            "Balances personal needs with loyalty to others",

        externalConflict:
            "Faces challenges connected to the main conflict",

        arc:
            "Changes through relationships and important experiences"

    };

}

}

module.exports = CharacterBuilder;
