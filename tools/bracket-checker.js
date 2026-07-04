const fs = require("fs");

const filePath = process.argv[2] || "./routes/autoMechanic.js";

const code = fs.readFileSync(filePath, "utf8");

let balance = 0;
let line = 1;
let stack = [];

for (let i = 0; i < code.length; i++) {
  const char = code[i];

  if (char === "\n") line++;

  if (char === "{") {
    balance++;
    stack.push(line);
  }

  if (char === "}") {
    balance--;

    if (balance < 0) {
      console.log("❌ EXTRA } FOUND");
      console.log("LINE:", line);
      process.exit(1);
    }

    stack.pop();
  }
}

if (balance > 0) {
  console.log("❌ MISSING }");
  console.log("COUNT:", balance);
  console.log("LAST OPEN LINE:", stack[stack.length - 1]);
  process.exit(1);
}

console.log("✅ OK");
