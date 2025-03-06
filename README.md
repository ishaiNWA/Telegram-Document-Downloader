# Telegram Document Downloader

A Node.js application that enables users to automatically download files from Telegram's "Saved Messages" chat to their local file system using phone number authentication.

## Current Features

- Support for downloading multiple documents sent as an album/group in a single message

- Adjustable message history depth for downloads

- Secure authentication using the Telegram-user phone number

## Setup Instructions

### 1. Telegram API Credentials (on first installation)

1. Visit https://my.telegram.org/auth and log in with your phone number (in international format)
2. Go to "API development tools"
3. Create a new application (or use an existing one)
4. Copy your "App api_id" and "App api_hash"
5. Create a file named `.env` in the root directory of this project with your credentials:
   (See [example configuration](https://github.com/ishaiNWA/Telegram-Document-Downloader/blob/main/example.env))

> **Note:** In order to download documents from Telegram, you must authenticate with a valid Telegram account.

### 2. First-time Authentication(and first program run)

- Authenticate with a new phone number (in international format), use:

`npm run new-user +12223334455`

- During authentication, Telegram will send a verification code to your device. When prompted by the program, enter this code to complete the authentication process.

- After successful authentication, your session will be saved locally.
  You won't need to re-authenticate unless the session expires or you want to use a different Telegram account.

### 3. Running After Authentication

If a phone number is already set, simply run:

`npm run download-documents`

This will connect to the last user session automatically.

> **Note for shared computers:** If multiple users share the same machine, each will need to authenticate their own account when they use the program by running the "new-user" command each time they switch users.

> **Note:** If a phone number has not been set prior to first running the program, you will be prompted to enter your phone number during execution.

### 4. Setting Download Depth

- Control how far back in chat history the program searches for documents:

- Set the number of recent messages to scan using:

`npm run set-depth 100` # Scan the 100 most recent messages

- Or for unlimited history scanning: # Scan all messages

`npm run set-depth all`

> **Default:** If not specified, the default message depth is 1 (only the most recent message).

### 5. Setting Download Directory

- Specify where documents will be downloaded:

`npm run set-download-directory /absolute/path`

- The program will create a directory named "downloaded-media" at the specified location to store all downloaded files.

> **Default:** If no directory is configured, a "downloaded-media" folder will be created in the program's root directory by default.
