# Music Bot Template (Discord.js v14)

This is a template for a Music Discord bot with buttons, modal, and slash commands.

## Contact
<div id="Discord-m" align="center">
  <a href="https://discordapp.com/users/800422993897586718" target="_blank">
    <img src="https://discord.c99.nl/widget/theme-4/800422993897586718.png">
  </a>
</div>
<div id="Discord-s" align="center">
  <a href="https://discordapp.com/users/800422993897586718" target="_blank">
    <img src="https://img.shields.io/badge/Discord-red?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Badge"/>
  </a>
</div>

## Images

<div align="center">
    <img src="https://github.com/devloli-main/Button-MusicBot-Template-Discord.jsv14/blob/main/images/Controler.png?raw=true" alt="Image 1" width="400" />
    <img src="https://github.com/devloli-main/Button-MusicBot-Template-Discord.jsv14/blob/main/images/TextInput.png?raw=true" alt="Image 2" width="400" />
</div>

## Features

-   [x] Buttons - Play, Pause, Next, Loop, Stop, Queue, Now Playing and Search.
-   [x] Modal - Play and Search. (Modal text input you can input a song name or a link to play)
-   [x] Slash commands - The Template has 3 slash commands: ping, help and setup. (setup the music channel)
-   [x] Error handling - The bot will send you a message if there is an error and it will also save the error in the error folder.
-   [x] Command handler - The bot will automatically load all commands in the commands folder.
-   [x] Event handler - The bot will automatically load all events in the events folder.
-   [x] Deploy commands - The bot will automatically deploy all commands in the commands folder.

## Requirements

-   [Node.js](https://nodejs.org/en/) v16.6.0 or newer

## Installation Packages

```bash
npm init or npm init -y (if you folder name not a space or special character)
npm i discord.js
npm i @discordjs/rest
npm i @discordjs/opus
npm i colors
npm i distube
npm i youtube-search
npm i libsodium-wrappers
```

## How to use

0.  [Visual Code Plugin](https://marketplace.visualstudio.com/items?itemName=ParthR2031.colorful-comments)
1.  Download the template. [Download](https://github.com/devloli-main/Button-MusicBot-Template-Discord.jsv14/archive/refs/heads/main.zip)
2.  Create a new application in the [Discord Developer Portal](https://discord.com/developers/applications) click on `New Application` and give it a name.
3.  Go to the `Bot` tab and click `Add Bot`.
4.  Go to the `OAuth2 - General` tab and select the `in-app Authorization` in "Authorization Method".
5.  Select the `bot` scope and the `applications.commands` scope.
6.  Add the bot permissions "Administrator" in the `Bot Permissions` section.
7.  Go to the `OAuth2 - URL Generator` tab and click on `Bot`, `Applications.commands` and `Administrator` and copy the link.
8.  Open the link in a new tab and add the bot to your server.
9.  Go to the `Bot` tab and copy the token.
10. Go to the `General Information` tab and copy the application ID.
11. Go to the [YouTube Data API](https://console.developers.google.com/apis/library/youtube.googleapis.com) and get a YouTube API key.
12. Open the `config.json` file and paste the application ID, token, owner ID and YouTube API key.
13. Run `node index.js` or `node .` in the terminal.

## Config

```json
{
    "clientID": "APPICATION_ID",
    "token": "TOKEN",
    "ownerID": "OWNER_ID",
    "YouTubeAPI": "YOUTUBE_API_KEY"
}
```
-   `clientID` - Your application ID. [Go to Discord Developer Portal](https://discord.com/developers/applications)
-   `token` - Your bot token. [How to get a token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
-   `ownerID` - Your Discord ID. [How to get it?](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
-   `YouTubeAPI` - Your YouTube API key. [Get a YouTube data API key](https://developers.google.com/youtube/v3/getting-started)

## Exemple Slash commands 

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example command'),

    async execute(interaction) {
        await interaction.reply('Example command!');
    }
}
```
