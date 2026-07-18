/**
 * 🎯 Priority Service
 *
 * Определяет уровень важности
 * редакторских улучшений.
 */


class PriorityService {



    static getLevel(score = 0) {


        if (score >= 90) {

            return "critical";

        }


        if (score >= 70) {

            return "high";

        }


        if (score >= 50) {

            return "medium";

        }


        return "normal";

    }





    static normalize(score) {


        return {

            score,

            level:
                this.getLevel(score)

        };

    }



}


module.exports =
    PriorityService;
