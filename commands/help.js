const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all commands'),

    async execute(interaction, client) {
        const fs = require('fs');
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        const embed = new EmbedBuilder()
            .setTitle('🤖 Commands')
            .setDescription('All commands of this bot')
            .setColor('#6104b9')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        for (const file of commandFiles) {
            const command = require(`./${file}`);
            embed.addFields({ name: `/${command.data.name}`, value: `${command.data.description}` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}