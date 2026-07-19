const LiteraryBrain = require("../../services/studio/literaryBrain");


async function run() {

  const brain = new LiteraryBrain();


  const project = {
    metadata: {
      title: "Star Colony"
    }
  };


  const result = await brain.run(project);


  console.log("\nNAME:");
  console.log(brain.name);


  console.log("\nVERSION:");
  console.log(brain.version);


  console.log("\nRESULT:");
  console.log(JSON.stringify(result, null, 2));


  if (
    result.project.metadata.title === "Star Colony" &&
    result.stages[0].stage === "start"
  ) {
    console.log("\n✅ LiteraryBrain Test Passed");
  } else {
    throw new Error("LiteraryBrain Test Failed");
  }

}


run();
