const ImprovementModifier =
require("../../services/studio/improvementModifier");

const project = {

    characters: [

        {
            name: "Edward"
        }

    ]

};

const proposals = [

    {
        type: "character_update",

        character: "Edward",

        target: "fear",

        change:
            "Edward needs a meaningful fear.",

        status: "approved"
    },


    {
        type: "character_update",

        character: "Edward",

        target: "background history",

        change:
            "Add Edward personal history.",

        status: "approved"
    }

];


const result =
    ImprovementModifier.applyAll(
        project,
        proposals
    );


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);
