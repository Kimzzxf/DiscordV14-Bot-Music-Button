const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client ) { 
        if (!interaction.isButton()) return;
        const guildID = interaction.guildId;

        const button = interaction.customId;
        if (!button) return;

        const queue = client.distube.getQueue(guildID);

        if (button === 'play') {
            const playModal = new ModalBuilder()
			.setCustomId('playModal')
			.setTitle('Play')

            // & Modal Guide: https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals

		    const playInput = new TextInputBuilder()
		    	.setCustomId('playInput')
		    	.setLabel("Enter a YouTube URL or Music Name")
		    	.setStyle(TextInputStyle.Short) // & TextInputStyle Guide: https://discordjs.guide/interactions/modals.html#input-styles
                .setRequired(true);

		    const playActionRow = new ActionRowBuilder().addComponents(playInput);

		    playModal.addComponents(playActionRow);

		    await interaction.showModal(playModal);
        } else if (button === 'pause') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            if (queue.songs[0].user.id !== interaction.user.id) return interaction.reply({ content: '⚠️ You are not the one who started the music!', ephemeral: true });

            if (queue.paused) {
                client.distube.resume(guildID);
                await interaction.reply({ content: '▶️ Resumed the music!', ephemeral: true });
            } else {
                client.distube.pause(guildID);
                await interaction.reply({ content: '⏸️ Paused the music!', ephemeral: true });
            }
        } else if (button === 'next') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            if (queue.songs[0].user.id !== interaction.user.id) return interaction.reply({ content: '⚠️ You are not the one who started the music!', ephemeral: true });

            if (queue.songs.length === 1) return interaction.reply({ content: '⚠️ This is the last song!', ephemeral: true });

            client.distube.skip(guildID);

            const embed = new EmbedBuilder()
                .setTitle('⏭🎶 Skipped the song!')
                .setDescription(`**Playing:** ${queue.songs[0].name}\n**Duration:** ${queue.songs[0].formattedDuration}\n**Requested by:** ${queue.songs[0].user}`)
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (button === 'loop') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            if (queue.songs[0].user.id !== interaction.user.id) return interaction.reply({ content: '⚠️ You are not the one who started the music!', ephemeral: true });

            if (queue.repeatMode === 0) {
                client.distube.setRepeatMode(guildID, 1);
                await interaction.reply({ content: '🔁 Looping all songs in the queue!', ephemeral: true });
            } else if (queue.repeatMode === 1) {
                client.distube.setRepeatMode(guildID, 2);
                await interaction.reply({ content: '🔂 Switched to looping the current song!', ephemeral: true });
            } else {
                client.distube.setRepeatMode(guildID, 0);
                await interaction.reply({ content: '🔁 Disabled looping!', ephemeral: true });
            }
        } else if (button === 'stop') { 
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            if (queue.songs[0].user.id !== interaction.user.id) return interaction.reply({ content: '⚠️ You are not the one who started the music!', ephemeral: true });
            
            client.distube.stop(guildID);

            const reply = await interaction.channel.send({ content: '⏹️ Stopped the music!', ephemeral: true });
            setTimeout(() => reply.delete(), 5000);
        } else if (button === 'queue') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            const queueEmbed = new EmbedBuilder()
                .setTitle('🎶 Queue')
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: `Page 1 of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) })
                .setTimestamp();

            for (let i = 0; i < 5; i++) {
                if (!queue.songs[i]) break;
                queueEmbed.addFields({ name: `${i + 1}. ${queue.songs[i].name}`, value: `Duration: ${queue.songs[i].formattedDuration} | Requested by: ${queue.songs[i].user}` });
            }

            const queueRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('queuePrevious')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('queueNext')
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(queue.songs.length <= 5)
                );

            const queueMessage = await interaction.reply({ embeds: [queueEmbed], components: [queueRow], fetchReply: true });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            let page = 1;
            collector.on('collect', async (i) => {
                if (i.customId === 'queuePrevious') {
                    page--;
                    for (let i = (page - 1) * 5; i < page * 5; i++) {
                        if (!queue.songs[i]) break;
                        queueEmbed.spliceFields(i - (page - 1) * 5, 1, { name: `${i + 1}. ${queue.songs[i].name}`, value: `Duration: ${queue.songs[i].formattedDuration} | Requested by: ${queue.songs[i].user}` });
                    }

                    queueEmbed.setFooter({ text: `Page ${page} of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) });
                } else if (i.customId === 'queueNext') {
                    page++;
                    queueEmbed.setFields();
                    for (let i = (page - 1) * 5; i < page * 5; i++) {
                        if (!queue.songs[i]) break;
                        queueEmbed.addFields({ name: `${i + 1}. ${queue.songs[i].name}`, value: `Duration: ${queue.songs[i].formattedDuration} | Requested by: ${queue.songs[i].user}` });
                    }

                    queueEmbed.setFooter({ text: `Page ${page} of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) });
                }

                queueRow.components[0].setDisabled(page === 1);
                queueRow.components[1].setDisabled(page === Math.ceil(queue.songs.length / 5));

                await i.update({ embeds: [queueEmbed], components: [queueRow] });
            });

            collector.on('end', async () => {
                if (!queueMessage) return;
                await queueMessage.delete();
            });
        } else if (button === 'nowplaying') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('🎶 Now playing')
                .setDescription(`**${queue.songs[0].name}**\n**Duration:** ${queue.songs[0].formattedDuration}\n**Requested by:** ${queue.songs[0].user}`)
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (button === 'search') {
            const searchModal = new ModalBuilder()
            .setCustomId('searchModal')
            .setTitle('Search')

            const searchInput = new TextInputBuilder()
            	.setCustomId('searchInput')
            	.setLabel("Enter a Music Name to search")
            	.setStyle(TextInputStyle.Short)
                .setRequired(true);

            const searchActionRow = new ActionRowBuilder().addComponents(searchInput);

            searchModal.addComponents(searchActionRow);

            await interaction.showModal(searchModal);
        }
    }
}