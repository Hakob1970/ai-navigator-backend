/**
 * 🎬 Character Action Analyzer
 * Анализирует влияние персонажа на историю
 */

class CharacterActionAnalyzer {

    static analyze(project) {

        const result = {

            characters: [],

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


            const decisions =
                characterScenes.filter(
                    scene => scene.decision
                );


            const goals =
                characterScenes.filter(
                    scene => scene.goal
                );


            const outcomes =
                characterScenes.filter(
                    scene => scene.outcome
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

        });


        result.observations.push(
            "Character actions analyzed."
        );

        return result;

    }

}

module.exports = CharacterActionAnalyzer;
