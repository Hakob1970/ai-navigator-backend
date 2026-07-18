/**
 * 🔧 Improvement Modifier
 *
 * Применяет approved proposals
 * к проекту.
 */

class ImprovementModifier {


    // =========================
    // MAIN ENTRY
    // =========================

    static apply(project, proposal) {

        if (!project || !proposal) {
            return project;
        }

        if (proposal.status !== "approved") {
            return project;
        }


        switch (proposal.type) {

            case "character_update":

                return this.updateCharacter(
                    project,
                    proposal
                );


            case "character_action_update":

                return this.updateCharacterAction(
                    project,
                    proposal
                );


            case "scene_update":

                return this.updateScene(
                    project,
                    proposal
                );


            case "scene_character_evidence":

                return this.updateCharacterEvidence(
                    project,
                    proposal
                );


            case "memory_update":

                return this.updateMemory(
                    project,
                    proposal
                );


            case "story_logic_update":

                return this.updateStoryLogic(
                    project,
                    proposal
                );


            default:

                return project;
        }

    }



    // =========================
    // APPLY ALL APPROVED
    // =========================

    static applyAll(project, proposals = []) {

        proposals.forEach(
            proposal => {

                project =
                    this.apply(
                        project,
                        proposal
                    );

            }
        );

        return project;

    }



    // =========================
    // CHARACTER
    // =========================

    static updateCharacter(
        project,
        proposal
    ) {

        if (
            !project.characters ||
            !Array.isArray(project.characters)
        ) {
            return project;
        }


        const character =
            project.characters.find(
                c => c.name === proposal.character
            );


        if (!character) {
            return project;
        }


        character.improvements =
            character.improvements || [];


        character.improvements.push({

            target:
                proposal.target,

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }


          // =========================
         // CHARACTER ACTION
         // =========================

    static updateCharacterAction(
        project,
        proposal
    ) {

        if (
            !project.characters ||
            !Array.isArray(project.characters)
        ) {
            return project;
        }


        const character =
            project.characters.find(
                c => c.name === proposal.character
            );


        if (!character) {
            return project;
        }


        character.actions =
            character.actions || [];


        character.actions.push({

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }



    // =========================
    // CHARACTER EVIDENCE
    // =========================

    static updateCharacterEvidence(
        project,
        proposal
    ) {

        if (
            !project.characterEvidence
        ) {

            project.characterEvidence = [];

        }


        project.characterEvidence.push({

            character:
                proposal.character,

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }



    // =========================
    // SCENE
    // =========================

    static updateScene(
        project,
        proposal
    ) {

        if (!project.scenes) {
            project.scenes = [];
        }


        project.scenes.push({

            scene:
                proposal.scene,

            target:
                proposal.target,

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }



    // =========================
    // MEMORY
    // =========================

    static updateMemory(
        project,
        proposal
    ) {

        if (!project.memoryUpdates) {
            project.memoryUpdates = [];
        }


        project.memoryUpdates.push({

            target:
                proposal.target,

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }



    // =========================
    // STORY LOGIC
    // =========================

    static updateStoryLogic(
        project,
        proposal
    ) {

        if (!project.storyLogicUpdates) {
            project.storyLogicUpdates = [];
        }


        project.storyLogicUpdates.push({

            target:
                proposal.target,

            change:
                proposal.change,

            appliedAt:
                new Date().toISOString()

        });


        return project;

    }



}


module.exports =
    ImprovementModifier;
