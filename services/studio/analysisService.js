/**
 * 🧠 AnalysisService
 * Анализ качества истории Writer Studio
 */

const CharacterEvidenceAnalyzer =
    require("./analysis/characterEvidenceAnalyzer");

const CharacterActionAnalyzer =
    require("./analysis/characterActionAnalyzer");

const SceneAnalyzer =
    require("./analysis/sceneAnalyzer");

const DialogueAnalyzer =
    require("./analysis/dialogueAnalyzer");

const ConflictAnalyzer =
    require("./analysis/conflictAnalyzer");

const MemoryAnalyzer =
    require("./analysis/memoryAnalyzer");

const ContinuityAnalyzer =
    require("./analysis/continuityAnalyzer");

const StoryLogicAnalyzer =
    require("./analysis/storyLogicAnalyzer");



class AnalysisService {

       /**
     * Анализ персонажей
     */
    static analyzeCharacters(project) {


        const result = {


            total:
                0,

            missingMotivation:
                [],

            observations:
                []

        };


        if (!project.characters) {

            return result;

        }


        result.total =
            project.characters.length;



        project.characters.forEach(character => {


            if (
                !character.motivation ||
                !character.motivation.goal
            ) {

                result.missingMotivation.push(
                    character.name
                );

            }


        });



        if (result.total > 0) {

            result.observations.push(
                "Characters exist, but motivations need development."
            );

        }



        return result;

    }





             /**
     * Анализ сюжета
     */
    static analyzePlot(project) {


        const result = {


            plotThreads:
                0,

            activeThreads:
                0,

            importantEvents:
                0,

            openQuestions:
                0,

            secrets:
                0,

            observations:
                []

        };


        if (!project.memory) {

            return result;

        }



        if (
            project.memory.plotThreads &&
            Array.isArray(project.memory.plotThreads)
        ) {

            result.plotThreads =
                project.memory.plotThreads.length;


            result.activeThreads =
                project.memory.plotThreads.filter(
                    thread =>
                        thread.status === "active"
                ).length;

        }



        if (
            project.memory.importantEvents &&
            Array.isArray(project.memory.importantEvents)
        ) {

            result.importantEvents =
                project.memory.importantEvents.length;

        }



        if (
            project.memory.unresolvedThreads &&
            Array.isArray(project.memory.unresolvedThreads)
        ) {

            result.openQuestions =
                project.memory.unresolvedThreads.length;

        }



        if (
            project.memory.revealedSecrets &&
            Array.isArray(project.memory.revealedSecrets)
        ) {

            result.secrets =
                project.memory.revealedSecrets.length;

        }



        if (result.plotThreads > 0) {

            result.observations.push(
                "Story contains active plot threads."
            );

        }
        else {

            result.observations.push(
                "Story lacks defined plot threads."
            );

        }



        if (result.openQuestions > 0) {

            result.observations.push(
                "Unresolved questions can drive future chapters."
            );

        }



        return result;

    }


           /**
     * Анализ памяти проекта
     */
    static analyzeMemory(project) {


        const result = {


            timelineEvents:
                0,

            characterMemory:
                0,

            relationships:
                0,

            activeConflicts:
                0,

            unresolvedThreads:
                0,

            hiddenSecrets:
                0,

            observations:
                []

        };



        if (!project.memory) {

            return result;

        }



        if (
            Array.isArray(project.memory.timeline)
        ) {

            result.timelineEvents =
                project.memory.timeline.length;

        }



        if (
            Array.isArray(project.memory.characterMemory)
        ) {

            result.characterMemory =
                project.memory.characterMemory.length;

        }



        if (
            Array.isArray(project.memory.relationships)
        ) {

            result.relationships =
                project.memory.relationships.length;

        }



        if (
            Array.isArray(project.memory.conflicts)
        ) {

            result.activeConflicts =
                project.memory.conflicts.length;

        }



        if (
            Array.isArray(project.memory.unresolvedThreads)
        ) {

            result.unresolvedThreads =
                project.memory.unresolvedThreads.length;

        }



        if (
            Array.isArray(project.memory.revealedSecrets)
        ) {

            result.hiddenSecrets =
                project.memory.revealedSecrets.length;

        }



        if (result.unresolvedThreads > 0) {

            result.observations.push(
                "Story contains unresolved elements that require future attention."
            );

        }



        if (result.hiddenSecrets > 0) {

            result.observations.push(
                "Hidden secrets are stored in memory."
            );

        }



        if (result.relationships > 0) {

            result.observations.push(
                "Character relationships are being tracked."
            );

        }



        return result;

    }


