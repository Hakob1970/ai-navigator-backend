const ProjectBuilder =
    require("../../services/studio/engine/projectBuilder");

const AnalysisService =
    require("../../services/studio/analysisService");

const ImprovementService =
    require("../../services/studio/improvementService");

const ImprovementPlanner =
    require("../../services/studio/improvementPlanner");

const PriorityPlanner =
    require("../../services/studio/priorityPlanner");

const ImprovementExecutor =
    require("../../services/studio/improvementExecutor");

const ManuscriptAnalyzer =
require("../../services/studio/manuscriptAnalyzer/manuscriptAnalyzer");



let project =
    ProjectBuilder.create({

        title: "The Fall of the Kingdom",

        characters: [

    {
        name: "Alex",
        role: "protagonist",

        personality: {
            traits: [
                "brave",
                "loyal",
                "thoughtful"
            ]
        },

        background:
            "A former royal guard who lost his family during a political conflict.",

        motivation: {
            goal:
                "Protect the kingdom and uncover the truth behind the betrayal",

            fear:
                "Failing the people who depend on him"
        },

        conflict: {

            internal:
                "Duty versus personal revenge",

            external:
                "A powerful enemy controlling the kingdom"
        },

        arc:
            "From a loyal soldier into a leader who accepts responsibility"

    },


    {
        name: "Victor",
        role: "antagonist",

        personality: {
            traits: [
                "ambitious",
                "manipulative",
                "patient"
            ]
        },

        background:
            "A former advisor who believes the kingdom needs a stronger ruler.",

        motivation: {

            goal:
                "Take control of the kingdom",

            fear:
                "Losing power and influence"

        },

        conflict: {

            internal:
                "Desire for order versus fear of chaos",

            external:
                "Conflict with Alex and the resistance"

        },

        arc:
            "From political strategist to a ruler consumed by ambition"

    },


    {
        name: "Maya",
        role: "supporting",

        personality: {
            traits: [
                "intelligent",
                "empathetic"
            ]
        },

        background:
            "A historian who knows hidden secrets about the kingdom.",

        motivation: {

            goal:
                "Reveal the truth about the past",

            fear:
                "Being unable to prevent another disaster"

        },

        conflict: {

            internal:
                "Protecting others versus revealing dangerous secrets",

            external:
                "Opposition from Victor's forces"

        },

        arc:
            "From observer to active participant in the conflict"

    }

]

    });



         // =========================
// 🌍 WORLD SETUP
// =========================

project.world = {

    name:
        "The Kingdom of Eldoria",

    rules: [

        "The king rules with support of the council",

        "Magic exists but is controlled by ancient laws",

        "Betrayal against the crown is considered a major crime"

    ],

    history:
        "The kingdom survived a devastating war caused by internal betrayal."

};



// =========================
// 🧭 TIMELINE
// =========================

project.timeline = [

    {
        id:
            "event_1",

        title:
            "The King's Funeral",

        description:
            "The kingdom enters a period of uncertainty after the king's death.",

        consequences:
            [
                "Victor gains political influence",

                "Alex becomes responsible for protecting the kingdom"
            ]
    },


    {
        id:
            "event_2",

        title:
            "The Hidden Letter",

        description:
            "Maya discovers evidence about the previous betrayal.",

        consequences:
            [
                "Alex learns the truth",

                "The alliance between Alex and Maya begins"
            ]
    }

];


         project.scenes = [

{
    id: "chapter_1_scene_1",

    title:
        "The King's Funeral",

    goal:
        "Alex wants to protect the kingdom during the political crisis",

    conflict:
        "Victor uses the chaos after the king's death to gain control",

    obstacle:
        "Alex discovers that the council hides information about the betrayal",

    characters:
        project.characters.map(
            character => character.id
        ),

    decision:
        "Alex decides to investigate the king's death instead of blindly following the council",

    dialogue: [

        {
            character:
                "Alex",

            text:
                "Someone betrayed the kingdom. I will find the truth."
        },

        {
            character:
                "Victor",

            text:
                "The kingdom needs order, not questions."
        },

        {
            character:
                "Maya",

            text:
                "The past is hidden, but not forgotten."
        }

    ],

    outcome:
        "Alex begins investigating while Victor strengthens his political position",

    emotionalShift:
        "Alex moves from grief toward determination"

}

];


         // =========================
         // 📖 MANUSCRIPT TEXT
         // =========================
       // Реальный текст тестовой рукописи.
       // Книга намеренно несовершенна.
      // Не подгоняем текст под ManuscriptAnalyzer.

