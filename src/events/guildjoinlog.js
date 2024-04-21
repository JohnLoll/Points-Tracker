const { Events, ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ComponentType, ChannelType } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute (guild, client) {

        if (!guild) return;

        const sendChannel = await client.channels.fetch('1170500543504982016');

        const name = guild.name;
        const id = guild.id;
        const owner = await guild.members.fetch(guild.ownerId);
        const memberCount = await guild.members.cache.size;
        const botCount = (await guild.members.fetch()).filter(member => member.user.bot).size;
        const clientGuildCount = await client.guilds.cache.size;
        const joinTime = `<t:${Math.floor(Date.now() / 1000)}:R>`;

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`🌍 **New Server Joined**`)
        .addFields({ name: `Server Name`, value: `\`${name}\``})
        .addFields({ name: `Server ID`, value: `\`${id}\``})
        .addFields({ name: `Server Owner`, value: `\`${owner.user.username} (${owner.id})\``})
        .addFields({ name: `Server Member Count`, value: `\`${memberCount}\``})
        .addFields({ name: `Server Bot Count`, value: `\`${botCount + 1}\``})
        .addFields({ name: `Join Timestamp`, value: `${joinTime}`})
        .setDescription(`This is my \`${clientGuildCount}\` server that I am in.  Use the button below to fetch the invite link to this guild.`)
        .setFooter({ text: `📩 Server Join Logs`})
        .setTimestamp();

        const button = new ButtonBuilder()
        .setCustomId('fetchInviteforJoin')
        .setLabel(`📩 Fetch Invite`)
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
        .addComponents(
            button
        );

        const msg = await sendChannel.send({ embeds: [embed], components: [row] }).catch(err => {});

        var time = 300000;
        const collector = await msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            if (i.customId == 'fetchInviteforJoin') {
                var channel;
                const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);

                for (const c of channels.values()) {
                    channel = c;
                    break; 
                }

                if (!channel) return await i.reply({ content: `⚠️ I couldn't find a channel in this guild to create an invite with`, ephemeral: true });

                const invite = await channel.createInvite().catch(err => {});
                await i.reply({ content: `➡️ Heres the invite to ${name}: https://discord.gg/${invite.code}`, ephemeral: true });
            }
        });

        collector.on('end', async () => {
            button.setDisabled(true);
            embed.setFooter({ text: "📩 Join Logs -- the invite fetch has expired."});
            await msg.edit({ embeds: [embed], components: [row] });
        });
    }
}