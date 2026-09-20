const { spawn } = require("child_process");
const path = require("path");

const PYTHON = "python";
const BRIDGE_SCRIPT = path.resolve(
    __dirname,
    "../../tools/entity_lab/entity_lab_bridge.py"
);

function analyzeText(text) {
    return new Promise((resolve, reject) => {
        const process = spawn(PYTHON, [BRIDGE_SCRIPT]);

        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("error", (error) => {
            reject(error);
        });

        process.on("close", (code) => {
            if (code !== 0) {
                reject(
                    new Error(
                        `Entity Lab exited with code ${code}\n${stderr}`
                    )
                );
                return;
            }

            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (error) {
                reject(
                    new Error(
                        `Failed to parse Entity Lab JSON: ${error.message}\n${stdout}`
                    )
                );
            }
        });

        process.stdin.write(text);
        process.stdin.end();
    });
}

module.exports = {
    analyzeText
};
