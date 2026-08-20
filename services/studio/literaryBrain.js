const AnalysisService =
    require("./analysisService");


const PriorityPlanner =
    require("./priorityPlanner");

const ImprovementPlanner =
    require("./improvementPlanner");

const ImprovementExecutor =
    require("./improvementExecutor");

const ImprovementApproval =
    require("./improvementApproval");

const ImprovementHistoryService =
    require("./improvementHistoryService");

const ImprovementApplier =
    require("./improvementApplier");

const EditorRevisionEngine =
    require("./editorRevisionEngine");

const RevisionQualityCheck =
    require("./revisionQualityCheck");

const ImprovementImpactAnalyzer =
    require("./improvementImpactAnalyzer");

const ReAnalysisEngine =
    require("./reAnalysisEngine");

const RevisionFeedbackService =
    require("./revisionFeedbackService");

const AuthorDecisionService =
    require("./authorDecisionService");




class LiteraryBrain {


  constructor() {

    this.name =
      "Literary Brain";

    this.version =
      "1.2";

  }




  async run(project) {


    const result = {


      project,

      stages: []


    };



    // =====================
    // START
    // =====================


    result.stages.push({

      stage:
        "start",

      status:
        "started"

    });





    // =====================
    // ANALYSIS
    // =====================


    const analysis =
      AnalysisService.generateReport(project);



    result.stages.push({

      stage:
        "analysis",


      status:
        "completed",


      data:
        analysis


    });






    // =====================
    // PRIORITY
    // =====================


    const priorities =
      PriorityPlanner.sort(
        analysis.recommendations
      );




    result.stages.push({

      stage:
        "priority",


      status:
        "completed",


      data:
        priorities


    });



         // =====================
         // IMPROVEMENT PLANNING
         // =====================


const improvementInput = {


    storyLogic:
    {
        actions:
            (analysis.analysis.storyLogic?.issues || [])
            .map(
                issue => ({

                    type:
                        issue.type,

                    missing:
                        issue.description

                })
            )
    },



    memoryAnalysis:
    {
        actions:
            (analysis.analysis.memoryAnalysis?.issues || [])
            .map(
                issue => ({

                    type:
                        issue.type,

                    missing:
                        issue.missing ||
                        issue.description

                })
            )
    },



    continuity:
    {
        actions:
            (analysis.analysis.continuity?.issues || [])
            .map(
                issue => ({

                    type:
                        issue.type,

                    missing:
                        issue.description

                })
            )
    }


};



const improvements =
    ImprovementPlanner.createTasks(
        project,
        improvementInput
    );




result.stages.push({

    stage:
        "improvement",


    status:
        "completed",


    data:
        improvements

});


         // =====================
         // EXECUTION PROPOSALS
         // =====================


const proposals =
    ImprovementExecutor.createProposals(
        project,
        improvements
    );


result.stages.push({

    stage:
        "execution",


    status:
        "completed",


    data:
        proposals

});



          // =====================
         // APPROVAL
        // =====================

const approvedProposals =
    ImprovementApproval.approveAll(
        proposals
    );

result.stages.push({

    stage:
        "approval",

    status:
        "completed",

    data:
        approvedProposals

});



         // =====================
         // HISTORY
        // =====================

approvedProposals.forEach(
    proposal => {

        const record =
            ImprovementHistoryService
                .createRecord(
                    proposal,
                    "approved"
                );

        ImprovementHistoryService
            .add(
                project,
                record
            );

    }
);

result.stages.push({

    stage:
        "history",

    status:
        "completed",

    data:
        ImprovementHistoryService
            .getHistory(project)

});


          // =====================
          // APPLICATION
          // =====================


const appliedProject =
    ImprovementApplier.apply(
        project,
        approvedProposals &&
        approvedProposals.length > 0
            ? approvedProposals[0]
            : null
    );


result.stages.push({

    stage:
        "application",

    status:
        "completed",

    data:
        appliedProject

});


        // =====================
       // REVISION
      // =====================


const revisions = [];


approvedProposals.forEach(
    proposal => {


        const before =
            JSON.stringify(project);



        EditorRevisionEngine.revise(
            project,
            proposal
        );


        revisions.push({

            proposalId:
                proposal.id,


            status:
                "revised"

        });


    }
);



result.stages.push({

    stage:
        "revision",


    status:
        "completed",


    data:
        revisions

});


           const qualityResults =
    RevisionQualityCheck.checkAll(
        project,
        approvedProposals
    );

result.stages.push({

    stage:
        "quality_check",

    status:
        "completed",

    data:
        qualityResults

});



          const reAnalysisResult =
    ReAnalysisEngine.compare(
        qualityResults.scoreBefore || 0,
        qualityResults.scoreAfter || 0
    );


result.stages.push({

    stage: "re_analysis",

    status: "completed",

    data:
        reAnalysisResult

});


          // ===============================
         // STAGE 11 — IMPACT ANALYSIS
        // ===============================

const impactResults =
    ImprovementImpactAnalyzer.compare(

        {
            quality: {
                overall:
                    qualityResults.scoreBefore || 0
            }
        },

        {
            quality: {
                overall:
                    qualityResults.scoreAfter || 0
            }
        }

    );


result.stages.push({

    stage:
        "impact_analysis",

    status:
        "completed",

    data:
        [
            impactResults
        ]

});



         // ===============================
         // STAGE 12 — REVISION FEEDBACK
         // ===============================


const feedbackResults =
    approvedProposals.map(
        (proposal, index)=>{


            return RevisionFeedbackService.generate(

                proposal,

                qualityResults[index],

                reAnalysisResult,

                impactResults[index]

            );


        }
    );



result.stages.push({

    stage:
        "feedback",

    status:
        "completed",

    data:
        feedbackResults

});


       // ===============================
      // STAGE 13 — AUTHOR DECISION
      // ===============================

const authorDecisions =
    approvedProposals.map(

        proposal => {

            const decision =
                AuthorDecisionService.createDecision({

                    proposal,

                    authorChoice:
                        "approve"

                });

            return {

                decision,

                evaluation:
                    null

            };

        }

    );



result.stages.push({

    stage:
        "author_decision",

    status:
        "completed",

    data:
        authorDecisions

});


    return result;


  }


}



module.exports = LiteraryBrain;
