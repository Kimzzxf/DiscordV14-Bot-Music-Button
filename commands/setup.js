const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup music bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR)
        .addIntegerOption(option => option
            .setName('voicechannel')
            .setDescription('Voice channel Amount (1-10)')
            .setRequired(true)),

    async execute(interaction, client) {
        const voiceChannelAmount = interaction.options.getInteger('voicechannel');
        const commandChannel = interaction.channel;

        if (voiceChannelAmount < 1 || voiceChannelAmount > 10) {
            await interaction.reply({ content: 'Please enter a number between 1-10', ephemeral: true });
            return;
        }

        if (!fs.existsSync(`./data/${interaction.guild.id}.json`)) {
            fs.writeFileSync(`./data/${interaction.guild.id}.json`, JSON.stringify({
                controler: "",
                category: "",
                voiceChannels: []
            }, null, 4));
            await interaction.reply({ content: '🔃 Setup started', ephemeral: true });
        } else {
            const channels = interaction.guild.channels.cache.map(channel => channel.id);
            const data = JSON.parse(fs.readFileSync(`./data/${interaction.guild.id}.json`));
            if (commandChannel.id === data.controler) {
                await interaction.reply({ content: '⚠️ Please use this command in a different channel!', ephemeral: true });
                return;
            }
            await interaction.reply({ content: '⚠️ Setup already exists, resetting...', ephemeral: true });
            if (data.controler && channels.includes(data.controler)) {
                await interaction.guild.channels.cache.get(data.controler).delete();
            }
            if (data.category && channels.includes(data.category)) {
                await interaction.guild.channels.cache.get(data.category).delete();
            }
            if (data.voiceChannels.length > 0) {
                for (const voiceChannel of data.voiceChannels) {
                    if (channels.includes(voiceChannel)) {
                        await interaction.guild.channels.cache.get(voiceChannel).delete();
                    }
                }
            }
            fs.writeFileSync(`./data/${interaction.guild.id}.json`, JSON.stringify({
                controler: "",
                category: "",
                voiceChannels: []
            }, null, 4));
            await interaction.editReply({ content: '✅ Successfully reset setup', ephemeral: true });
        }

        const category = await interaction.guild.channels.create({
            name: `🎶 ${client.user.username} Music`,
            type: ChannelType.GuildCategory
        });

        const controler = await interaction.guild.channels.create({
            name: '🎶 Controler',
            type: ChannelType.GuildText,
            parent: category,
            topic: `In this channel you can't talk. Use the buttons to control the music bot.`
        });

        const musicVoiceChannels = [];
        for (let i = 0; i < voiceChannelAmount; i++) {
            const voiceChannel = await interaction.guild.channels.create({
                name: `🎶 Music ${i + 1}`,
                type: ChannelType.GuildVoice,
                parent: category,
                userLimit: 99
            });

            musicVoiceChannels.push(voiceChannel.id);
        }

        fs.writeFileSync(`./data/${interaction.guild.id}.json`, JSON.stringify({ controler: controler.id, category: category.id, voiceChannels: musicVoiceChannels }, null, 4));

        const controlRow1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('play')
                    .setLabel('▶️ Play')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸️ Pause')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('⏭️ Next')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('loop')
                    .setLabel('🔁 Loop')
                    .setStyle(ButtonStyle.Secondary),
            );

        const controlRow2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('📛 Stop')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('queue')
                    .setLabel('🎶 Queue')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('nowplaying')
                    .setLabel('🎵 Now playing')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('search')
                    .setLabel('🎶 Search')
                    .setStyle(ButtonStyle.Success),
            );

        // & Button Guide: https://discordjs.guide/interactions/buttons.html#button-guide

        const controlerEmbed = new EmbedBuilder()
            .setTitle('🎶 Controler')
            .setDescription('Use the buttons below to control the music bot.')
            .setColor('#6104b9')
            .addFields(
                { name: '▶️ Play', value: 'Play the music', inline: true },
                { name: '⏸️ Pause', value: 'Pause the music', inline: true },
                { name: '⏭️ Next', value: 'Skip to the next song', inline: true },
                { name: '🔁 Loop', value: 'Loop the music', inline: true },
                { name: '📛 Stop', value: 'Stop the music', inline: true },
                { name: '🎶 Queue', value: 'Show the queue', inline: true },
                { name: '🎵 Now playing', value: 'Show the nowplaying', inline: true },
                { name: '🎶 Search', value: 'Search for a song', inline: true },
                { name: '📌 Important', value: 'In this channel you can\'t talk. Use the buttons to control the music bot.' }
            )
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        // & Embed Guide: https://discordjs.guide/popular-topics/embeds.html#embed-preview

        await controler.send({ embeds: [controlerEmbed], components: [controlRow1, controlRow2] });
        await interaction.editReply({ content: `✅ Successfully setup the music bot!\n\n🎶 Category: ${category}\n🎶 Controler: ${controler}\n🎶 Voice Channels: ${musicVoiceChannels.map(channel => `<#${channel}>`).join(', ')}`, ephemeral: true });
    }
}