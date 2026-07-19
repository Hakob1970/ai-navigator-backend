const ImprovementHistoryService =
require("../../services/studio/improvementHistoryService");

const project = {};

const proposal = {

    id:
        "proposal_1",

    type:
        "story_logic_update",

    target:
        "conflict_structure"

};

const record =
    ImprovementHistoryService
        .createRecord(
            proposal,
            "approved"
        );

ImprovementHistoryService.add(
    project,
    record
);

console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);
