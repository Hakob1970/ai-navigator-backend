const LiteraryBrain =
    require("../../services/studio/literaryBrain");


async function run() {


const project = {

    metadata:{
        title:"Star Colony"
    },


    characters:[

        {
            name:"Edward",
            role:"Engineer",
            motivation:
                "Find his sister on Earth",
            conflict:
                "Cannot leave the colony"
        },


        {
            name:"Commander Hale",
            role:"Commander",
            motivation:
                "Protect the colony",
            conflict:
                "Edward threatens security"
        },


        {
            name:"Marcus",
            role:"Pilot",
            motivation:
                "Help his friend",
            conflict:
                "Choose between loyalty and duty"
        }

    ],


    scenes:[

        {
            id:"scene_1",
            title:"The Order",
            summary:
            "Edward asks permission to leave. Hale refuses."
        },


        {
            id:"scene_2",
            title:"Secret Shuttle",
            summary:
            "Edward and Marcus prepare an old shuttle."
        },


        {
            id:"scene_3",
            title:"The Choice",
            summary:
            "Hale discovers the plan and Marcus must decide."
        }

    ],


    chapters:[

        {
            number:1,
            title:"The Order"
        },

        {
            number:2,
            title:"Secret Shuttle"
        },

        {
            number:3,
            title:"The Choice"
        }

    ],


    storyArchitecture:{

        theme:
        "Freedom versus responsibility",

        premise:
        "An engineer risks everything to return to Earth"

    }

};



const brain =
    new LiteraryBrain();


const result =
    await brain.run(project);



console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);


}


run();
