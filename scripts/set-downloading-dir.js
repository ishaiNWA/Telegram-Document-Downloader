const {
  setDownloadingDirPathToConfigFile,
} = require("../src/helpers/fs-service");
const path = require("path");

if (!process.argv[2]) {
  console.error(
    "Error: No path provided. Please specify a valid directory path."
  );
  process.exit(1);
}

const absPath = process.argv[2];
setDownloadingDirPathToConfigFile(path.join(absPath, "TDD"));
