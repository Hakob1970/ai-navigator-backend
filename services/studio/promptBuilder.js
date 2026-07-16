const promptRegistry = require("./promptRegistry");


exports.build = ({ mode, formData, improvements }) => {


  if (!mode) {

    throw new Error("MODE_REQUIRED");

  }


  const builder =
      promptRegistry[mode];


  if (!builder) {

    throw new Error(`UNKNOWN_MODE: ${mode}`);

  }


  return builder({

      ...formData,

      improvements

  });

};
