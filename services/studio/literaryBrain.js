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


    return result;


  }


}



module.exports = LiteraryBrain;
