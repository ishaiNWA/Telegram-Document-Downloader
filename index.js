const logger = require("./src/helpers/logger");
const telegramClient = require("./src/clients/telegram-client");

telegramClient
  .initTelegramClient()
  .then(() => {
    logger.info("successful initiation of Telegram-Document-Downloader.");
    return telegramClient.downloadFiles();
  })
  .then((documentsCount) => {
    logger.info(`${documentsCount} files were successfully downloaded`);
  })
  .then(() => telegramClient.shutDown())
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
