class ConflictAnalyzer {

    static analyze(project) {

        const result = {

            conflicts: [],
            observations: []

        };


        if (!project.characters) {

            result.observations.push(
                "No characters found."
            );

            return result;

        }


        project.characters.forEach(character => {


            const missing = [];


            if (
                !character.conflict ||
                !character.conflict.internal
            ) {

                missing.push(
                    "internal conflict"
                );

            }


            if (
                !character.conflict ||
                !character.conflict.external
            ) {

                missing.push(
                    "external conflict"
                );

            }


            if (
                missing.length > 0
            ) {

                result.conflicts.push({

                    character:
                        character.name,

                    missing

                });

            }


        });



        if (
            result.conflicts.length > 0
        ) {

            result.observations.push(
                "Character conflicts require development."
            );

        }
        else {

            result.observations.push(
                "Character conflicts are present."
            );

        }


        return result;

    }

}


module.exports = ConflictAnalyzer;
