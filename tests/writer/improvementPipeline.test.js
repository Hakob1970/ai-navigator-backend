const ImprovementService =
require("../../services/studio/improvementService");


const ImprovementExecutor =
require("../../services/studio/improvementExecutor");



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



// 1. BUILD TASKS

const tasks =
ImprovementService.buildImprovementTasks(
    report
);


// 2. CREATE PROPOSALS

const proposals =
ImprovementExecutor.createProposals(
    {},
    tasks
);



console.log(
"\nTASKS:\n"
);

console.log(
JSON.stringify(
tasks,
null,
2
)
);



console.log(
"\nPROPOSALS:\n"
);


console.log(
JSON.stringify(
proposals,
null,
2
)
);
