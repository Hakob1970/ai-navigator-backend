class ReAnalysisEngine {

    static compare(beforeScore, afterScore) {

        if (afterScore > beforeScore) {
            return {
                status: "improved",
                delta: afterScore - beforeScore
            };
        }

        if (afterScore === beforeScore) {
            return {
                status: "unchanged",
                delta: 0
            };
        }

        return {
            status: "worse",
            delta: afterScore - beforeScore
        };

    }

}

module.exports = ReAnalysisEngine;
