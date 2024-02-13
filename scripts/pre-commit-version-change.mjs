import readline from "readline";
import { execSync } from "child_process";
import { resolve } from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask the user for version change type
const askVersionChange = () =>
  new Promise((resolve) => {
    rl.question(
      "Enter version change type (patch, minor, major): ",
      (answer) => {
        if (["patch", "minor", "major"].includes(answer)) {
          resolve(answer);
        } else {
          console.log(
            'Invalid input. Please enter "patch", "minor", or "major".'
          );
          process.exit(1);
        }
      }
    );
  });

// Execute bump-version.js script
const executeBumpVersion = (versionChange) => {
  const scriptPath = resolve(process.cwd(), "scripts/bump-version.mjs");
  execSync(`node ${scriptPath} ${versionChange}`, { stdio: "inherit" });
};

// Main function to run the pre-commit hook logic
const main = async () => {
  const versionChange = await askVersionChange();
  executeBumpVersion(versionChange);
  rl.close();
};

main();
