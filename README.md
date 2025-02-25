# Telegram Document Downloader (TDD)

A Node.js application that enables users to automatically download files from Telegram's "Saved Messages" chat to their local file system using phone number authentication.

## Current Features

- Automatic document download from recent "Saved Messages" chat

  - Support for downloading multiple documents sent as an album/group in a single message

- User configuration options:

  - Adjustable message history depth for downloads

- Secure authentication using Telegram phone number
- Persistent session management
- validate session phone number matches config phone number

- User configuration options:

  - Connect new user/ Customizable phone number setup

- Intelligent file naming system with:
  - Unique identifier (UID)
  - Date stamp
  - Sequential counter for duplicate file names

## Setup Instructions

### Telegram API Credentials (on first installation)

1. Visit https://my.telegram.org/auth and log in with your phone number (in international format)
2. Go to "API development tools"
3. Create a new application (or use an existing one)
4. Copy your "App api_id" and "App api_hash"
5. Create a file named `.env` in the root directory of this project with the following content:
   TELEGRAM_API_ID=your_api_id_here
   TELEGRAM_API_HASH=your_api_hash_here

### setting your Telegram user phone number

- The program requires authentication with a Telegram account to download documents.
  To authenticate with a new phone number (in international format), use:

  - npm run new-user +12223334455

- for entering a new phone numer you should use the command:
  npm run new-user +12223334455

- After successful authentication, your session will be saved locally.
  You won't need to re-authenticate unless the session expires or you want to use a different Telegram account.

- Note: If multiple users share the same machine, each will need to authenticate their own account when they use the program and therefore will have to run the "new-user" command each time they switch users.

- Note: If a phone number has not been set prior to first running the program, you will be prompted to enter your phone number during execution.

### Running the program when phone number is set

- In case a phone number is already set, you can simply run the program by using:
  - npm run download-documents

This will connect to the last user session automatically.

### Telegram web login code

- During each new user authentication attempt, Telegram will send a verification code to your device.

-When prompted by the program, enter this code to complete the authentication process.

-This security measure ensures that only authorized users can access their Telegram accounts through the application.

### Set Documents Downloading Depth

- You can control how far back in the chat history the program searches for documents to download.

- Set the number of recent messages to scan using:

  - npm run set-depth 100

- For unlimited history scanning, use:

  - npm run set-depth all

- If not specified, the default message depth is 1 (only the most recent message).
