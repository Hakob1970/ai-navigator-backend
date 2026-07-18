/**
 * 🧠 Task Priority Engine
 *
 * Определяет порядок исправлений истории.
 * Сначала исправляем фундамент,
 * потом детали.
 */

class TaskPriorityEngine {


    static prioritize(tasks) {


        if (
            !tasks ||
            tasks.length === 0
        ) {

            return [];

        }



        const priorityMap = {


            // 🔴 FUNDAMENTAL STORY PROBLEMS

            story_logic:
                100,


            continuity:
                95,


            memory:
                90,


            plot:
                85,



            // 🟠 CHARACTER FOUNDATION

            character_action:
                80,


            character_evidence:
                75,


            character:
                70,



            // 🟡 SCENE DEVELOPMENT

            scene:
                60,



            // 🟢 POLISH

            dialogue:
                50,


            conflict:
                50,


            quality:
                25


        };





        return tasks

            .map(task => {


                return {


                    ...task,


                    priority:
                        priorityMap[task.type]
                        ||
                        40


                };


            })


            .sort(
                (a, b) =>
                    b.priority -
                    a.priority
            );


    }


}


module.exports = TaskPriorityEngine;
