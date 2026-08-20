/**
 * 📝 Revision Feedback Service
 *
 * Формирует редакторский отчёт
 * после проверки улучшений.
 */


class RevisionFeedbackService {


    static generate(
        proposal,
        qualityResult,
        reAnalysisResult,
        impactResult
    ) {

      qualityResult =
    qualityResult || {};

reAnalysisResult =
    reAnalysisResult || {};

impactResult =
    impactResult || {};


        if (!proposal) {
            return null;
        }


        let status =
            "partial_success";


        if (
            impactResult &&
            impactResult.improvement > 0
        ) {

            status =
                "success";

        }


        if (
            impactResult &&
            impactResult.improvement < 0
        ) {

            status =
                "regression";

        }



        return {


            proposalId:
                proposal.id || null,


            target:
                proposal.target || null,


            originalProblem:
                proposal.change || null,


            quality:

            {

                scoreBefore:
                    qualityResult.scoreBefore || 0,


                scoreAfter:
                    qualityResult.scoreAfter || 0,


                improvement:
                    qualityResult.improvement || 0

            },



            reAnalysis:

            {

                status:
                    reAnalysisResult.status,


                delta:
                    reAnalysisResult.delta

            },



           impact:

{

    status:
        impactResult
        ? impactResult.status
        : "unknown",


    improvement:
        impactResult
        ? impactResult.improvement || 0
        : 0

},



            feedback:

            {

                status,


                message:
                    this.createMessage(status)

            },



            createdAt:
                new Date().toISOString()

        };

    }



    static createMessage(status) {


        if (status === "success") {

            return "Revision improved story quality. Continue refining remaining areas.";

        }


        if (status === "regression") {

            return "Revision reduced quality. Consider another approach.";

        }


        return "Revision improved the target area, but deeper development is recommended.";

    }


}



module.exports =
    RevisionFeedbackService;
