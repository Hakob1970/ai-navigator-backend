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
        "\nANALYSIS:",
        !!project.generation.analysis
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


    if (!project.generation.analysis) {

        throw new Error(
            "Missing analysis"
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
