/**
 * 🛠️ ImprovementService
 * Система улучшения книги
 */

  const CharacterBuilder =
    require("./characterBuilder");


class ImprovementService {



    /**
     * Полное улучшение проекта
     */
    static improveProject(project, report) {


        const recommendations =
    report.recommendations || [];


return {

    characters:
        this.improveCharacters(
            project,
            recommendations.filter(
                r => r.type === "character"
            )
        ),


characterEvidence:
    this.improveCharacterEvidence(
        project,
        recommendations.filter(
            r => r.type === "character_evidence"
        )
    ),


    characterActions:
        this.improveCharacterActions(
            project,
            recommendations.filter(
               r => r.type === "character_actions"
        )
    ),


    sceneAnalysis:
    this.improveSceneAnalysis(
        project,
        recommendations.filter(
            r => r.type === "scene"
        )
    ),

    conflictAnalysis:
    this.improveConflictAnalysis(
        project,
        recommendations.filter(
            r => r.type === "conflict"
        )
    ),

    dialogueAnalysis:
    this.improveDialogueAnalysis(
        project,
        recommendations.filter(
            r => r.type === "dialogue"
        )
    ),


    plot:
        this.improvePlot(
            project,
            recommendations.filter(
                r => r.type === "plot"
            )
        ),


    memory:
        this.improveMemory(
            project,
            recommendations.filter(
                r => r.type === "memory"
            )
        ),

    memoryAnalysis:
    this.improveMemoryAnalysis(
        project,
        recommendations.filter(
            r => r.type === "memory_analysis"
        )
    ),

    continuity:
    this.improveContinuity(
        project,
        recommendations.filter(
            r => r.type === "continuity"
        )
    ),

    storyLogic:
    this.improveStoryLogic(
        project,
        recommendations.filter(
            r => r.type === "story_logic"
        )
    ),


    quality:
    this.improveQuality(
        report.quality
    )

};


    }





    // =========================
    // 👤 CHARACTERS
    // =========================


    static improveCharacters(project, recommendations) {


        const result = {


            status:
                "good",


            actions:
                []

        };



        if (
    recommendations &&
    recommendations.length > 0
) {


            result.status =
                "needs_improvement";


          recommendations.forEach(
    recommendation => {


        recommendation.characters.forEach(
            characterData => {


                const character =
                    project.characters.find(
                        c =>
                        c.name === characterData.name
                    );


                if (!character) {
                    return;
                }


                const suggestions =
                    CharacterBuilder.buildSuggestions(
                        character
                    );


                result.actions.push({

                    character:
                        character.name,


                    missing:
                        characterData.missing,


                    suggestions:[

                        `Goal: ${suggestions.goal}`,

                        `Fear: ${suggestions.fear}`,

                        `Internal Conflict: ${suggestions.internalConflict}`,

                        `External Conflict: ${suggestions.externalConflict}`,

                        `Character Arc: ${suggestions.arc}`

                    ]

                });


            }
        );


    }
);



        return result;


    }


  }


       // =========================
       // 🎬 CHARACTER ACTIONS IMPROVEMENT
      // =========================

static improveCharacterActions(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        recommendations &&
        recommendations.length > 0
    ) {

        result.status =
            "needs_improvement";


        recommendations.forEach(
            recommendation => {

                recommendation.characters.forEach(
                    character => {

                        result.actions.push({

                            character:
                                character.name,

                            suggestions: [

                                "Give the character important decisions",

                                "Create scenes where character choices affect the plot",

                                "Show clear goals and motivations through actions",

                                "Add consequences caused by character decisions",

                                "Increase character influence on story events"

                            ]

                        });

                    }
                );

            }
        );

    }


    return result;

}


      // =========================
     // 🎬 SCENE ANALYSIS IMPROVEMENT
     // =========================

