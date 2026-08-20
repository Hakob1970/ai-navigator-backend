const AuthorDecisionService =
    require("../../services/studio/authorDecisionService");

console.log("\nSYSTEM CHOICE\n");

console.log(
    AuthorDecisionService.createDecision({
        proposalId: "proposal_1",
        choice: "system"
    })
);

console.log("\nCUSTOM CHOICE\n");

console.log(
    AuthorDecisionService.createDecision({
        proposalId: "proposal_2",
        choice: "custom",
        customRevision:
            "Hero loses trust in his team after betrayal."
    })
);

console.log("\nIDEA EVALUATION\n");

console.log(
    AuthorDecisionService.evaluateAuthorIdea(
        "Hero loses trust in his team after betrayal."
    )
);
