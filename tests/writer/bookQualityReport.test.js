const BookQualityReport =
require("../../services/studio/manuscriptAnalyzer/bookQualityReport");


const chapters = [

    {

        score: 30,

        weaknesses:[
            "Conflict missing"
        ]

    },


    {

        score: 60,

        weaknesses:[
            "Weak character motivation"
        ]

    },


    {

        score: 80,

        weaknesses:[]

    }

];



const comparison = {

    structureScore:85,

    problems:[

        {

            message:
            "Conflict does not develop between chapters."

        }

    ]

};



const result =
BookQualityReport.generate({

    chapters,

    comparison

});



console.log(

    JSON.stringify(
        result,
        null,
        2
    )

);