static improveSceneAnalysis(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        recommendations &&
        recommendations.length > 0
    ) {

        result.status =
            "needs_improvement";


        recommendations.forEach(
            recommendation => {

                recommendation.scenes.forEach(
                    scene => {

                        result.actions.push({

                            scene:
                                scene.title ||
                                scene.id,


                            missing:
                                scene.missing || [],


                            suggestions: [

                                "Increase scene conflict",

                                "Show character decisions",

                                "Create meaningful consequences",

                                "Improve scene tension",

                                "Connect scene events with the main plot"

                            ]

                        });

                    }
                );

            }
        );

    }

  return result;
}




        // =========================
        // 💬 DIALOGUE ANALYSIS IMPROVEMENT
       // =========================

static improveDialogueAnalysis(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        !recommendations ||
        recommendations.length === 0
    ) {

        return result;

    }


    result.status =
        "needs_improvement";


    recommendations.forEach(
        recommendation => {


            if (
                recommendation.scenes
            ) {


                recommendation.scenes.forEach(
                    scene => {

                        result.actions.push({

                            scene:
                                scene.title ||
                                scene.id,


                            missing:
                                scene.missing || [],


                            suggestions: [

                                "Make dialogue reveal character personality",

                                "Avoid dialogue that only transfers information",

                                "Create stronger interaction between characters",

                                "Use dialogue to increase conflict",

                                "Connect dialogue with character goals and emotions"

                            ]

                        });

                    }
                );

            }

        }
    );


    return result;

}


         // =========================
         // ⚔️ CONFLICT ANALYSIS IMPROVEMENT
         // =========================

static improveConflictAnalysis(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        !recommendations ||
        recommendations.length === 0
    ) {

        return result;

    }


    result.status =
        "needs_improvement";


    recommendations.forEach(
        recommendation => {


            if (
                recommendation.conflicts
            ) {


                recommendation.conflicts.forEach(
                    conflict => {

                        result.actions.push({

                            character:
                                conflict.character,


                            missing:
                                conflict.missing || [],


                            suggestions: [

                                "Create stronger internal struggle",

                                "Increase external obstacles",

                                "Connect conflict with character motivation",

                                "Show consequences of unresolved conflict",

                                "Use conflict to drive story decisions"

                            ]

                        });

                    }
                );

            }

        }
    );


    return result;

}




          // =========================
         // 🎭 CHARACTER EVIDENCE
        // =========================

static improveCharacterEvidence(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        recommendations &&
        recommendations.length > 0
    ) {

        result.status =
            "needs_improvement";


        recommendations.forEach(
            recommendation => {

                recommendation.characters.forEach(
                    character => {

                        result.actions.push({

                            character:
                                character.name,

                            sceneCount:
                                character.sceneCount,

                            suggestions: [

                                "Add scenes where the character makes important decisions",

                                "Show character personality through actions",

                                "Add meaningful dialogue",

                                "Connect character choices with plot events",

                                "Increase character presence in key scenes"

                            ]

                        });

                    }
                );

            }
        );

    }


    return result;

}


    // =========================
    // 📖 PLOT
    // =========================


    static improvePlot(project, recommendations) {


        const result = {


            status:
                "good",


            actions:
                []

        };

        if (
    recommendations &&
    recommendations.length > 0
) {


    result.status =
        "needs_improvement";


    recommendations.forEach(
        recommendation => {


            result.actions.push({

                message:
                    recommendation.message,


                suggestions:[

                    "Strengthen chapter conflicts",

                    "Connect plot events with character motivations",

                    "Resolve open questions gradually",

                    "Increase tension before major events"

                ]

            });


        }
    );


}


return result;


    }





    // =========================
    // 🧠 MEMORY
    // =========================


    static improveMemory(project, recommendations) {


    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        recommendations &&
        recommendations.length > 0
    ) {


        result.status =
            "needs_improvement";


        recommendations.forEach(
            recommendation => {

                result.actions.push({

                    message:
                        recommendation.message,

                    suggestions:[

                        "Track consequences of important events",

                        "Maintain character relationship changes",

                        "Remember unresolved conflicts",

                        "Use hidden secrets in future chapters"

                    ]

                });

            }
        );

    }


    return result;

}


      // =========================
      // 🧠 MEMORY ANALYSIS IMPROVEMENT
      // =========================

