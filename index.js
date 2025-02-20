const logger = require("./src/helpers/logger");
const {
  initTelegramClient,
  downloadFiles,
} = require("./src/clients/telegram-client");

const initTelegramDocumentDownloader = async () => {
  await initTelegramClient();
};

initTelegramDocumentDownloader()
  .then(async () => {
    logger.info("successful initiation of Telegram-Document-Downloader.");
    await downloadFiles();
    console.log("THE END!");
  })
  .catch((error) => {
    logger.error(
      "Initiation of Telegram-Document-Downloader was failed. ",
      error
    );
    process.exit(1); // TODO : gracefull shutdown for telegram- client
  });
