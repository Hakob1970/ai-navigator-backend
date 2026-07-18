/**
 * ✅ Approval Service v2
 *
 * Управляет жизненным циклом Change Proposal
 *
 * waiting_approval
 *        |
 *        +---- approved
 *        |
 *        +---- rejected
 *        |
 *        +---- modified
 *        |
 *        +---- postponed
 */


const ImprovementHistoryService =
    require("./improvementHistoryService");


class ApprovalService {


    static approve(
        proposal,
        note = null,
        project = null
    ) {

        if (!proposal) {
            return null;
        }


        proposal.status =
            "approved";


        proposal.approvedAt =
            new Date().toISOString();


        proposal.editorNote =
            note;

       if (project) {

    const record =
        ImprovementHistoryService.createRecord(
            proposal,
            "approved",
            note
        );


    ImprovementHistoryService.add(
        project,
        record
    );

}


        return proposal;

    }





    static reject(
        proposal,
        note = null,
        project = null
    ) {


        if (!proposal) {
            return null;
        }


        proposal.status =
            "rejected";


        proposal.rejectedAt =
            new Date().toISOString();


        proposal.editorNote =
            note;

       if (project) {

    const record =
        ImprovementHistoryService.createRecord(
            proposal,
            "rejected",
            note
        );


    ImprovementHistoryService.add(
        project,
        record
    );

}


        return proposal;

    }





    static modify(
        proposal,
        note,
        project = null
    ) {


        if (!proposal) {
            return null;
        }


        proposal.status =
            "modified";


        proposal.editorNote =
            note;


        proposal.modifiedAt =
            new Date().toISOString();

        if (project) {

    const record =
        ImprovementHistoryService.createRecord(
            proposal,
            "modified",
            note
        );


    ImprovementHistoryService.add(
        project,
        record
    );

}


        return proposal;

    }





    static postpone(
        proposal,
        note = null,
         project = null
    ) {


        if (!proposal) {
            return null;
        }


        proposal.status =
            "postponed";


        proposal.editorNote =
            note;


        proposal.postponedAt =
            new Date().toISOString();

        if (project) {

    const record =
        ImprovementHistoryService.createRecord(
            proposal,
            "postponed",
            note
        );


    ImprovementHistoryService.add(
        project,
        record
    );

}


        return proposal;

    }





    static canApply(
        proposal
    ) {


        if (!proposal) {
            return false;
        }


        return (
            proposal.status === "approved"
        );

    }



}


module.exports =
    ApprovalService;
