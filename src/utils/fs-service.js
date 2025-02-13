const fs = require("fs");
const path = require("path");
const logger = require("../config/logger-config");
const env = require("../config/env-config");

const outputTelegramSessionToFile = (stringSession) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, "../", "config/", "session.key"),
      stringSession.trim(),
      {
        mode: 0o600,
      }
    );
    logger.info(
      `String session was outputted to external file ${path.join(
        __dirname,
        "../",
        "config/",
        "session.key"
      )}`
    );
  } catch (error) {
    logger.error("Failed to save Telegram session:", error);
    throw error;
  }
};

const getTelegramSession = () => {
  let stringSession;
  try {
    stringSession = fs.readFileSync(
      path.join(__dirname, "../", "config/", "session.key"),
      "utf8"
    );
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
    fs.writeFileSync(
      path.join(__dirname, "../", "config/", "session.key"),
      env.NO_VALID_SESSION,
      {
        mode: 0o600,
      }
    );
    logger.info(
      `NO_VALID_SESSION state was outputted to external file ${path.join(
        __dirname,
        "../",
        "config/",
        "session.key"
      )}`
    );
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
  console.log(`path is: \n ${env.PATH_TO_DOWNLOADED_MEDIA_DIR}`);
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
};

module.exports = {
  outputTelegramSessionToFile,
  getTelegramSession,
  setNoValidSession,
  writeDownlodedMediaToFile,
};
