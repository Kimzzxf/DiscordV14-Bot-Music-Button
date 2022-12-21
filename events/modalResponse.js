const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { YouTubeAPI } = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'playModal') {
            const musicNameOrLink = interaction.fields.getTextInputValue('playInput');

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });

            const permissions = voiceChannel.permissionsFor(interaction.client.user);

            if (!permissions.has(PermissionFlagsBits.ViewChannel)) return interaction.reply({ content: 'I cannot connect to your voice channel, make sure I have the proper permissions!', ephemeral: true });
            if (!permissions.has(PermissionFlagsBits.Connect)) return interaction.reply({ content: 'I cannot connect to your voice channel, make sure I have the proper permissions!', ephemeral: true });
            if (!permissions.has(PermissionFlagsBits.Speak)) return interaction.reply({ content: 'I cannot connect to your voice channel, make sure I have the proper permissions!', ephemeral: true });

            await interaction.deferReply({ ephemeral: true });

            if (musicNameOrLink.includes('https://' || 'http://')) {
                if (!musicNameOrLink.includes('youtube.com' || 'youtu.be')) {
                    return interaction.followUp({ content: 'This is not a valid YouTube link!', ephemeral: true });
                } else {
                    try {
                        await client.distube.play(voiceChannel, musicNameOrLink, { member: interaction.member });
                    } catch (err) {
                        if (err) return interaction.editReply({ content: 'This is not a valid YouTube link!', ephemeral: true });
                    }
                }
            } else {
                await client.distube.play(voiceChannel, musicNameOrLink, { member: interaction.member });
            }

            const queue = await client.distube.getQueue(interaction.guildId);
            const lastSong = queue.songs[queue.songs.length - 1];

            const musicEmbed = new EmbedBuilder()
                .setURL(lastSong.url)
                .setDescription(`**Name:** ${lastSong.name}`)
                .setColor('#6104b9')
                .addFields(
                    { name: '👤 Uploader', value: `[${lastSong.uploader.name}](${lastSong.uploader.url})`, inline: true },
                    { name: '👁‍🗨 Views', value: `${lastSong.views}`, inline: true },
                    { name: '⏱️ Duration', value: `${lastSong.formattedDuration}`, inline: true },
                    { name: '👍 Likes', value: `${lastSong.likes}`, inline: true },
                    { name: '👎 Dislikes', value: `${lastSong.dislikes}`, inline: true },
                    { name: '🔴 Live', value: `${lastSong.isLive ? 'Yes' : 'No'}`, inline: true }
                )
                .setImage(lastSong.thumbnail)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            if (!queue) {
                musicEmbed.setTitle('🎵 Playing');
            } else {
                musicEmbed.setTitle('🎵 Added to Queue');
            }

            await interaction.editReply({ embeds: [musicEmbed] });
        } else if (interaction.customId === 'searchModal') {
            const searchName = interaction.fields.getTextInputValue('searchInput');
            
            const search = await client.distube.search(searchName, { limit: 10, type: 'video' });

            const nameReplace = searchName.replace(/ /g, '+');

            const embed = new EmbedBuilder()
                .setTitle('🔍 Youtube Search')
                .setURL(`https://www.youtube.com/results?search_query=${nameReplace}`)
                .setDescription(`**Name:** ${searchName}`)
                .setColor('#6104b9')
                .setImage(search[0].thumbnail)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setTimestamp();
                
            for (let i = 0; i < search.length; i++) {
                embed.addFields({ name: `${i + 1}. ${search[i].name}`, value: `**Channel:** ${search[i].uploader.name}\n**Link:** ${search[i].url}` });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}