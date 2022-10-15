const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message, client) {
        if (message.author.bot) return;

        const guildID = message.guild.id;
        if (!fs.existsSync(`./data/${guildID}.json`)) return; 
        const data = require(`../data/${guildID}.json`);
        const controlChannel = message.guild.channels.cache.get(data.controler);

        if (!message.channel.id === controlChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Warning')
            .setDescription('You can\'t send messages in this channel!\nPlease use the buttons below to control the bot.')
            .setColor('#6104b9')
            .addFields({ name: '📌 Important', value: 'The bot will delete your message after 3 seconds.' })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        const reply = await message.reply({ embeds: [embed] });
        setTimeout(() => {
            reply.delete();
            message.delete();
        }, 3000);
    }
}