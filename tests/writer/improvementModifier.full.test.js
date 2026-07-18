const ImprovementModifier =
    require("../../services/studio/improvementModifier");


let project = {

    characters: [
        {
            name: "Edward"
        }
    ],

    scenes: []

};


const proposals = [

    {
        type: "character_update",
        character: "Edward",
        target: "fear",
        change: "Edward needs a meaningful fear.",
        status: "approved"
    },


    {
        type: "character_action_update",
        character: "Edward",
        change: "Edward makes an important decision.",
        status: "approved"
    },


    {
        type: "scene_character_evidence",
        character: "Edward",
        change: "Show Edward through actions and dialogue.",
        status: "approved"
    },


    {
        type: "scene_update",
        scene: "The First Meeting",
        target: "conflict",
        change: "Increase scene conflict.",
        status: "approved"
    },


    {
        type: "memory_update",
        target: "timeline",
        change: "Add important event to memory.",
        status: "approved"
    },


    {
        type: "story_logic_update",
        target: "unresolved_thread",
        change: "Connect events with consequences.",
        status: "approved"
    }

];



project =
    ImprovementModifier.applyAll(
        project,
        proposals
    );


console.log(
    JSON.stringify(
        project,
        null,
        2
    )
);
