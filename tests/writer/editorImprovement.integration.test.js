const ImprovementService =
require("../../services/studio/improvementService");

const ImprovementExecutor =
require("../../services/studio/improvementExecutor");

const ImprovementModifier =
require("../../services/studio/improvementModifier");


let project = {

    characters: [
        {
            name:"Edward"
        }
    ],

    scenes: [],

    memory: {},

    storyLogic:{}

};


// =========================
// 1. CREATE TASKS
// =========================


const tasks = [

    {
        type:"character",
        character:"Edward",
        target:"fear",
        priority:70
    },


    {
        type:"character_action",
        character:"Edward",
        priority:80
    },


    {
        type:"scene",
        scene:"The First Meeting",
        target:"conflict",
        priority:60
    },


    {
        type:"memory",
        target:"timeline",
        priority:90
    },


    {
        type:"story_logic",
        target:"unresolved_thread",
        priority:100
    }

];



// =========================
// 2. CREATE PROPOSALS
// =========================


const proposals =
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



// =========================
// 3. APPROVE
// =========================


const approved =
    proposals.map(
        p => ({
            ...p,
            status:"approved"
        })
    );




// =========================
// 4. APPLY
// =========================


project =
ImprovementModifier.applyAll(
    project,
    approved
);



// =========================
// RESULT
// =========================


console.log("\nUPDATED PROJECT:");

console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);
