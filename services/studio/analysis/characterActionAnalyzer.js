/**
 * 🎬 Character Action Analyzer
 * Анализирует влияние персонажа на историю
 */

class CharacterActionAnalyzer {

    static analyze(project) {

        const result = {

            characters: [],

            issues: [],

            observations: []

        };


        if (
            !project.characters ||
            project.characters.length === 0
        ) {

            result.observations.push(
                "No characters found."
            );

            return result;

        }


        project.characters.forEach(character => {

            const characterScenes =
                (project.scenes || []).filter(
                    scene =>
                        scene.characters &&
                        scene.characters.includes(character.id)
                );


            /*
             * Scene-level fields such as goal,
             * decision and outcome are not automatically
             * attributed to every character in the scene.
             *
             * Evidence is counted only when the character
             * is explicitly referenced by name.
             */

            const characterName =
                character.name || "";


            const belongsToCharacter =
                value => {

                    if (
                        typeof value !== "string" ||
                        !characterName
                    ) {
                        return false;
                    }

                    return value
                        .toLowerCase()
                        .includes(
                            characterName.toLowerCase()
                        );

                };


            const decisions =
                characterScenes.filter(
                    scene =>
                        belongsToCharacter(
                            scene.decision
                        )
                );


            const goals =
                characterScenes.filter(
                    scene =>
                        belongsToCharacter(
                            scene.goal
                        )
                );


            const outcomes =
                characterScenes.filter(
                    scene =>
                        belongsToCharacter(
                            scene.outcome
                        )
                );


            const actionScore =
                Math.min(
                    100,
                    (
                        decisions.length * 30 +
                        goals.length * 20 +
                        outcomes.length * 20
                    )
                );


            result.characters.push({

                name:
                    character.name,

                role:
                    character.role,

                sceneCount:
                    characterScenes.length,

                decisions:
                    decisions.length,

                goals:
                    goals.length,

                outcomes:
                    outcomes.length,

                actionScore

            });


            if (
                actionScore < 30
            ) {

                result.issues.push({

                    type:
                        "character_action",

                    character:
                        character.name,

                    description:
                        `${character.name} does not sufficiently influence story events.`,

                    suggestions: [

                        "Add meaningful decisions",

                        "Create consequences from character choices",

                        "Show characters pursuing clear goals"

                    ]

                });

            }

        });


        result.observations.push(
            "Character actions analyzed."
        );


        return result;

    }

}


module.exports = CharacterActionAnalyzer;
