const ChapterAnalyzer =
require("../../services/studio/manuscriptAnalyzer/chapterAnalyzer");

const chapter = {

    id: 1,

    title: "The Order",

    wordCount: 1200,

    text:
        'Edward prepared the shuttle. "We leave tonight," he said.'

};

const result =
    ChapterAnalyzer.analyze(chapter);

console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);
