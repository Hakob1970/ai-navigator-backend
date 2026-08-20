class ChapterQualityScorer {

    static score(analysis){

        let score = 0;

        const strengths = [];
        const weaknesses = [];


        if(analysis.hasAction){

            score += 15;
            strengths.push(
                "Action exists"
            );

        }
        else {

            weaknesses.push(
                "Chapter lacks action"
            );

        }


        if(analysis.hasDialogue){

            score += 15;
            strengths.push(
                "Dialogue exists"
            );

        }
        else {

            weaknesses.push(
                "Dialogue missing"
            );

        }


        if(analysis.hasConflict){

            score += 20;

        }
        else {

            weaknesses.push(
                "Conflict missing"
            );

        }


        return {

            score,

            strengths,

            weaknesses

        };

    }

}


module.exports =
ChapterQualityScorer;
