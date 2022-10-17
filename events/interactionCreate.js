const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            const date = new Date();

            const datestring = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`; 

            const filename = `error-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.txt`;

            console.error(`[ERROR] [${datestring}] ${interaction.commandName}: ${error.stack}`.red);

            if (!fs.existsSync('./errors')) {
                fs.mkdirSync('./errors', { recursive: true }, (err) => {
                    if (err) return console.error(`[ERROR] cannot create folder errors: ${err.stack}`.red); 

                    fs.writeFileSync(`./errors/${filename}`, `[ERROR] [${datestring}] ${interaction.commandName}: ${error.stack}`, (err) => { 

                        if (err) return console.error(`[ERROR] cannot create file ${filename}: ${err.stack}`.red);
                    });
                });
            } else {
                fs.writeFileSync(`./errors/${filename}`, `[ERROR] [${datestring}] ${interaction.commandName}: ${error.stack}`, (err) => { 

                    if (err) return console.error(`[ERROR] cannot create file ${filename}: ${err.stack}`.red);
                });
            }

            const { ownerID } = require('../config.json'); 

            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error has occurred, please contact the bot owner.')
                .setColor('#FF0000')
                .addFields(
                    { name: '📝 Command', value: `/${interaction.commandName}`, inline: true },
                    { name: '👤 User', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '📌 Contact', value: `<@${ownerID}>\nPlease contact the bot owner for more information.\nError Log: \`${filename}\``, inline: false }
                )
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true }); 
        }
    }
}