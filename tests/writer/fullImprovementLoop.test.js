const ImprovementService =
require("../../services/studio/improvementService");


const ImprovementExecutor =
require("../../services/studio/improvementExecutor");


const ImprovementModifier =
require("../../services/studio/improvementModifier");



let project = {

characters:[

{
name:"Edward"
}

]

};



const report = {


recommendations:[

{
type:"character",

characters:[

{
name:"Edward",
missing:[
"fear"
]
}

]

}

]


};



// 1. ANALYSIS → TASKS

const tasks =
ImprovementService.buildImprovementTasks(
    report
);



// 2. TASKS → PROPOSALS

let proposals =
ImprovementExecutor.createProposals(
    project,
    tasks
);



// 3. APPROVAL

proposals =
proposals.map(
proposal => ({

    ...proposal,

    status:"approved"

})
);



// 4. APPLY CHANGES

project =
ImprovementModifier.applyAll(
    project,
    proposals
);



console.log(
JSON.stringify(
project,
null,
2
)
);
