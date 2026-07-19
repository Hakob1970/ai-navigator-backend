const tests = [
    "storyEngine.test.js",
    "editorLoop.test.js",
    "improvementService.integration.test.js",
    "improvementPipeline.test.js",
    "priorityService.test.js",
    "approvalService.v2.test.js",
    "improvementHistoryService.test.js",
    "improvementModifier.test.js",
    "improvementModifier.full.test.js",
    "fullImprovementLoop.test.js",
    "fullWriterImprovementCycle.test.js"
];

const { execSync } = require("child_process");

for (const test of tests) {

    console.log("\n==============================");
    console.log("RUNNING:", test);
    console.log("==============================\n");

    execSync(
        `node tests/writer/${test}`,
        {
            stdio: "inherit"
        }
    );
}

console.log("\nALL WRITER TESTS PASSED ✅\n");
