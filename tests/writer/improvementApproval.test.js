const ImprovementApproval =
require("../../services/studio/improvementApproval");

const proposals = [
    {
        type: "character_update",
        character: "Edward",
        status: "waiting_approval"
    }
];

console.log(
    ImprovementApproval.approveAll(
        proposals
    )
);
