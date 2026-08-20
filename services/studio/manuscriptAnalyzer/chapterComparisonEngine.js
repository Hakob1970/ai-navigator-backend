class ChapterComparisonEngine {


    static compare(chapters) {


        const observations = [];
        const problems = [];


        if (!chapters || chapters.length < 2) {

            return {

                structureScore: 0,

                observations: [
                    "Not enough chapters for comparison."
                ],

                problems: []

            };

        }



        let score = 100;



        for (let i = 0; i < chapters.length - 1; i++) {


            const current =
                chapters[i];


            const next =
                chapters[i + 1];



            /*
            =========================
            Conflict progression
            =========================
            */


            if (
                current.hasConflict &&
                !next.hasConflict
            ) {


                score -= 20;


                problems.push({

                    type:
                    "conflict_drop",

                    chapters:
                    [
                        current.chapterId,
                        next.chapterId
                    ],


                    message:
                    "Conflict disappears in the next chapter. Story tension may decrease."

                });


            }


            else if (
                !current.hasConflict &&
                !next.hasConflict
            ) {


                score -= 15;


                problems.push({

                    type:
                    "weak_progression",


                    chapters:
                    [
                        current.chapterId,
                        next.chapterId
                    ],


                    message:
                    "Conflict does not develop between chapters."

                });


            }


            else {


                observations.push(

                    `Chapter ${current.chapterId} to Chapter ${next.chapterId}: conflict progression detected.`

                );


            }





            /*
            =========================
            Action flow
            =========================
            */


            if (
                current.hasAction &&
                next.hasAction
            ) {


                observations.push(

                    `Chapter ${current.chapterId} and Chapter ${next.chapterId} maintain action flow.`

                );


            }



            /*
            =========================
            Character / scene continuity
            =========================
            */


            if (
                current.hasAction &&
                !next.hasAction
            ) {


                score -= 10;


                problems.push({

                    type:
                    "action_drop",


                    chapters:
                    [
                        current.chapterId,
                        next.chapterId
                    ],


                    message:
                    "Action disappears in the next chapter."

                });


            }


        }



        if (score < 0) {

            score = 0;

        }



        return {


            structureScore:
                score,


            observations,


            problems


        };


    }


}



module.exports =
ChapterComparisonEngine;
