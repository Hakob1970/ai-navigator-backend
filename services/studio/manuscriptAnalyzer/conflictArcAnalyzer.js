class ConflictArcAnalyzer {


    static analyze(chapters) {


        let introduction = 0;
        let escalation = 0;
        let crisis = 0;
        let resolution = 0;


        const observations = [];
        const problems = [];



        if (!chapters || chapters.length === 0) {

            return {

                score:0,

                observations:[
                    "No chapters found."
                ],

                problems:[]
            };

        }



        // ищем появление конфликта

        for (let i = 0; i < chapters.length; i++) {


            const chapter =
                chapters[i];


            if (chapter.hasConflict) {


                if (introduction === 0) {

                    introduction =
                        100;

                    observations.push(
                        `Conflict introduced in chapter ${chapter.chapterId}.`
                    );

                }

                else {

                    escalation += 25;

                    observations.push(
                        `Conflict continues in chapter ${chapter.chapterId}.`
                    );

                }


            }


        }



        // проверяем исчезновение конфликта


        for (let i = 0; i < chapters.length - 1; i++) {


            const current =
                chapters[i];


            const next =
                chapters[i+1];



            if (
                current.hasConflict &&
                !next.hasConflict
            ) {


                problems.push({

                    type:
                    "conflict_arc_break",


                    chapters:[
                        current.chapterId,
                        next.chapterId
                    ],


                    message:
                    "Conflict disappears before reaching a climax.",


                    impact:
                    "Story tension may decrease because the conflict has no continuation."

                });


            }


        }



        // оценка завершения


        const last =
            chapters[chapters.length - 1];


        if (last.hasConflict) {

            crisis = 100;

        }
        else {

            problems.push({

                type:
                "missing_crisis",


                message:
                "The story has no visible final conflict stage.",


                impact:
                "The narrative arc may feel unfinished."

            });

        }



        let score =
            introduction +
            escalation +
            crisis;



        score =
            Math.min(score / 3, 100);



        return {


            conflictArcScore:
                Math.round(score),


            stages:{

                introduction,

                escalation,

                crisis,

                resolution

            },


            observations,


            problems


        };


    }


}



module.exports =
ConflictArcAnalyzer;
