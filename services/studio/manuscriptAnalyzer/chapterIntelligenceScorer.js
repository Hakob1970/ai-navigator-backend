class ChapterIntelligenceScorer {


    static score(chapter) {


        let score = 0;

        const strengths = [];
        const weaknesses = [];



        // =========================
        // Basic elements
        // =========================


        if (chapter.hasAction) {

            score += 10;

            strengths.push(
                "Action exists"
            );

        }
        else {

            weaknesses.push(
                "No visible action"
            );

        }



        if (chapter.hasDialogue) {

            score += 10;

            strengths.push(
                "Dialogue exists"
            );

        }
        else {

            weaknesses.push(
                "Dialogue missing"
            );

        }



        if (chapter.hasConflict) {

            score += 15;

            strengths.push(
                "Conflict exists"
            );

        }
        else {

            weaknesses.push(
                "Conflict missing"
            );

        }



        // =========================
        // Narrative development
        // =========================


        const text =
            (chapter.text || "")
            .toLowerCase();



        // Character decisions

        if (
            /decided|choose|chose|refused|accepted|agreed|left|stayed/i
            .test(text)
        ) {

            score += 15;

            strengths.push(
                "Character decision detected"
            );

        }
        else {

            weaknesses.push(
                "Character decision unclear"
            );

        }



        // Consequences

        if (
            /because|therefore|result|caused|after|changed|consequence/i
            .test(text)
        ) {

            score += 15;

            strengths.push(
                "Cause and effect detected"
            );

        }
        else {

            weaknesses.push(
                "Weak consequences"
            );

        }



        // Emotional movement

        if (
            /fear|hope|anger|regret|love|loss|doubt|realized|understood/i
            .test(text)
        ) {

            score += 15;

            strengths.push(
                "Emotional movement detected"
            );

        }
        else {

            weaknesses.push(
                "Emotional development unclear"
            );

        }



        // Scene change

        if (
            /new|changed|discovered|revealed|found|lost/i
            .test(text)
        ) {

            score += 10;

            strengths.push(
                "Story state change detected"
            );

        }
        else {

            weaknesses.push(
                "Scene change unclear"
            );

        }



        if (score > 100) {

            score = 100;

        }



        return {

            intelligenceScore:
                score,

            intelligenceStrengths:
                strengths,

            intelligenceWeaknesses:
                weaknesses

        };


    }


}


module.exports =
    ChapterIntelligenceScorer;
