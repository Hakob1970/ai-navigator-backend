const AnalysisService =
    require("./analysisService");

const ImprovementService =
    require("./improvementService");

const AuthorDecisionService =
    require("./authorDecisionService");

const EditorRevisionEngine =
    require("./editorRevisionEngine");

const RevisionQualityCheck =
    require("./revisionQualityCheck");

const ReAnalysisEngine =
    require("./reAnalysisEngine");

const RevisionFeedbackService =
    require("./revisionFeedbackService");


class WriterStudioEngine {


    // =========================
    // ANALYSIS
    // =========================

    static analyze(project) {

        return AnalysisService.generateReport(
            project
        );

    }


    // =========================
    // IMPROVEMENT PLAN
    // =========================

    static plan(
        project,
        report
    ) {

        return ImprovementService.improveProject(
            project,
            report
        );

    }


    // =========================
    // AUTHOR DECISION
    // =========================

    static createDecision({

        proposal,

        authorChoice,

        authorIdea

    }) {

        return AuthorDecisionService.createDecision({

            proposal,

            authorChoice,

            authorIdea

        });

    }


    // =========================
    // REVISION
    // =========================

    static revise(
        project,
        decision
    ) {

        if (
            !project ||
            !decision
        ) {

            return project;

        }


        if (
            decision.authorChoice !== "approve"
        ) {

            return project;

        }


        return EditorRevisionEngine.revise(
            project,
            decision
        );

    }


    // =========================
    // QUALITY CHECK
    // =========================

    static checkRevision(
        project,
        proposal
    ) {

        return RevisionQualityCheck.check(
            project,
            proposal
        );

    }


    // =========================
    // RE-ANALYSIS
    // =========================

    static compareScores(
        beforeScore,
        afterScore
    ) {

        return ReAnalysisEngine.compare(
            beforeScore,
            afterScore
        );

    }


    // =========================
    // FEEDBACK
    // =========================

    static createFeedback(
        proposal,
        qualityResult,
        reAnalysisResult,
        impactResult
    ) {

        return RevisionFeedbackService.generate(

            proposal,

            qualityResult,

            reAnalysisResult,

            impactResult

        );

    }

}


module.exports =
    WriterStudioEngine;
