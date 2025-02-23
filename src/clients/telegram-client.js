const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const {
  outputTelegramSessionToFile,
  getTelegramSession,
  setNoValidSession,
  writeDownlodedMediaToFile,
} = require("../helpers/fs-service");
const prompts = require("prompts");

const env = require("../common/env");
const logger = require("../helpers/logger");
const { TimedOutError } = require("telegram/errors");
const { isUserAuthorized } = require("telegram/client/users");

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
    phoneNumber:
      env.TELEGRAM_USER_PHONE_NUMBER ||
      (async () => {
        logger.warn(
          "No phone number found in environment variables, requesting manual input"
        );
        const input = await prompts({
          type: "text",
          name: "phone",
          message: "Please enter your Telegram user phone number ",
        });
        return input.phone;
      }),
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

    if (!(await isUserAuthorized(telegramClient))) {
      throw new Error("Session exists but is not authorized");
    }

    const currentUser = await telegramClient.getMe();
    console.log("Current user data:", currentUser); // Debug log
    console.log("phone num: ", currentUser.phone);

    // TODO :: i think reduntent  now , because from now a new user settings will always cause session deletion.
    // so i can remove this.

    // const sessionPhoneNumber = await telegramClient.getMe().phone;
    // console.log(`sessionPhoneNumber is: ${sessionPhoneNumber}`);
    // if (env.TELEGRAM_USER_PHONE_NUMBER !== sessionPhoneNumber) {
    //   throw new Error(
    //     `Phone number mismatch: Expected ${env.TELEGRAM_USER_PHONE_NUMBER}, ` +
    //       `but session belongs to ${sessionPhoneNumber}`
    //   );
    // }

    logger.info(
      "Telegram-client connection was made via an existing session \n"
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

const getFileName = (() => {
  let counter = 1;

  const getCount = () => {
    let currCount = counter;
    counter++;
    return currCount;
  };

  return (mediaObj) => {
    const date = new Date();
    const timestamp = date
      .toISOString()
      .replace(/[:.]/g, "-") // Replace colons and dots with dashes
      .replace("T", "_") // Replace T with underscore
      .slice(0, -5); // Remove milliseconds and Z

    if (mediaObj.className === "MessageMediaPhoto") {
      return timestamp + "_" + getCount() + ".jpg";
    }
    if (mediaObj.document && mediaObj.document.attributes) {
      return timestamp + "_" + mediaObj.document.attributes[0].fileName;
    }
    return null;
  };
})();

/*****************************************************************************/
const downloadFiles = telegramErrorHandler(async () => {
  const downloadAndSaveMedia = async (mediaObj) => {
    const mediaBuffer = await telegramClient.downloadMedia(mediaObj, {
      workers: 1,
    });
    await writeDownlodedMediaToFile(mediaBuffer, getFileName(mediaObj));
  };

  let msg;
  msg = await telegramClient.getMessages("me", { limit: 1 });

  // case many documents in a message
  if (msg[0].groupedId) {
    let groupedId = msg[0].groupedId;
    let groupedMessages = await telegramClient.getMessages("me", {
      groupedId: groupedId,
    });

    // Despite specifying groupedId in getMessages(), the API returns messages
    // that aren't part of the group. Filter to keep only messages that share
    // the same groupId value
    let validGroupMessages = groupedMessages.filter(
      (msg) => msg.groupedId?.value === groupedId.value
    );

    await Promise.all(
      validGroupMessages.map(async (msg) => {
        if (msg.media) {
          await downloadAndSaveMedia(msg.media);
        }
      })
    );
  } else if (msg[0].media) {
    await downloadAndSaveMedia(msg[0].media);
  } else {
    logger.info("There are no documents to download from inspected messages.");
  }
  await shutDown();
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
