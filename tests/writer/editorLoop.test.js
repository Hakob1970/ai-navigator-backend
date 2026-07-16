const ProjectBuilder =
    require("../../services/studio/engine/projectBuilder");

const AnalysisService =
    require("../../services/studio/analysisService");

const ImprovementService =
    require("../../services/studio/improvementService");


let project =
    ProjectBuilder.create({
        title: "The Last Kingdom"
    });


project.scenes = [

    {
        id: "scene_1",

        title: "The First Meeting",

        goal: "",

        conflict: "",

        obstacle: "",

        characters: [
            "Edward"
        ],

        dialogue: "",

        outcome: ""

    }

];



// имитируем работу автора
project.characters[0].personality.traits.push(
    "brave",
    "loyal"
);

project.characters[0].motivation.goal =
    "Protect the kingdom";

project.characters[0].motivation.fear =
    "Losing his family";

project.characters[0].conflict.internal =
    "Duty versus personal happiness";

project.characters[1].personality.traits = [];

project.characters[1].background =
    "";

project.characters[1].motivation.goal =
    "";

project.characters[1].motivation.fear =
    "";

project.characters[1].conflict.internal =
    "";

project.characters[1].conflict.external =
    "";

project.characters[1].arc =
    "";


// анализ
const report =
    AnalysisService.generateReport(project);

console.log(
    "RECOMMENDATIONS:",
    JSON.stringify(
        report.recommendations,
        null,
        2
    )
);


// улучшения
const improvements =
    ImprovementService.improveProject(
        project,
        report
    );

console.log(
    JSON.stringify(
        report.analysis.characterActions,
        null,
        2
    )
);


console.log(
    JSON.stringify(
        improvements,
        null,
        2
    )
);

if (!report.recommendations) {
    throw new Error(
        "Analysis failed: no recommendations"
    );
}


if (!improvements.characters) {
    throw new Error(
        "Improvement failed: no character improvements"
    );
}


console.log(
    "\n✅ Editor Loop Test Passed"
);


