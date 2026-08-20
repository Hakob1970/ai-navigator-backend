const ManuscriptParser =
    require("./manuscriptParser");


const ChapterAnalyzer =
    require("./chapterAnalyzer");


const ChapterQualityScorer =
    require("./chapterQualityScorer");


const ChapterIntelligenceScorer =
    require("./chapterIntelligenceScorer");


const ChapterComparisonEngine =
    require("./chapterComparisonEngine");


const BookQualityReport =
    require("./bookQualityReport");

const ConflictArcAnalyzer =
    require("./conflictArcAnalyzer");

const StoryTensionAnalyzer =
    require("./storyTensionAnalyzer");

const CharacterArcAnalyzer =
    require("./characterArcAnalyzer");

const CharacterDevelopmentAnalyzer =
    require("./characterDevelopmentAnalyzer");

const CharacterExtractionAnalyzer =
    require("./characterExtractionAnalyzer");

const CharacterJourneyAnalyzer =
    require("./characterJourneyAnalyzer");

const CharacterConsequenceAnalyzer =
    require("./characterConsequenceAnalyzer");

const CharacterTransformationAnalyzer =
    require("./characterTransformationAnalyzer");

const CharacterTransformationDepthAnalyzer =
    require("./characterTransformationDepthAnalyzer");

const InternalConflictAnalyzer =
    require("./internalConflictAnalyzer");

const MotivationArcAnalyzer =
    require("./motivationArcAnalyzer");

const CharacterPsychologyAnalyzer =
    require("./characterPsychologyAnalyzer");

const BeliefSystemAnalyzer =
    require("./beliefSystemAnalyzer");

const CharacterContradictionAnalyzer =
    require("./characterContradictionAnalyzer");

const IdentityTransformationAnalyzer =
    require("./identityTransformationAnalyzer");

const CharacterImportanceAnalyzer =
    require("./characterImportanceAnalyzer");

const CharacterArcCoherenceAnalyzer =
    require("./characterArcCoherenceAnalyzer");




class ManuscriptAnalyzer {



    static analyze(manuscript) {



        // =========================
        // 1. Parse manuscript
        // =========================

        const parsed =
            ManuscriptParser.parse(
                manuscript
            );



        // =========================
        // 2. Analyze chapters
        // =========================

        const chapterAnalyses =
            parsed.chapters.map(

                chapter => {


                    const analysis =
                        ChapterAnalyzer.analyze(
                            chapter
                        );



                    const score =
                        ChapterQualityScorer.score(
                            analysis
                        );



                    const intelligence =
                        ChapterIntelligenceScorer.score(
                            {
                                ...chapter,
                                ...analysis
                            }
                        );



                    return {


                        chapterId:
                            chapter.chapterId,


                        title:
                            chapter.title,


                        ...analysis,


                        ...score,


                        ...intelligence


                    };


                }

            );



        // =========================
        // 3. Compare chapters
        // =========================


        const comparison =
            ChapterComparisonEngine.compare(
                chapterAnalyses
            );

       const characterArc =
    CharacterArcAnalyzer.analyze(
        parsed.chapters || [],
        manuscript.characters || manuscript.project?.characters || []
    );

      const characterDevelopment =
    CharacterDevelopmentAnalyzer.analyze(
        manuscript.chapters || [],
        manuscript.characters || []
    );


       const conflictArc =
    ConflictArcAnalyzer.analyze(
        chapterAnalyses
    );


       const storyTension =
    StoryTensionAnalyzer.analyze(
        chapterAnalyses
    );

      const characterExtraction =
     CharacterExtractionAnalyzer.analyze(
    parsed.chapters || [],
    manuscript.characters ||
    manuscript.project?.characters || []
    );

     const characterJourney =
    CharacterJourneyAnalyzer.analyze(
        characterExtraction
    );

    const characterConsequences =
    CharacterConsequenceAnalyzer.analyze(
        characterExtraction
    );

    const characterTransformation =
CharacterTransformationAnalyzer.analyze(
    characterJourney,
    characterConsequences
);

const characterTransformationDepth =
    CharacterTransformationDepthAnalyzer.analyze(
        characterTransformation,
        characterExtraction,
        characterConsequences
    );

const internalConflict =
    InternalConflictAnalyzer.analyze(
        characterExtraction,
        characterTransformation,
        characterConsequences
    );

const motivationArc =
    MotivationArcAnalyzer.analyze(
        characterExtraction,
        characterJourney,
        characterTransformation,
        characterConsequences,
    );

const characterPsychology =
    CharacterPsychologyAnalyzer.analyze(
        characterExtraction,
        motivationArc,
        internalConflict,
        characterTransformationDepth
    );

const beliefSystem =
    BeliefSystemAnalyzer.analyze(
        characterPsychology
    );

const characterContradiction =
    CharacterContradictionAnalyzer.analyze(
        beliefSystem
    );

const identityTransformation =
    IdentityTransformationAnalyzer.analyze(
        characterTransformationDepth,
        beliefSystem,
        characterContradiction
    );

const characterImportance =
    CharacterImportanceAnalyzer.analyze(
        characterTransformationDepth
    );

const characterArcCoherence =
    CharacterArcCoherenceAnalyzer.analyze({

        characters:
            characterExtraction.characters,

        motivationArc,

        characterPsychology,

        beliefSystem,

        characterContradiction,

        identityTransformation,

        characterTransformationDepth,

        internalConflict

    });



        // =========================
        // 4. Generate book report
        // =========================


        const report =
            BookQualityReport.generate({

                chapters:
                    chapterAnalyses,


                comparison

            });



        return {


            manuscript: {


                title:
                    manuscript.metadata?.title ||
                    manuscript.title ||
                    "Unknown",


                totalChapters:
                    parsed.chapters.length


            },


            chapters:
                chapterAnalyses,


            comparison,

           conflictArc,

           storyTension,

           characterArc,

           characterDevelopment,

           characterExtraction,

           characterJourney,

           characterConsequences,

           characterTransformation,

           characterTransformationDepth,

           internalConflict,

           motivationArc,

          characterPsychology,

          beliefSystem,

          characterContradiction,

          identityTransformation,

          characterImportance,

          characterArcCoherence,


            report


        };


    }


}



module.exports =
    ManuscriptAnalyzer;
