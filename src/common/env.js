require("dotenv").config();
const fs = require("fs");
const path = require("path");
const logger = require("../helpers/logger");

const MANDATORY_ENV_VARS = ["API_ID", "API_HASH"];
const MESSAGE_DEPTH_CONFIG_PATH = path.join(
  __dirname,
  "../config/message-depth-config"
);

function validateMandatoryEnvVariables() {
  const missingFields = MANDATORY_ENV_VARS.filter((mandatoryEnv) => {
    return !process.env[mandatoryEnv];
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Failed to init. \nMissing mandatory environment variables: ${missingFields.toString()}`
    );
  }
}

function initEnvVariable() {
  const env = {};
  env.API_ID = process.env.API_ID;
  env.API_HASH = process.env.API_HASH;
  env.TELEGRAM_USER_PHONE_NUMBER = process.env.TELEGRAM_USER_PHONE_NUMBER;
  env.NO_VALID_SESSION = "";

  env.MESSAGES_DOWNLOAD_DEPTH =
    fs.readFileSync(MESSAGE_DEPTH_CONFIG_PATH, "utf8") || 1;
  env.INVALID_TELEGRAM_SESSION_CODES = [
    "AUTH_KEY_UNREGISTERED",
    "AUTH_KEY_INVALID",
    "SESSION_EXPIRED",
    "SESSION_REVOKED",
  ];
  env.PATH_TO_DOWNLOADED_MEDIA_DIR =
    process.env.PATH_TO_DOWNLOADED_MEDIA_DIR ||
    path.join(__dirname, "../../Downloaded-Media");

  return env;
}

validateMandatoryEnvVariables();
const env = initEnvVariable();

module.exports = env;
