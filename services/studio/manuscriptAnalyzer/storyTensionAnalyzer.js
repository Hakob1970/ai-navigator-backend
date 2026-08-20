class StoryTensionAnalyzer {


    static analyze(chapters) {


        const results = [];
        const problems = [];


        if (!chapters || chapters.length === 0) {

            return {

                tensionScore:0,

                chapters:[],

                problems:[
                    "No chapters found."
                ]

            };

        }



        let total = 0;



        chapters.forEach(chapter => {


            let tension = 0;

            const reasons = [];



            // конфликт

            if (chapter.hasConflict) {

                tension += 40;

                reasons.push(
                    "Conflict detected"
                );

            }



            // действие

            if (chapter.hasAction) {

                tension += 20;

                reasons.push(
                    "Action movement detected"
                );

            }



            // диалог

            if (chapter.hasDialogue) {

                tension += 10;

                reasons.push(
                    "Character interaction detected"
                );

            }



            // решения персонажей

            if (
                chapter.intelligenceStrengths &&
                chapter.intelligenceStrengths.includes(
                    "Character decision detected"
                )
            ) {

                tension += 20;

                reasons.push(
                    "Important decision detected"
                );

            }



            // ограничение

            if (tension > 100) {

                tension = 100;

            }



            total += tension;



            results.push({

                chapterId:
                    chapter.chapterId,


                title:
                    chapter.title,


                tension,


                reasons

            });



        });




        // Проверяем резкие падения


        for (
            let i = 0;
            i < results.length - 1;
            i++
        ) {


            const current =
                results[i];


            const next =
                results[i + 1];



            if (
                current.tension -
                next.tension
                >= 40
            ) {


                problems.push({

                    type:
                    "tension_collapse",


                    chapters:
                    [
                        current.chapterId,
                        next.chapterId
                    ],


                    message:
                    "Narrative tension drops sharply after this chapter.",


                    impact:
                    "Reader engagement may decrease because previous tension has no continuation."

                });


            }


        }




        return {


            tensionScore:
                Math.round(
                    total / chapters.length
                ),


            chapters:
                results,


            problems


        };


    }


}



module.exports =
StoryTensionAnalyzer;
