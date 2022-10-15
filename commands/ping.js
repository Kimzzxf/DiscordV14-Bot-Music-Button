const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction, client) {
        await interaction.reply({ content: 'Checking ping...', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(`📶 Latency is ${Date.now() - interaction.createdTimestamp}ms\n💓 API Latency is ${Math.round(client.ws.ping)}ms`)
            .setColor('#6104b9')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
}