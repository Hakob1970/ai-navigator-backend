const ManuscriptAnalyzer =
require("../../services/studio/manuscriptAnalyzer/manuscriptAnalyzer");



const starColony = {


title:
"Star Colony",


chapters:[


{

title:
"Chapter 1 - The Order",

text:
`
Edward looked at Earth.

"I have to go back," Edward said.

Commander Hale refused his request.

Edward repaired the old system.
`

},



{

title:
"Chapter 2 - Secret Shuttle",

text:
`
Edward and Marcus prepared the shuttle.

They worked through the night.

The mission was dangerous.
`

},



{

title:
"Chapter 3 - The Choice",

text:
`
Hale discovered the plan.

Marcus had to choose.

Edward launched the shuttle.
`

}


]


};



const result =
ManuscriptAnalyzer.analyze(
    starColony
);



console.log(

JSON.stringify(
    result,
    null,
    2
)

);
