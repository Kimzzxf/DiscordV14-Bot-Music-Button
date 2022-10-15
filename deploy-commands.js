const { REST } = require('@discordjs/rest'); 
const { Routes } = require('discord.js');
const fs = require('fs');
const {token, clientID} =  require('./config.json'); 

exports.DeployCommands = async () => { 
    /*
    ! Do not edit or delete this part if you do not know what you are doing
    ~ If there is a problem, you can contact me at Discord: Devloli#8883 or at this link:
    * Direct Message: https://discord.com/users/800422993897586718
    * Server: https://discord.gg/2Z8Z7Z4
    */

    const commands = [];  
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); 
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }


    const rest = new REST({ version: '10' }).setToken(token); 
    
    console.log('[DEPLOY] Deploying commands...'.yellow);
    (async () => {
        try {
            console.log('[DEPLOY] Started refreshing application (/) commands.'.blue);
            await rest.put(
                Routes.applicationCommands(clientID),
                { body: commands },
            );
            console.log('[DEPLOY] Successfully reloaded application (/) commands.'.green);
        } catch (error) {
            console.error(`[DEPLOY] Error while refreshing application (/) commands: ${error}`.red);
        }
    })();
}