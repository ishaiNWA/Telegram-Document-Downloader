const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const {
  outputTelegramSessionToFile,
  getTelegramSession,
  setNoValidSession,
  writeDownlodedMediaToFile,
} = require("./utils/fs-service");
const prompts = require("prompts");

const env = require("./config/env-config");
const logger = require("./config/logger-config");
const { TimedOutError } = require("telegram/errors");

/*****************************************************************************/

let apiId;
let apiHash;
let stringSession;
let telegramClient;
const CONNECTION_WAITING_TIME = 5000;
/*****************************************************************************/

const configureTelegramClient = () => {
  apiId = Number(env.API_ID);
  apiHash = env.API_HASH;
  stringSession = new StringSession(getTelegramSession());
  telegramClient = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    autoReconnect: true,
  });
};

/*****************************************************************************/

const connectWithNewSession = async () => {
  await telegramClient.start({
    phoneNumber: process.env.TELEGRAM_USER_PHONE_NUMBER, // TODO: take TELEGRAM_USER_PHONE_NUMBER from user when running code
    // and validate coorect format
    phoneCode: async () => {
      const input = await prompts({
        type: "text",
        name: "code",
        message: "For connecting to your Telegram user enter the code sent",
      });
      return input.code;
    },
    onError: (error) => {
      logger.error("connectWithNewSession function failed");
      throw error;
    },
  });
  logger.info(
    "Telegram-client connection was made with a new string session",
    stringSession
  );
  outputTelegramSessionToFile(stringSession.save());
};

/*****************************************************************************/

const connectWithExistingSession = async () => {
  try {
    console.log("connectWithExistingSession!!!!!!!!");
    //await telegramClient.connect();
    let timoutId;
    const connectionPromise = telegramClient.connect();
    const connectionTimeout = new Promise((_, reject) => {
      timoutId = setTimeout(() => {
        reject(
          new TimedOutError(
            "Time out for connection attemp with existing string session."
          )
        );
      }, CONNECTION_WAITING_TIME);
    });

    await Promise.race([connectionPromise, connectionTimeout]);

    connectionPromise.finally(() => {
      clearTimeout(timoutId);
    });
    6;
    logger.info(
      "Telegram-client connection was made via an existing session \n",
      stringSession
    );
  } catch (error) {
    logger.error(
      "Existing session string is invalid. Attempting to establish a new connection with phone verification.",
      error
    );
    setNoValidSession();
    await initTelegramClient();
  }
};

/*****************************************************************************/

const connectTelegramClient = async () => {
  console.log(
    "getTelegramSession() != env.NO_VALID_SESSION? : ",
    getTelegramSession() != env.NO_VALID_SESSION
  );

  if (getTelegramSession() != env.NO_VALID_SESSION) {
    await connectWithExistingSession();
  } else {
    await connectWithNewSession();
  }
};

/*****************************************************************************/

const initTelegramClient = async () => {
  configureTelegramClient();
  await connectTelegramClient();
};

/*****************************************************************************/

// const downloadFiles = async () => {
//   console.log("Welcome to downloaded Files function!!");
//   let msg;
//   try {
//     msg = await telegramClient.getMessages("me", { limit: 0 });
//   } catch (error) {
//     let invalidSessionArray;
//     invalidSessionArray = env.INVALID_TELEGRAM_SESSION_CODES.filter(
//       (invalidSessionCode) => {
//         return error.code === invalidSessionCode;
//       }
//     );
//     if (invalidSessionArray.length > 0) {
//       logger.error(
//         `function ${"..."} has failed due to ${
//           error.code
//         }.\nMaking attemp to reconnect with a new session`
//       );

//       shutDown();
//       setNoValidSession();
//       initTelegramClient();
//     } else {
//       logger.error(`function ${"..."} has failed due to ${error.code}.`);
//       throw error;
//     }
//   }

//   console.log(msg.total);
//   console.log(msg.message);
// };

/*****************************************************************************/

const telegramErrorHandler = (func, funcName) => {
  return async function () {
    const funcRes = await func().catch((error) => {
      let invalidSessionArray;
      invalidSessionArray = env.INVALID_TELEGRAM_SESSION_CODES.filter(
        (invalidSessionCode) => {
          return error.code === invalidSessionCode;
        }
      );
      if (invalidSessionArray.length > 0) {
        logger.error(
          `function ${funcName} has failed due to ${error.code}.\nMaking attemp to reconnect with a new session`
        );
        shutDown();
        setNoValidSession();
        initTelegramClient();
      } else {
        logger.error(`function ${funcName} has failed due to ${error.code}.`);
        throw error;
      }
    });

    if (funcRes) {
      return funcRes;
    } else {
      return null;
    }
  };
};

/*****************************************************************************/

const getFileName = (mediaObj) => {
  if (mediaObj.document && mediaObj.document.attributes) {
    return mediaObj.document.attributes[0].fileName;
  }
  return null;
};

/*****************************************************************************/
const downloadFiles = telegramErrorHandler(async () => {
  console.log("Welcome to downloaded Files function!!");
  let msg;
  msg = await telegramClient.getMessages("me", { limit: 1 });

  const mediaObj = msg[0].media;
  if (mediaObj) {
    const mediaBuffer = await telegramClient.downloadMedia(mediaObj, {
      workers: 1,
    });

    await writeDownlodedMediaToFile(mediaBuffer, getFileName(mediaObj));
    await shutDown();
  }
}, "downloadFiles");
/*****************************************************************************/

const shutDown = async () => {
  try {
    await telegramClient.disconnect();

    logger.info("Telegram Client has disconnected", {
      "client-session": stringSession,
    });

    // Using process.exit(0) because Telegram client maintains a background ping promise
    // that runs every minute to keep the connection alive. Even after disconnect(),
    // this promise prevents the Node process from naturally terminating.
    // Exit code 0 indicates successful completion of the program.
    process.exit(0);
  } catch (error) {
    logger.error("Error while disconnecting the Telegram Client", { error });
    throw error;
  }
};

/*****************************************************************************/

module.exports = { initTelegramClient, downloadFiles };
