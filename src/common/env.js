require("dotenv").config();
const path = require("path");
const logger = require("../helpers/logger");

const MANDATORY_ENV_VARS = ["API_ID", "API_HASH"];

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
  env.DOWNLOADED_MESSAGES_DEPTH = process.env.DOWNLOADED_MESSAGES_DEPTH || 1;
  env.NO_VALID_SESSION = "";
  env.INVALID_TELEGRAM_SESSION_CODES = [
    "AUTH_KEY_UNREGISTERED",
    "AUTH_KEY_INVALID",
    "SESSION_EXPIRED",
    "SESSION_REVOKED",
  ];
  env.PATH_TO_DOWNLOADED_MEDIA_DIR =
    process.env.PATH_TO_DOWNLOADED_MEDIA_DIR ||
    path.join(__dirname, "../../Downloaded-Media");

  logger.info("env variable has been successfully initiated.");
  return env;
}

validateMandatoryEnvVariables();
const env = initEnvVariable();

module.exports = env;