project.chapters = [

{
    id: "chapter_1",
    number: 1,
    title: "The King's Funeral",

    text: `
The bells of Eldoria rang before sunrise.

Alex stood beneath the black banners outside the royal palace and watched the people gather in the cold square. Three days had passed since the king's death, but nobody seemed ready to speak about what had happened.

He had served the king for twelve years. Now he stood without a uniform, without orders, and without a family to return to.

Maya approached him quietly.

"You have been standing here for hours," she said.

"I am waiting."

"For what?"

Alex looked toward the council hall.

"For someone to tell the truth."

Before Maya could answer, Victor appeared with several council members behind him.

"The kingdom needs stability," Victor said. "This is not the time for accusations."

Alex looked at him.

"And if someone betrayed the king?"

Victor's expression did not change.

"Then we will deal with it when there is proof."

The funeral procession began.

During the ceremony, Alex noticed that several council members avoided looking at him. He remembered the night of the king's death and the strange order that had sent half of the royal guard away from the palace.

After the funeral, Victor entered the council hall.

Alex followed.

"You should return home," Victor told him.

"I don't have one."

For a moment Victor said nothing.

Then Alex noticed a sealed document on the table. The royal seal had been broken.

Maya saw it too.

"Alex," she whispered, "leave it."

But Alex had already picked it up.

The first line mentioned a secret meeting held on the night the king died.

He decided to investigate.
`
},

{
    id: "chapter_2",
    number: 2,
    title: "The Hidden Letter",

    text: `
Rain covered the streets of Eldoria when Maya found Alex in an abandoned archive beneath the palace.

"You should not be here," she said.

"Neither should you."

Maya held an old book against her chest.

"I found something."

She opened it and removed a folded letter.

Alex read it twice.

The letter described a meeting between the king and an unknown member of the council. It also mentioned a shipment of weapons that had disappeared before the war.

"Who wrote this?"

"I don't know."

"Then why trust it?"

"I don't."

Alex looked at her.

That answer surprised him.

Maya explained that several pages had been removed from the archive. She believed someone had been hiding the history of the kingdom for years.

A noise came from the corridor.

They extinguished the lamp.

Two soldiers entered the archive.

"Search everything," one of them said.

Alex reached for his sword.

Maya grabbed his arm.

"No."

"We can't stay here."

"You cannot fight everyone."

Alex waited until the soldiers passed.

Then they escaped through a narrow passage.

Outside, Maya stopped.

"You need to decide what matters more," she said. "Finding the truth or keeping the people around you alive."

Alex did not answer.

He kept the letter.

By morning, Victor knew that someone had entered the archive.
`
},

{
    id: "chapter_3",
    number: 3,
    title: "The First Betrayal",

    text: `
Victor sat alone in the council chamber.

The kingdom was already beginning to divide.

Merchants wanted protection. Soldiers wanted orders. The council wanted someone who could promise that nothing would change.

Victor understood all of them.

He also understood fear.

When Alex entered the chamber, Victor dismissed the others.

"You have been asking questions."

"Yes."

"You should stop."

Alex placed the letter on the table.

Victor looked at it.

For the first time, something moved in his expression.

"Where did you get this?"

"Does it matter?"

"It matters very much."

Alex stepped closer.

"You knew about the meeting."

Victor stood.

"I knew the king was making decisions that could have destroyed the kingdom."

"So you betrayed him?"

Victor did not answer.

Instead he walked to the window.

"The kingdom needs order. People cannot survive endless uncertainty."

"And you think you can provide that order?"

"I know I can."

Alex wanted to arrest him.

But the council guards were already outside the door.

Victor smiled.

"You still believe loyalty is enough."

Alex left the chamber.

That evening, several members of the resistance were arrested.

Maya was among them.

Alex learned of the arrests too late.

He returned to the archive and found it burning.

The letter was gone.

For the first time, Alex wondered whether his investigation had put everyone around him in greater danger.

He had wanted the truth.

Now he was no longer certain what he was willing to sacrifice for it.
`
},

{
    id: "chapter_4",
    number: 4,
    title: "The Choice",

    text: `
Maya was held beneath the eastern tower.

Alex found the old passage into the prison before midnight.

He had one chance to free her.

But the resistance had also discovered where Victor was keeping the royal records.

Alex could go after the records or rescue Maya.

He stood in the darkness for a long time.

Maya was behind one door.

The records were behind another.

He chose Maya.

The escape was quick and almost silent.

When they reached the river, Maya looked back toward the palace.

"You left the records."

"I know."

"Why?"

Alex did not answer immediately.

"Because I have lost enough people."

Maya looked at him carefully.

"You said the truth mattered."

"It does."

"But not more than a life?"

"Not anymore."

They crossed the river before dawn.

Behind them, Victor's soldiers discovered that Maya had escaped.

By morning, Victor had taken control of the council.

The kingdom was now effectively his.

Alex had saved Maya.

He had also lost the chance to expose Victor immediately.

`
},

{
    id: "chapter_5",
    number: 5,
    title: "The Fall",

    text: `
The city gates opened at sunrise.

Victor's soldiers entered Eldoria without resistance.

The council announced that Victor would serve as protector of the kingdom until a new ruler could be chosen.

Nobody believed the promise.

Alex and Maya watched from a hill outside the city.

"You saved me," Maya said.

"And lost the kingdom."

"We haven't lost everything."

Alex looked at the city.

He remembered the king's funeral. The letter. The burning archive. The prisoners.

He had spent his life believing that loyalty meant obeying a duty until the end.

Now he understood that duty could also mean choosing what to protect.

Maya gave him the last page of the letter.

She had hidden it before the archive burned.

Alex read the final paragraph.

The king had known about Victor.

But he had also known that several members of the council were helping him.

The betrayal was larger than either of them had imagined.

Alex folded the page.

"We need to return."

Maya shook her head.

"Not yet."

Alex looked at the kingdom.

For the first time, he did not feel like a soldier waiting for an order.

He began making plans.

Far below them, Victor stood on the palace balcony.

The bells of Eldoria rang again.

This time, nobody celebrated.
`
}

];



