/**
 * 🎭 Character Evidence Analyzer
 * Анализ доказательства персонажа через сцены, действия и диалоги
 */

class CharacterEvidenceAnalyzer {

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


           console.log("CHARACTER SCENE DEBUG:", {
    character: character.name,
    scenes: characterScenes
});


            /*
             * IMPORTANT:
             *
             * Scene-level fields such as goal,
             * obstacle and outcome belong to the
             * scene as a whole.
             *
             * They must not automatically be treated
             * as evidence of every character present
             * in that scene.
             *
             * Character-specific action evidence will
             * be handled by CharacterActionAnalyzer.
             */

            const characterActions = [];


            /*
             * Dialogue evidence is counted only when
             * the dialogue explicitly identifies the
             * speaking character.
             *
             * Support both:
             *   dialoguePoints
             * and legacy/test
             *   dialogue
             */

            const characterDialogues =
                characterScenes.filter(scene => {

                    const dialogue =
                        Array.isArray(scene.dialoguePoints)
                            ? scene.dialoguePoints
                            : Array.isArray(scene.dialogue)
                                ? scene.dialogue
                                : [];

                    return dialogue.some(point => {

                        if (!point) {
                            return false;
                        }

                        return (
                            point.character === character.id ||
                            point.character === character.name
                        );

                    });

                });


            console.log(
                "CHARACTER EVIDENCE DEBUG:",
                {
                    character: character.name,
                    id: character.id,
                    sceneCount: characterScenes.length,
                    actionEvidence:
                        characterActions.length,
                    dialogueEvidence:
                        characterDialogues.length,
                    presenceScore:
                        characterScenes.length === 0
                            ? 0
                            : characterScenes.length < 3
                                ? 40
                                : characterScenes.length < 5
                                    ? 70
                                    : 100
                }
            );


            result.characters.push({

                name:
                    character.name,

                role:
                    character.role,


                sceneCount:
                    characterScenes.length,


                actionEvidence:
                    characterActions.length,


                dialogueEvidence:
                    characterDialogues.length,


                presenceScore:
                    characterScenes.length === 0
                        ? 0
                        : characterScenes.length < 3
                            ? 40
                            : characterScenes.length < 5
                                ? 70
                                : 100,


                evidenceScore:
                    Math.min(
                        100,
                        (
                            characterScenes.length * 20 +
                            characterActions.length * 20 +
                            characterDialogues.length * 20
                        )
                    )

            });


        });


        if (
            result.characters.length > 0
        ) {

            result.observations.push(
                "Character presence in story scenes analyzed."
            );

        }


        const invisibleCharacters =
            result.characters.filter(
                character =>
                    character.sceneCount === 0
            );


        if (
            invisibleCharacters.length > 0
        ) {

            result.observations.push(
                "Some characters exist in structure but do not appear in scenes."
            );

        }


        return result;

    }

}


module.exports = CharacterEvidenceAnalyzer;
