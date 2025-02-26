const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const env = require("../common/env");
const SESSION_KEY_PATH = path.join(__dirname, "../", "config/", "session.key");
const MESSAGE_DEPTH_CONFIG_PATH = path.join(
  __dirname,
  "../config/message-depth-config"
);
const DOWNLOAD_DIR_CONFIG_PATH = path.join(
  __dirname,
  "../config/downloading-dir-path"
);

const outputTelegramSessionToFile = (stringSession) => {
  try {
    fs.writeFileSync(SESSION_KEY_PATH, stringSession.trim(), {
      mode: 0o600,
    });
    logger.info(`String session was outputted to external file `);
  } catch (error) {
    logger.error("Failed to save Telegram session:", error);
    throw error;
  }
};

const getTelegramSession = () => {
  let stringSession;
  try {
    stringSession = fs.readFileSync(SESSION_KEY_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      //if first run and file not exist
      stringSession = env.NO_VALID_SESSION;
    } else {
      throw error;
    }
  }
  return stringSession;
};
const setNoValidSession = () => {
  try {
    fs.writeFileSync(SESSION_KEY_PATH, env.NO_VALID_SESSION, {
      mode: 0o600,
    });
    logger.info(`NO_VALID_SESSION state was outputted to external file`);
  } catch (error) {
    logger.error("Failed to save Telegram session:", error);
    throw error;
  }
};

const ensureMediaDirectoryExist = () => {
  fs.mkdirSync(env.PATH_TO_DOWNLOADED_MEDIA_DIR, {
    recursive: true,
  });
};

const writeDownlodedMediaToFile = async (mediaBuffer, fileName) => {
  ensureMediaDirectoryExist();

  fs.writeFileSync(
    path.join(env.PATH_TO_DOWNLOADED_MEDIA_DIR, fileName),
    mediaBuffer,
    (error) => {
      if (error) {
        logger.error("Failed to write downloaded media to file.\n", { error });
        throw error;
      }
    }
  );
  console.log(
    `File was donwloaded to : \n ${env.PATH_TO_DOWNLOADED_MEDIA_DIR}`
  );
};

const ensureNoSessionKey = () => {
  if (fs.existsSync(SESSION_KEY_PATH)) {
    fs.unlinkSync(SESSION_KEY_PATH);
  }
};

const setDepthToConfigFile = (depth) => {
  fs.writeFileSync(MESSAGE_DEPTH_CONFIG_PATH, depth);
  logger.info(`download depth was set to ${depth}`);
};

const setDownloadingDirPathToConfigFile = (path) => {
  fs.writeFileSync(DOWNLOAD_DIR_CONFIG_PATH, path);
  logger.info(`downloaded files directory was set to ${path}`);
};

module.exports = {
  outputTelegramSessionToFile,
  getTelegramSession,
  setNoValidSession,
  writeDownlodedMediaToFile,
  ensureNoSessionKey,
  setDepthToConfigFile,
  setDownloadingDirPathToConfigFile,
};
