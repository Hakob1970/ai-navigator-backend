/**
 * 🧠 Story Logic Analyzer
 *
 * Проверяет внутреннюю логику истории:
 * причины, последствия,
 * мотивации персонажей,
 * развитие конфликтов,
 * подготовку финала.
 */

class StoryLogicAnalyzer {

    static analyze(project) {

        const result = {

            issues: [],

            observations: []

        };


        // =========================
        // 🛡️ PROJECT VALIDATION
        // =========================

        if (!project) {

            result.issues.push({

                type:
                    "project_missing",

                description:
                    "Story project is missing."

            });

            result.observations.push(
                "Story logic could not be analyzed."
            );

            return result;

        }


        // =========================
        // 🎭 CHARACTER MOTIVATION
        // =========================

        if (
            Array.isArray(project.characters) &&
            project.characters.length > 0
        ) {

            project.characters.forEach(character => {

                if (
                    !character.motivation ||
                    !character.motivation.goal
                ) {

                    result.issues.push({

                        type:
                            "character_motivation",

                        character:
                            character.name,

                        description:
                            "Character has no clear motivation or goal."

                    });

                }

            });

        }


        // =========================
        // ⚔️ ACTION → CONSEQUENCE
        // =========================

        if (
            Array.isArray(project.scenes) &&
            project.scenes.length > 0
        ) {

            project.scenes.forEach(scene => {

                if (
                    scene.decision &&
                    !scene.outcome
                ) {

                    result.issues.push({

                        type:
                            "missing_consequence",

                        scene:
                            scene.title,

                        description:
                            "Character decision has no visible consequence."

                    });

                }

            });

        }


        // =========================
        // 🔥 CONFLICT DEVELOPMENT
        // =========================

        const conflicts =
            project.storyArchitecture?.conflicts || {};

        const internalConflicts =
            Array.isArray(conflicts.internal)
                ? conflicts.internal
                : [];

        const externalConflicts =
            Array.isArray(conflicts.external)
                ? conflicts.external
                : [];


        if (
            internalConflicts.length === 0 &&
            externalConflicts.length === 0
        ) {

            result.issues.push({

                type:
                    "conflict_structure",

                description:
                    "Story conflict development is not defined."

            });

        }


        // =========================
        // 🧵 OPEN THREADS
        // =========================

        if (
            project.memory &&
            Array.isArray(project.memory.plotThreads)
        ) {

            project.memory.plotThreads.forEach(thread => {

                const events =
                    Array.isArray(thread.events)
                        ? thread.events
                        : [];


                if (
                    thread.status === "active" &&
                    events.length === 0
                ) {

                    result.issues.push({

                        type:
                            "unresolved_thread",

                        thread:
                            thread.title,

                        description:
                            "Story thread exists without development."

                    });

                }

            });

        }


        // =========================
        // 🏁 ENDING PREPARATION
        // =========================

        if (
            project.ending &&
            !project.ending.summary
        ) {

            result.issues.push({

                type:
                    "ending_logic",

                description:
                    "Ending has no clear resolution."

            });

        }


        // =========================
        // 📊 OBSERVATION
        // =========================

        if (
            result.issues.length > 0
        ) {

            result.observations.push(
                "Story logic requires improvement."
            );

        }
        else {

            result.observations.push(
                "Story logic is consistent."
            );

        }


        return result;

    }

}


module.exports = StoryLogicAnalyzer;
