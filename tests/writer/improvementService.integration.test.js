const ImprovementService =
    require("../../services/studio/improvementService");



const project = {

    characters: [

        {
            name: "Edward",
            personality: [],
            background: "",
            motivation: "",
            conflict: ""
        }

    ],

    scenes: []

};



const report = {

    recommendations: [

        {
            type: "character",

            characters: [

                {
                    name: "Edward",

                    missing: [
                        "fear",
                        "character arc"
                    ]

                }

            ]

        },


        {
            type: "character_action",

            characters: [

                {
                    name: "Edward"
                }

            ]

        },


        {
            type: "story_logic",

            issues: [

                "unresolved_thread"

            ]

        }


    ],


    quality: {

        overall: 65

    }

};



const result =
    ImprovementService.improveProject(
        project,
        report
    );



console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);
