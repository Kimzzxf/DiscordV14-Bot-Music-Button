const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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
            await interaction.reply({ content: '⏹️ Stopped the music!', ephemeral: true });
        } else if (button === 'queue') {
            if (!queue) return interaction.reply({ content: '⚠️ There is nothing playing!', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('🎶 Queue')
                .setDescription(`**Now playing:** ${queue.songs[0].name}\n**Duration:** ${queue.songs[0].formattedDuration}\n**Requested by:** ${queue.songs[0].user}`)
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) })
                .setTimestamp();

            for (let i = 1; i < queue.songs.length; i++) {
                embed.addFields({ name: `**${i}.** ${queue.songs[i].name}`, value: `**Duration:** ${queue.songs[i].formattedDuration}\n**Requested by:** ${queue.songs[i].user.tag}` });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
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

            const limitInput = new TextInputBuilder()
                .setCustomId('limitInput')
                .setLabel("Enter the number of results to display")
                .setPlaceholder("Max 10")
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(2)
                .setRequired(true);

            const searchActionRow = new ActionRowBuilder().addComponents(searchInput);
            const limitActionRow = new ActionRowBuilder().addComponents(limitInput);

            searchModal.addComponents(searchActionRow, limitActionRow);

            await interaction.showModal(searchModal);
        }
    }
}