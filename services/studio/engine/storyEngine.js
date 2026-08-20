const ProjectBuilder = require("./projectBuilder");
const promptBuilder = require("../promptBuilder");
const OpenRouter = require("../ai/openrouter");
const MemoryService = require("../memoryService");

const AnalysisService =
    require("../analysisService");

const ImprovementService =
    require("../improvementService");

const ImprovementPlanner =
    require("../improvementPlanner");


class StoryEngine {

    static async start(input) {

        // =========================
        // 1. CREATE PROJECT
        // =========================
        const project =
            ProjectBuilder.create(input);

        MemoryService.initialize(project);

// =========================
// 🧠 ANALYSIS & IMPROVEMENT
// =========================

const analysis =
    AnalysisService.generateReport(project);


const improvements =
    ImprovementService.improveProject(
        project,
        analysis
    );

const tasks =
    ImprovementPlanner.createTasks(
        project,
        improvements
    );

project.generation.analysis =
    analysis;

project.generation.improvements =
    improvements;

project.generation.tasks =
    tasks;


project.generation.status =
    "generating";


        project.generation.currentStep =
            "prompt";


        // =========================
        // 2. BUILD PROMPT
        // =========================
        const prompt =
            promptBuilder.build({

                mode: project.settings.genre,

                formData: input,

                improvements
            });


        project.generation.lastPrompt =
            prompt;


        // =========================
        // 3. AI GENERATION
        // =========================
        let result;

if (input.test === true) {

    result = `
TEST MODE

StoryEngine works.
No OpenRouter request.
`;

} else {

    result = await OpenRouter.generate({
        prompt,
        memory: project.memory
    });

}


        // =========================
        // 4. SAVE RESULT
        // =========================
        project.generation.lastResponse =
            result;


        project.chapters.push({

            index: 1,

            title:
                project.metadata.title,

            content:
                result
        });


    MemoryService.addTimelineEvent(
    project,
    "Chapter 1 generated"
); 


        project.generation.status =
            "completed";


        project.generation.currentStep =
            null;


        return project;
    }
}


module.exports = StoryEngine;

