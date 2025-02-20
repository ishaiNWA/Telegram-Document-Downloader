const winston = require("winston");
const path = require("path");
const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      //output console for development
      format: combine(
        errors({ stack: true }),
        timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs", "logs.log"),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs", "app-error.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
