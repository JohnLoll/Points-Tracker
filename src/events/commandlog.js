const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute (interaction, client) {

        if (!interaction.commandName) return;

        var sendGuild = await client.guilds.fetch('1164641109947981865');
        var sendChannel = await sendGuild.channels.fetch('1170500543504982016');

        var command = interaction.commandName;
        var guild = interaction.guild;
        var user = interaction.user;
        var channel = interaction.channel;

        const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`🍀 Command Used`)
        .setDescription('An interaction command has been used.')
        .addFields({ name: "Command", value: `\`${command}\``})
        .addFields({ name: "Guild of Use", value: `\`${guild.name}\` (${guild.id})`})
        .addFields({ name: "Channel of Use", value: `\`${channel.name}\` (${channel.id})`})
        .addFields({ name: "Command User", value: `\`${user.username}\` (${user.id})`})
        .setFooter({ text: "Interaction Use Logger"})
        .setTimestamp();

        const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`generateInviteLog`)
        .setLabel(`📫 Generate Server Invite`)
        .setDisabled(false);

        

        var msg = await sendChannel.send({ embeds: [embed]});

        var time = 300000;
        const collector = await msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        

        collector.on('end', async () => {
            
            embed.setFooter({ text: "Interaction Use Logger -- the button below has expired"});
            await msg.edit({ embeds: [embed] });
        });

    }
}