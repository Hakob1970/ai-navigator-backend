const ChapterQualityScorer =
require("../../services/studio/manuscriptAnalyzer/chapterQualityScorer");


const analysis = {

    chapterId: 1,

    title: "The Order",

    wordCount: 1200,

    hasDialogue: true,

    hasConflict: false,

    hasAction: true

};


const result =
    ChapterQualityScorer.score(
        analysis
    );


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);
