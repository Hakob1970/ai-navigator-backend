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
