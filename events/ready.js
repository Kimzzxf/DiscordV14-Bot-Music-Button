const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[EVENT] Logged in as ${client.user.tag}`.magenta);

        client.user.setPresence({
            activities: [
                { 
                    name: 'Made by Devloli#8883',
                    type: ActivityType.Watching 
                }
            ],
            status: 'idle'
        });
    }
}