const ManuscriptParser =
require("../../services/studio/manuscriptAnalyzer/manuscriptParser");

const project = {

    chapters: [

        {
            id: 1,
            title: "Chapter One",
            text: "Edward looked at Earth."
        },

        {
            id: 2,
            title: "Chapter Two",
            text: "Marcus prepared the shuttle."
        }

    ]

};

const result =
    ManuscriptParser.parse(project);

console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);