         /**
     * Оценка качества книги
     */
    static analyzeQuality(project) {


        const quality = {


            characters: 0,

            plot: 0,

            memory: 0,

            overall: 0,

            observations: []

        };



        const characters =
            this.analyzeCharacters(project);



        const plot =
            this.analyzePlot(project);



        const memory =
            this.analyzeMemory(project);



        // =========================
        // 👤 CHARACTERS SCORE
        // =========================

const characterDepth =
    this.analyzeCharacterDepth(project);


if (
    characterDepth.characters &&
    characterDepth.characters.length > 0
) {


    let total = 0;


    characterDepth.characters.forEach(
        character => {

            total += character.completeness;

        }
    );


    quality.characters =
        Math.round(
            total / characterDepth.characters.length
        );



    if (
        quality.characters < 50
    ) {

        quality.observations.push(
            "Characters require deeper development."
        );

    }


}



        // =========================
        // 📖 PLOT SCORE
        // =========================

        if (plot.plotThreads > 0) {

            quality.plot = 50;


            if (
                plot.activeThreads > 0
            ) {

                quality.plot += 30;

            }


            if (
                plot.openQuestions > 0
            ) {

                quality.plot += 20;

            }

        }
        else {

            quality.observations.push(
                "Story needs stronger plot structure."
            );

        }



        // =========================
        // 🧠 MEMORY SCORE
        // =========================

        if (
            memory.characterMemory > 0
        ) {

            quality.memory += 40;

        }


        if (
            memory.relationships > 0
        ) {

            quality.memory += 30;

        }


        if (
            memory.hiddenSecrets > 0 ||
            memory.unresolvedThreads > 0
        ) {

            quality.memory += 30;

        }



        quality.overall =
    Math.round(
        (
            quality.characters * 0.4 +
            quality.plot * 0.4 +
            quality.memory * 0.2
        )
    );



        return quality;

    }


           /**
     * Решение Quality Control
     */
    static generateQualityDecision(quality) {


        const decision = {


            status:
                "",

            score:
                quality.overall,

            message:
                ""

        };



        if (quality.overall < 50) {


            decision.status =
                "critical";


            decision.message =
                "Story requires major improvements before continuing.";

        }


        else if (quality.overall < 80) {


            decision.status =
                "needs_improvement";


            decision.message =
                "Story structure exists, but important areas need development.";

        }


        else if (quality.overall < 95) {


            decision.status =
                "good";


            decision.message =
                "Story is strong, but some elements can be improved.";

        }


        else {


            decision.status =
                "excellent";


            decision.message =
                "Story quality is high and ready for the next stage.";

        }



        return decision;

    }



