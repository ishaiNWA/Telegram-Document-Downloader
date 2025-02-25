const { setDepthToConfigFile } = require("../src/helpers/fs-service");
const logger = require("../src/helpers/logger");

let downloadDepth = process.argv[2];
try {
  downloadDepth = parseMessageDepth(downloadDepth);
} catch (error) {
  logger.error(`"${downloadDepth}" ,is not a valid download depth number.\n
    The download depth should be a positive integer, or "all" for dowloadong all messages.`);
  process.exit(1);
}

setDepthToConfigFile(downloadDepth);

function parseMessageDepth(input) {
  if (input === "all") {
    return String(Number.MAX_SAFE_INTEGER);
  }

  // Check if it's a string that contains only digits
  if (!/^\d+$/.test(input)) {
    throw new Error();
  }

  const depth = parseInt(input);

  if (!isNaN(depth) && Number.isInteger(depth) && depth > 0) {
    return input;
  } else {
    throw new Error();
  }
}
