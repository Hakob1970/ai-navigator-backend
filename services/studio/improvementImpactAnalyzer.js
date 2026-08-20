/**
 * 📈 Improvement Impact Analyzer
 *
 * Сравнивает состояние ДО и ПОСЛЕ правки.
 *
 * Показывает:
 * - что улучшилось
 * - что ухудшилось
 * - общий эффект
 */

class ImprovementImpactAnalyzer {

    static compare(
        beforeAnalysis,
        afterAnalysis
    ) {

        const before =
            beforeAnalysis?.quality?.overall || 0;

        const after =
            afterAnalysis?.quality?.overall || 0;

        const delta =
            after - before;

        let status = "unchanged";

        if (delta > 0) {
            status = "improved";
        }

        if (delta < 0) {
            status = "worse";
        }

        return {

            status,

            scoreBefore:
                before,

            scoreAfter:
                after,

            improvement:
                delta,

            checkedAt:
                new Date().toISOString()

        };

    }

}

module.exports =
    ImprovementImpactAnalyzer;
