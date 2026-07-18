const ApprovalService =
    require("../../services/studio/approvalService");

let project = {};


let proposal = {

    id:
        "proposal_test_1",

    type:
        "character_update",

    status:
        "waiting_approval"

};





console.log(
    "\nAPPROVE:"
);


console.log(
    ApprovalService.approve(
        {
            ...proposal
        },
        "Good improvement",
         project
    )
);





console.log(
    "\nREJECT:"
);


console.log(
    ApprovalService.reject(
        {
            ...proposal
        },
        "Does not fit character",
         project
    )
);





console.log(
    "\nMODIFY:"
);


console.log(
    ApprovalService.modify(
        {
            ...proposal
        },
        "Change fear into guilt",
         project
    )
);





console.log(
    "\nPOSTPONE:"
);


console.log(
    ApprovalService.postpone(
        {
            ...proposal
        },
        "Need more story context",
        project
    )
);





console.log(
    "\nCAN APPLY:"
);


console.log(
    ApprovalService.canApply(
        {
            status:"approved"
        }
    )
);


console.log(
    ApprovalService.canApply(
        {
            status:"rejected"
        }
    )
);

console.log(
    "\nHISTORY:"
);

console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);
