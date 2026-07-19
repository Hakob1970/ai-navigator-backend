const ImprovementApproval =
require("../../services/studio/improvementApproval");

const proposal = {

    id: "proposal_1",

    type: "story_logic_update",

    status: "waiting_approval"

};

console.log(
    ImprovementApproval.approve(
        proposal
    )
);

console.log(
    ImprovementApproval.reject(
        proposal
    )
);