         /**
     * Полный отчёт анализа книги
     */
    static generateReport(project) {

      const quality =
          this.analyzeQuality(project);


        const report = {


            createdAt:
                new Date().toISOString(),


            project: {

                title:
                    project.metadata?.title || "",

                genre:
                    project.settings?.genre || ""

            },


            analysis: {


    characters:
        this.analyzeCharacters(project),


    characterDepth:
        this.analyzeCharacterDepth(project),

    characterEvidence:
        CharacterEvidenceAnalyzer.analyze(project),

   characterActions:
       CharacterActionAnalyzer.analyze(project),

   sceneAnalysis:
       SceneAnalyzer.analyze(project),

   dialogueAnalysis:
      DialogueAnalyzer.analyze(project),

   conflicts:
      ConflictAnalyzer.analyze(project),

   memoryAnalysis:
        MemoryAnalyzer.analyze(project),

   storyLogic:

    StoryLogicAnalyzer.analyze(project),


    plot:
        this.analyzePlot(project),


    memory:
        this.analyzeMemory(project),

    continuity:
        ContinuityAnalyzer.analyze(project),


    quality:
        quality

},


        qualityDecision:
            this.generateQualityDecision(
          quality
    ),

            recommendations: []

        };



        // =========================
        // РЕКОМЕНДАЦИИ
        // =========================


        const characters =
            report.analysis.characters;


        const characterDepth =
            report.analysis.characterDepth;


        if (
            characters.missingMotivation &&
            characters.missingMotivation.length > 0
        ) {

            report.recommendations.push({

    type:
        "character",

    message:
        "Character structure requires improvement.",

    characters:
        characterDepth.characters
            .filter(
                c => c.completeness < 70
            )
            .map(
                c => ({

                    name:
                        c.name,

                    score:
                        c.completeness,

                    missing:
                        c.missing

                })
            )

});

        }


// =========================
// 🎭 CHARACTER EVIDENCE
// =========================

const characterEvidence =
    report.analysis.characterEvidence;


if (
    characterEvidence &&
    characterEvidence.characters
) {

    const invisibleCharacters =
        characterEvidence.characters.filter(
            character =>
                character.presenceScore === 0
        );


    if (
        invisibleCharacters.length > 0
    ) {

        report.recommendations.push({

            type:
                "character_evidence",

            message:
                "Characters exist in structure but are not demonstrated through story scenes.",

            characters:
                invisibleCharacters.map(
                    character => ({

                        name:
                            character.name,

                        sceneCount:
                            character.sceneCount,

                        evidenceScore:
                            character.evidenceScore

                    })
                )

        });

    }

}



if (
    characterDepth &&
    characterDepth.characters
) {

    const weak =
        characterDepth.characters.filter(
            c => c.completeness < 70
        );

}


        const plot =
            report.analysis.plot;


        if (
            plot.openQuestions > 0
        ) {

            report.recommendations.push({

    type:
        "plot",

    message:
        "Resolve or develop unresolved story questions."

});

        }



        const memory =
            report.analysis.memory;


        if (
            memory.hiddenSecrets > 0
        ) {

            report.recommendations.push({

    type:
        "memory",

    message:
        "Track secrets and their future consequences."

});

        }


      // =========================
     // 🧠 MEMORY ANALYSIS
     // =========================

const memoryAnalysis =
    report.analysis.memoryAnalysis;


if (
    memoryAnalysis &&
    memoryAnalysis.issues &&
    memoryAnalysis.issues.length > 0
) {


    report.recommendations.push({

        type:
            "memory_analysis",

        message:
            "Story continuity memory requires improvement.",


        issues:
            memoryAnalysis.issues.map(
                issue => ({

                    type:
                        issue.type,


                    missing:
                        issue.missing,


                    suggestions: [

                        "Track important events and their consequences",

                        "Maintain consistency of character knowledge",

                        "Remember unresolved conflicts",

                        "Preserve timeline continuity"

                    ]

                })
            )

    });

}


       // =========================
       // 🔄 CONTINUITY ANALYSIS
       // =========================

const continuityAnalysis =
    report.analysis.continuity;


if (
    continuityAnalysis &&
    continuityAnalysis.issues &&
    continuityAnalysis.issues.length > 0
) {


    report.recommendations.push({

        type:
            "continuity",

        message:
            "Story continuity requires improvement.",


        issues:
            continuityAnalysis.issues.map(
                issue => ({

                    type:
                        issue.type,


                    description:
                        issue.description,


                    suggestions: [

                        "Check timeline consistency",

                        "Maintain character knowledge consistency",

                        "Track relationship changes",

                        "Connect previous events with future consequences"

                    ]

                })
            )

    });

}


             // =========================
             // 🧠 STORY LOGIC ANALYSIS
            // =========================

const storyLogicAnalysis =
    report.analysis.storyLogic;


if (
    storyLogicAnalysis &&
    storyLogicAnalysis.issues &&
    storyLogicAnalysis.issues.length > 0
) {


    report.recommendations.push({

        type:
            "story_logic",


        message:
            "Story logic requires improvement.",


        issues:
            storyLogicAnalysis.issues.map(
                issue => ({

                    type:
                        issue.type,


                    description:
                        issue.description,


                    suggestions: [

                        "Strengthen cause and effect between events",

                        "Connect character decisions with story consequences",

                        "Avoid events without motivation",

                        "Maintain logical progression of the story"

                    ]

                })
            )

    });

}


      // =========================
     // 🎬 CHARACTER ACTIONS
     // =========================

const characterActions =
    report.analysis.characterActions;


if (
    characterActions &&
    characterActions.characters
) {

    const inactiveCharacters =
        characterActions.characters.filter(
            character =>
                character.actionScore < 30
        );


    if (
        inactiveCharacters.length > 0
    ) {

        report.recommendations.push({

            type:
                "character_actions",

            message:
                "Characters do not sufficiently influence story events.",

            characters:
                inactiveCharacters.map(
                    character => ({

                        name:
                            character.name,

                        actionScore:
                            character.actionScore,

                        suggestions: [

                            "Add meaningful decisions",

                            "Create consequences from character choices",

                            "Show characters pursuing clear goals"

                        ]

                    })
                )

        });

    }

}

      // =========================
      // 🎬 SCENE ANALYSIS
     // =========================

const sceneAnalysis =
    report.analysis.sceneAnalysis;


if (
    sceneAnalysis &&
    sceneAnalysis.scenes
) {


    const weakScenes =
        sceneAnalysis.scenes.filter(
            scene =>
                scene.completeness < 70
        );


    if (
        weakScenes.length > 0
    ) {


        report.recommendations.push({

            type:
                "scene",

            message:
                "Some scenes require improvement.",


            scenes:
                weakScenes.map(
                    scene => ({

                        id:
                            scene.id,

                        title:
                            scene.title,

                        missing:
                            scene.missing,

                        completeness:
                            scene.completeness

                    })
                )

        });

    }

}


        return report;

    }





