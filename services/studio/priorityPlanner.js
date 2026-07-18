/**
 * 🧠 Priority Planner
 *
 * Определяет порядок исправлений истории.
 * Не все проблемы одинаково важны.
 */

class PriorityPlanner {


    static calculatePriority(task) {


        const critical =
        [
            "story_logic",
            "continuity",
            "memory",
            "plot"
        ];


        const high =
        [
            "character",
            "character_action",
            "character_actions",
            "character_evidence"
        ];


        const medium =
        [
            "scene",
            "dialogue",
            "conflict"
        ];


        const low =
        [
            "quality"
        ];



        if (
            critical.includes(task.type)
        ) {

            return {
                level:
                    "critical",

                score:
                    100
            };

        }



        if (
            high.includes(task.type)
        ) {

            return {
                level:
                    "high",

                score:
                    75
            };

        }



        if (
            medium.includes(task.type)
        ) {

            return {
                level:
                    "medium",

                score:
                    50
            };

        }



        if (
            low.includes(task.type)
        ) {

            return {
                level:
                    "low",

                score:
                    25
            };

        }



        return {

            level:
                "normal",

            score:
                40

        };


    }





    static sort(tasks) {


        if (
            !tasks ||
            tasks.length === 0
        ) {

            return [];

        }



        return tasks
        .map(task => {


            const priority =
                this.calculatePriority(task);


            return {

                ...task,

                priority:
                    priority.level,


                priorityScore:
                    priority.score

            };


        })
        .sort(
            (a,b) =>
                b.priorityScore -
                a.priorityScore
        );


    }


}


module.exports = PriorityPlanner;
