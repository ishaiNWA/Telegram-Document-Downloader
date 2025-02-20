const { ensureNoSessionKey } = require("../src/helpers/fs-service");
const { isValidPhoneNumber } = require("libphonenumber-js");
const { spawn } = require("child_process");
const logger = require("../src/helpers/logger");

ensureNoSessionKey();

let phoneNumber;
try {
  phoneNumber = process.argv[2];
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error("not a valid phone number");
  }
} catch (error) {
  logger.error("error validating phone number input", error);
  process.exitCode = 1;
  process.exit();
}

process.env.TELEGRAM_USER_PHONE_NUMBER = phoneNumber;

logger.info("new phone number was placed");

spawn("node", ["./index.js"], {
  env: { ...process.env },
  stdio: "inherit",
});
