const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { DeployCommands } = require('./deploy-commands');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
] });
const fs = require('fs');
require('colors');
const { DisTube } = require('distube');

client.distube = new DisTube(client, {
    emitNewSongOnly: false,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    savePreviousSongs: false,
    emitAddSongWhenCreatingQueue: false,
    searchSongs: 0,
    nsfw: false,
    emptyCooldown: 25
});

(async () => {
    await DeployCommands();

    // Handle all events
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); 
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    // Handle all commands
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    let commandNameLength = 0;
    for (const command of client.commands) {
        if (command[0].length > commandNameLength) {
            commandNameLength = command[0].length;
        }
    }

    for (const command of client.commands) {
        console.log(`[COMMAND] ${command[0].padEnd(commandNameLength)} | ${'Loaded!'.green}`.gray); 
    }

    if (!fs.existsSync('./errors')) {
        fs.mkdirSync('./errors');
    }

    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }
 
    client.login(token); // Login to Discord
})();