/**
 * 🧠 Memory Analyzer
 * Проверяет память книги:
 * сюжетные линии, секреты, последствия,
 * отношения персонажей и важные события.
 */

class MemoryAnalyzer {

    static analyze(project) {

        const result = {

            issues: [],

            observations: []

        };


        if (!project.memory) {

            result.observations.push(
                "Memory system not found."
            );

            return result;

        }


        // =========================
        // 🧵 PLOT THREADS
        // =========================

        if (
            !project.memory.plotThreads ||
            project.memory.plotThreads.length === 0
        ) {

            result.issues.push({
                type: "plot_threads",
                missing: "plot threads"
            });

        }


        // =========================
        // 🔒 SECRETS
        // =========================

        if (
            !project.memory.revealedSecrets
        ) {

            result.issues.push({
                type: "secrets",
                missing: "secret tracking"
            });

        }


        // =========================
        // 🤝 RELATIONSHIPS
        // =========================

        if (
            !project.memory.relationships ||
            project.memory.relationships.length === 0
        ) {

            result.issues.push({
                type: "relationships",
                missing: "character relationships"
            });

        }


        // =========================
        // 📅 TIMELINE
        // =========================

        if (
            !project.memory.timeline ||
            project.memory.timeline.length === 0
        ) {

            result.issues.push({
                type: "timeline",
                missing: "story timeline"
            });

        }


        // =========================
        // 🎯 CONSEQUENCES
        // =========================

        if (
            !project.memory.importantEvents ||
            project.memory.importantEvents.length === 0
        ) {

            result.issues.push({
                type: "consequences",
                missing: "important event tracking"
            });

        }


        const score =
            Math.max(
                0,
                100 - (result.issues.length * 20)
            );


        result.score = score;


        if (
            score < 70
        ) {

            result.observations.push(
                "Memory system requires improvement."
            );

        }
        else {

            result.observations.push(
                "Memory system is healthy."
            );

        }


        return result;

    }

}

module.exports = MemoryAnalyzer;