static improveMemoryAnalysis(
    project,
    recommendations
) {

    const result = {

        status:
            "good",

        actions:
            []

    };


    if (
        recommendations &&
        recommendations.length > 0
    ) {

        result.status =
            "needs_improvement";


        recommendations.forEach(
            recommendation => {


                if (
                    !recommendation.issues
                ) {
                    return;
                }


                recommendation.issues.forEach(
                    issue => {


                        result.actions.push({

                            type:
                                issue.type,


                            missing:
                                issue.missing,


                            suggestions: [

                                "Create timeline of important events",

                                "Track consequences of character decisions",

                                "Maintain consistency of character knowledge",

                                "Connect past events with future chapters"

                            ]

                        });


                    }
                );


            }
        );


    }


    return result;

}


        static improveContinuity(project, recommendations) {


    if (
        !recommendations ||
        recommendations.length === 0
    ) {

        return {

            status: "good",

            actions: []

        };

    }


    return {

        status:
            "needs_improvement",


        actions:
            recommendations.map(item => ({

                issues:
                    item.issues || [],


                suggestions: [

                    "Maintain timeline consistency",

                    "Track character knowledge changes",

                    "Preserve world rules",

                    "Connect past events with future consequences"

                ]

            }))

    };

}



          // =========================
         // 🧠 STORY LOGIC / CONTINUITY
         // =========================

    static improveStoryLogic(project, recommendations) {

        return {

            status:
                recommendations.length > 0
                    ? "needs_improvement"
                    : "good",

            actions:

                recommendations.map(item => ({

                    issues:
                        item.issues || [],


                    suggestions: [

                        "Maintain timeline consistency",

                        "Track character knowledge changes",

                        "Preserve world rules",

                        "Connect past events with future consequences"

                    ]

                }))

        };

    }


    // =========================
    // 🏭 QUALITY
    // =========================


    static improveQuality(quality) {


        const result = {


            status:
                "good",


            actions:
                []

        };



        if (
            quality &&
            quality.overall < 80
        ) {


            result.status =
                "needs_improvement";


            result.actions.push(
                "Improve weak areas before continuing."
            );


        }



        return result;


    }


    // =========================
    // 📝 TO PROMPT
    // =========================

    static toPrompt(improvements) {

        if (!improvements) {
            return "";
        }

        let text =
            "EDITOR NOTES:\n\n";


        // =========================
        // CHARACTERS
        // =========================

        if (
            improvements.characters &&
            improvements.characters.actions
        ) {

            text +=
                "CHARACTER IMPROVEMENTS:\n\n";


            improvements.characters.actions.forEach(
                item => {

                    text +=
                        `${item.character}:\n`;


                    item.suggestions.forEach(
                        suggestion => {

                            text +=
                                `- ${suggestion}\n`;

                        }
                    );

                    text += "\n";

                }
            );

        }


        // =========================
        // PLOT
        // =========================

        if (
            improvements.plot &&
            improvements.plot.actions
        ) {

            text +=
                "PLOT NOTES:\n";


            improvements.plot.actions.forEach(
                action => {

                    text +=
                        `- ${action}\n`;

                }
            );

            text += "\n";

        }


        // =========================
        // MEMORY
        // =========================

        if (
            improvements.memory &&
            improvements.memory.actions
        ) {

            text +=
                "MEMORY NOTES:\n";


            improvements.memory.actions.forEach(
                action => {

                    text +=
                        `- ${action}\n`;

                }
            );

            text += "\n";

        }


        return text.trim();

    }

 }


module.exports = ImprovementService;
