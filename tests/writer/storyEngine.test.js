const StoryEngine =
    require("../../services/studio/engine/storyEngine");


async function run() {


    const project =
        await StoryEngine.start({

            title: "Star Colony",

            genre: "scifi",

            idea:
            "A human colony on Mars discovers a mysterious signal from deep space.",

            test: true

        });



    console.log(
        "\nPROJECT:",
        project.metadata.title
    );


    console.log(
        "\nSTATUS:",
        project.generation.status
    );


    console.log(
        "\nCHAPTERS:",
        project.chapters.length
    );


   console.log(
    "\nPRE-ANALYSIS:",
    !!project.generation.preAnalysis
    );

   console.log(
    "\nPOST-ANALYSIS:",
    !!project.generation.postAnalysis
    );


    console.log(
        "\nIMPROVEMENTS:",
        !!project.generation.improvements
    );


    console.log(
        "\nPROMPT:",
        !!project.generation.lastPrompt
    );


    console.log(
        "\nMEMORY:",
        !!project.memory
    );



    // =========================
    // VALIDATION
    // =========================


     if (!project.generation.preAnalysis) {

        throw new Error(
             "Missing pre-analysis"
        );

    }

     if (!project.generation.postAnalysis) {

        throw new Error(
             "Missing post-analysis"
        );

     }

    const preIssues =
    project.generation.preAnalysis
        .aggregatedIssues?.issues || [];

const postIssues =
    project.generation.postAnalysis
        .aggregatedIssues?.issues || [];

console.log(
    "\nPRE-ANALYSIS ISSUES:",
    preIssues.length
);

console.log(
    "POST-ANALYSIS ISSUES:",
    postIssues.length
);

if (postIssues.length >= preIssues.length) {

    throw new Error(
        "Post-analysis did not reduce detected issues"
    );

}


     if (
        !project.memory.timeline ||
        project.memory.timeline.length === 0
        ) {

        throw new Error(
             "Post-analysis did not run after timeline update"
        );

     }



    if (!project.generation.improvements) {

        throw new Error(
            "Missing improvements"
        );

    }



    if (!project.chapters ||
        project.chapters.length === 0) {

        throw new Error(
            "Chapter was not generated"
        );

    }


if (
    !project.chapters[0].content ||
    project.chapters[0].content.length < 10
) {

    throw new Error(
        "Generated chapter content is empty"
    );

}


    if (!project.memory) {

        throw new Error(
            "Memory not initialized"
        );

    }



    console.log(
        "\n✅ StoryEngine Full Loop Test Passed"
    );


}



run()
.catch(error => {

    console.error(
        "\n❌ TEST FAILED"
    );

    console.error(error);

    process.exit(1);

});
