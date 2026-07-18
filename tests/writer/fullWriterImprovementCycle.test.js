const ImprovementService =
require("../../services/studio/improvementService");

const ImprovementExecutor =
require("../../services/studio/improvementExecutor");

const ImprovementModifier =
require("../../services/studio/improvementModifier");



let project = {

    characters: [

        {
            name: "Edward"
        }

    ],

    scenes: []

};



// ======================
// 1. MOCK EDITOR REPORT
// ======================

const report = {


recommendations: [

    {
        type: "character",
        character: "Edward",
        target: "fear",
        priority: 70
    },


    {
        type: "character_action",
        character: "Edward",
        priority: 80
    },


    {
        type: "scene",
        scene: "The First Meeting",
        target: "conflict",
        priority: 60
    },


    {
        type: "story_logic",
        target: "unresolved_thread",
        priority: 100
    }


]

};



// ======================
// 2. BUILD TASKS
// ======================

const tasks =
ImprovementService.buildImprovementTasks(
    report
);


console.log("\nTASKS:");
console.log(
    JSON.stringify(
        tasks,
        null,
        2
    )
);



// ======================
// 3. CREATE PROPOSALS
// ======================

let proposals =
ImprovementExecutor.createProposals(
    project,
    tasks
);


console.log("\nPROPOSALS:");
console.log(
    JSON.stringify(
        proposals,
        null,
        2
    )
);



// ======================
// 4. APPROVE ALL
// ======================

proposals =
proposals.map(
    proposal => ({

        ...proposal,

        status:
            "approved"

    })
);



// ======================
// 5. APPLY CHANGES
// ======================


project =
ImprovementModifier.applyAll(
    project,
    proposals
);



console.log("\nFINAL PROJECT:");
console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);
