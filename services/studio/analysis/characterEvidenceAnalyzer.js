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



            const characterActions =
                characterScenes.filter(
                    scene =>
                        scene.goal ||
                        scene.obstacle ||
                        scene.outcome
                );



            const characterDialogues =
                characterScenes.filter(
                    scene =>
                        scene.dialoguePoints &&
                        scene.dialoguePoints.length > 0
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