// имитируем работу автора
project.characters[0].personality.traits.push(
    "brave",
    "loyal"
);

project.characters[0].motivation.goal =
    "Protect the kingdom";

project.characters[0].motivation.fear =
    "Losing his family";

project.characters[0].conflict.internal =
    "Duty versus personal happiness";

project.characters[1].personality.traits = [];

project.characters[1].background =
    "";

project.characters[1].motivation.goal =
    "";

project.characters[1].motivation.fear =
    "";

project.characters[1].conflict.internal =
    "";

project.characters[1].conflict.external =
    "";

project.characters[1].arc =
    "";


      const CharacterArcAnalyzer =
    require("../../services/studio/manuscriptAnalyzer/characterArcAnalyzer");

const characterArcReport =
    CharacterArcAnalyzer.analyze(
        project.chapters,
        project.characters
    );

console.log(
    "\n========== CHARACTER ARC ONLY =========="
);

console.log(
    JSON.stringify(
        characterArcReport,
        null,
        2
    )
);



// анализ



const report =
    AnalysisService.generateReport(project);

console.log(
    "\n========== QUALITY =========="
);

console.log(
    JSON.stringify(
        report.qualityDecision,
        null,
        2
    )
);

console.log(
    "\n========== QUALITY SCORE =========="
);

console.log(
    JSON.stringify(
        report.analysis.quality,
        null,
        2
    )
);

console.log(
    "\n========== AGGREGATED ISSUES =========="
);

console.log(
    JSON.stringify(
        report.aggregatedIssues,
        null,
        2
    )
);

console.log(
    "\n========== RECOMMENDATIONS =========="
);

console.log(
    JSON.stringify(
        report.recommendations,
        null,
        2
    )
);


         // =========================
        // 📖 MANUSCRIPT ANALYSIS
        // =========================

console.log("MANUSCRIPT INPUT DEBUG:", {
    title: project.title,
    chapters: project.chapters?.length,
    firstChapter: project.chapters?.[0]?.title
});


const manuscriptReport =
    ManuscriptAnalyzer.analyze(project);

console.log(
    "\n========== MANUSCRIPT ANALYSIS =========="
);

console.log(
    JSON.stringify(
        manuscriptReport,
        null,
        2
    )
);



// улучшения
const improvements =
    ImprovementService.improveProject(
        project,
        report
    );

const tasks =
    ImprovementPlanner.createTasks(
        project,
        improvements
    );

const prioritizedTasks =
    PriorityPlanner.sort(tasks);

const proposals =
    ImprovementExecutor.createProposals(
    project,
    tasks
);


console.log(
    JSON.stringify(
        proposals,
        null,
        2
    )
);


console.log(
    JSON.stringify(
        prioritizedTasks,
        null,
        2
    )
);


console.log(
    JSON.stringify(
        tasks,
        null,
        2
    )
);


console.log(
    JSON.stringify(
        report.analysis.characterActions,
        null,
        2
    )
);


console.log(
    JSON.stringify(
        improvements,
        null,
        2
    )
);

if (!report.recommendations) {
    throw new Error(
        "Analysis failed: no recommendations"
    );
}


if (!improvements.characters) {
    throw new Error(
        "Improvement failed: no character improvements"
    );
}


console.log(
    "\n✅ Editor Loop Test Passed"
);


