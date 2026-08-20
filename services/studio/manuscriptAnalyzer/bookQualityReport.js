class BookQualityReport {


    static generate({
        chapters = [],
        comparison = {}
    }) {


        const chapterScores =
            chapters.map(
                chapter => chapter.score || 0
            );


        const averageChapterScore =
            chapterScores.length
                ? Math.round(
                    chapterScores.reduce(
                        (a,b)=>a+b,
                        0
                    )
                    /
                    chapterScores.length
                )
                : 0;



        const structureScore =
            comparison.structureScore || 0;



        const bookScore =
            Math.round(
                (
                    averageChapterScore +
                    structureScore
                )
                /
                2
            );



        const problems = [];



        chapters.forEach(
            chapter => {

                if (
                    chapter.weaknesses &&
                    chapter.weaknesses.length
                ) {

                    problems.push(
                        ...chapter.weaknesses
                    );

                }

            }
        );



        if (
            comparison.problems &&
            comparison.problems.length
        ) {

            comparison.problems.forEach(
                problem => {

                    problems.push(
                        problem.message
                    );

                }
            );

        }



        const recommendations =
            problems.map(
                problem =>

                `Improve: ${problem}`

            );



        return {


            bookScore,


            chapters: {

                average:
                    averageChapterScore,

                analyzed:
                    chapters.length

            },


            structure: {

                score:
                    structureScore

            },


            mainProblems:
                problems,


            recommendations


        };


    }


}



module.exports =
BookQualityReport;