    static analyzeProject(project) {


  return {

    characters:
        this.analyzeCharacters(project),

    characterDepth:
        this.analyzeCharacterDepth(project),

    characterEvidence:
        CharacterEvidenceAnalyzer.analyze(project),

    characterActions:
        CharacterActionAnalyzer.analyze(project),

   sceneAnalysis:
       SceneAnalyzer.analyze(project),

   dialogueAnalysis:
       DialogueAnalyzer.analyze(project),

   conflicts:
       ConflictAnalyzer.analyze(project),

   memoryAnalysis:
        MemoryAnalyzer.analyze(project),

   continuity:
        ContinuityAnalyzer.analyze(project),

   storyLogic:

    StoryLogicAnalyzer.analyze(project),

    plot:
        this.analyzePlot(project),

    memory:
        this.analyzeMemory(project)


};


}



            // =========================
            // 🎭 CHARACTER DEPTH ANALYSIS
            // =========================

    static analyzeCharacterDepth(project) {


        const result = {

            characters: [],

            observations: []

        };


        if (
            !project.characters ||
            project.characters.length === 0
        ) {

            result.observations.push(
                "No characters found."
            );

            return result;

        }



        project.characters.forEach(character => {


            const missing = [];



            if (
                !character.personality ||
                !character.personality.traits ||
                character.personality.traits.length === 0
            ) {

                missing.push(
                    "personality traits"
                );

            }



            if (
                !character.background ||
                !character.background.history
            ) {

                missing.push(
                    "background history"
                );

            }



            if (
                !character.motivation ||
                !character.motivation.goal
            ) {

                missing.push(
                    "personal goal"
                );

            }



            if (
                !character.motivation ||
                !character.motivation.fear
            ) {

                missing.push(
                    "fear"
                );

            }



            if (
                !character.conflict ||
                !character.conflict.internal
            ) {

                missing.push(
                    "internal conflict"
                );

            }



            if (
                !character.conflict ||
                !character.conflict.external
            ) {

                missing.push(
                    "external conflict"
                );

            }



            if (
                !character.development ||
                !character.development.arc
            ) {

                missing.push(
                    "character arc"
                );

            }



            result.characters.push({

                name:
                    character.name,

                role:
                    character.role,

                missing,

                completeness:
                    Math.max(
                        0,
                        100 -
                        (missing.length * 14)
                    )

            });


        });



        const weakCharacters =
            result.characters.filter(
                c => c.missing.length > 0
            );



        if (weakCharacters.length > 0) {

            result.observations.push(
                "Some characters require deeper development."
            );

        }
        else {

            result.observations.push(
                "Characters have strong structural development."
            );

        }



        return result;

    }

}

module.exports = AnalysisService;
