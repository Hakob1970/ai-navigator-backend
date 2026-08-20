const ChapterComparisonEngine =
require("../../services/studio/manuscriptAnalyzer/chapterComparisonEngine");



const chapters = [

    {

        chapterId: 1,

        title: "The Order",

        hasAction: true,

        hasConflict: false

    },


    {

        chapterId: 2,

        title: "Secret Shuttle",

        hasAction: true,

        hasConflict: false

    },


    {

        chapterId: 3,

        title: "The Choice",

        hasAction: true,

        hasConflict: true

    }

];



const result =
    ChapterComparisonEngine.compare(
        chapters
    );



console.log(

    JSON.stringify(
        result,
        null,
        2
    )

);
