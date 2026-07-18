const ImprovementHistoryService =
    require("../../services/studio/improvementHistoryService");



let project = {};



let proposal = {

    id:
        "proposal_001",

    type:
        "character_update",

    character:
        "Edward",

    target:
        "fear"

};





const record =
    ImprovementHistoryService.createRecord(
        proposal,
        "approved",
        "Good character improvement"
    );





console.log(
    "\nRECORD:"
);

console.log(
    JSON.stringify(
        record,
        null,
        2
    )
);





ImprovementHistoryService.add(
    project,
    record
);





console.log(
    "\nPROJECT HISTORY:"
);

console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);





console.log(
    "\nGET HISTORY:"
);

console.log(
    ImprovementHistoryService.getHistory(
        project
    )
);
