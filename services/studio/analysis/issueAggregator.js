
/**
 * 📦 Issue Aggregator
 * Центральный сборщик проблем Writer Studio
 * Объединяет результаты всех анализаторов
 * и готовит единый формат для Editor Loop.
 */

class IssueAggregator {


    static aggregate(analysis) {


        const issues = [];


        if (!analysis) {

            return {
                issues: []
            };

        }



        const addIssues = (
            module,
            type,
            items,
            priority = "high"
        ) => {


            if (
                !items ||
                !Array.isArray(items)
            ) {

                return;

            }



            items.forEach(issue => {


                issues.push({

                    module,

                    type,

                    target:
                        issue.type ||
                        "general",

                    character:
                        issue.character,


                    description:
                        issue.description ||
                        issue.message ||
                        issue.missing ||
                        "Issue detected.",


                    priority,


                    suggestions:
                        issue.suggestions ||
                        []

                });


            });


        };



        // =========================
        // 🎭 CHARACTER DEPTH
        // =========================

        if (
            analysis.characterDepth &&
            analysis.characterDepth.characters
        ) {


            analysis.characterDepth.characters.forEach(character => {


                if (
                    character.missing &&
                    character.missing.length > 0
                ) {


                    character.missing.forEach(item => {


                        issues.push({

                            module:
                                "characterDepth",

                            type:
                                "character",

                            target:
                                item,


                            character:
                                character.name,


                            description:
                                `Improve ${item} for ${character.name}`,


                            priority:
                                "high"

                        });


                    });


                }


            });


        }



          if (
    analysis.characterEvidence &&
    analysis.characterEvidence.characters
) {

    analysis.characterEvidence.characters.forEach(
        character => {

            if (
                character.presenceScore < 50
            ) {

                issues.push({

                    module:
                        "characterEvidence",

                    type:
                        "character_evidence",

                    target:
                        "story_presence",

                    character:
                        character.name,

                    description:
                        `${character.name} is not sufficiently represented in scenes.`,

                    priority:
                        "high"

                });

            }

        }
    );

}



        // =========================
        // 🧠 STORY LOGIC
        // =========================

        if (
            analysis.storyLogic &&
            analysis.storyLogic.issues
        ) {

            addIssues(
                "storyLogic",
                "story_logic",
                analysis.storyLogic.issues,
                "critical"
            );

        }



        // =========================
        // 🔄 CONTINUITY
        // =========================

        if (
            analysis.continuity &&
            analysis.continuity.issues
        ) {

            addIssues(
                "continuity",
                "continuity",
                analysis.continuity.issues,
                "critical"
            );

        }



        // =========================
        // 🧠 MEMORY
        // =========================

        if (
            analysis.memoryAnalysis &&
            analysis.memoryAnalysis.issues
        ) {

            addIssues(
                "memory",
                "memory",
                analysis.memoryAnalysis.issues,
                "high"
            );

       }


          // =========================
          // 💬 DIALOGUE ANALYSIS
         // =========================

if (
    analysis.dialogueAnalysis &&
    analysis.dialogueAnalysis.scenes
) {

    analysis.dialogueAnalysis.scenes.forEach(
        scene => {

            if (
                scene.quality < 70
            ) {

                issues.push({

                    module:
                        "dialogueAnalysis",

                    type:
                        "dialogue",

                    target:
                        "dialogue_quality",

                    description:
                        `Dialogue requires improvement in scene ${scene.id}.`,

                    priority:
                        "medium",

                    suggestions:
                        scene.missing || []

                });

            }

        }
    );

}


             // =========================
            // 🎬 CHARACTER ACTIONS
           // =========================

if (
    analysis.characterActions &&
    analysis.characterActions.issues
) {

    addIssues(
        "characterActions",
        "character_action",
        analysis.characterActions.issues,
        "high"
    );

}



          // =========================
           // ⚔️ CONFLICT ANALYSIS
          // =========================

if (
    analysis.conflictAnalysis &&
    analysis.conflictAnalysis.conflicts
) {

    analysis.conflictAnalysis.conflicts.forEach(
        conflict => {

            issues.push({

                module:
                    "conflictAnalysis",

                type:
                    "conflict",

                target:
                    "character_conflict",

                character:
                    conflict.character,

                description:
                    `Character conflict requires development for ${conflict.character}.`,

                priority:
                    "high",

                suggestions:
                    conflict.missing || []

            });

        }
    );

}



        // =========================
        // 🎬 SCENES
        // =========================

        if (
            analysis.sceneAnalysis &&
            analysis.sceneAnalysis.scenes
        ) {


            analysis.sceneAnalysis.scenes.forEach(scene => {


                if (
                    scene.completeness < 70
                ) {


                    issues.push({

                        module:
                            "scene",

                        type:
                            "scene",

                        target:
                            scene.id,


                        description:
                            `Scene requires improvement: ${scene.title}`,


                        priority:
                            "medium"

                    });


                }


            });


        }



        return {

            issues:
                 this.normalizeIssues(issues)

        };


    }


             static normalizeIssues(issues) {

        const map = new Map();


        const priorityScores = {
            critical: 100,
            high: 75,
            medium: 50,
            low: 25
        };


        issues.forEach(issue => {


            const key =
                [
                    issue.target,
                    issue.character || ""
                ]
                .join("|");



            if (!map.has(key)) {


                map.set(
                    key,
                    {

                        ...issue,

                        sources:
                            [
                                issue.module
                            ],


                        priorityScore:
                            issue.priorityScore ||
                            priorityScores[
                                issue.priority
                        ] ||
                        50

                    }
                );


            } else {


                const existing =
                    map.get(key);



                if (
                    issue.module &&
                    !existing.sources.includes(
                        issue.module
                    )
                ) {

                    existing.sources.push(
                        issue.module
                    );

                }



                if (
                    issue.suggestions &&
                    issue.suggestions.length
                ) {

                    existing.suggestions =
                        [
                            ...new Set(
                                [
                                    ...(existing.suggestions || []),
                                    ...issue.suggestions
                                ]
                            )
                        ];

                }


            }


        });



        return Array.from(
            map.values()
        )
        .sort(
            (a,b)=>
                b.priorityScore -
                a.priorityScore
        );


    }


}


module.exports = IssueAggregator;
