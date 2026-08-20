class ChapterAnalyzer {

    static analyze(chapter) {

        const text =
            (chapter.text || "")
            .toLowerCase();

        return {

            chapterId:
                chapter.chapterId,

            title:
                chapter.title,

            wordCount:
                chapter.wordCount || 0,

            hasDialogue:
                text.includes('"'),

            hasConflict:
                /fight|conflict|argument|problem|danger|risk/i
                .test(text),

            hasAction:
                /looked|ran|walked|opened|closed|prepared|jumped/i
                .test(text),

            score: 0

        };

    }

}

module.exports =
    ChapterAnalyzer;
