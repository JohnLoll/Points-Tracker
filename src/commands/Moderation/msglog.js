const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const msglog = require('../../Schemas/msglog');

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
    .setName('message-logger')
    .setDescription('Msg log')
    .addSubcommand(command => command.setName('add').setDescription('Add a message logger channel').addChannelOption(option => option.setName('channel').setDescription('The channel to log messages from').setRequired(true).addChannelTypes(ChannelType.GuildText)).addChannelOption(option => option.setName('log-channel').setDescription('The channel to log messages in').setRequired(true).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove the log system from a channel').addChannelOption(option => option.setName('channel').setDescription('The channel to remove the log system from').setRequired(true).addChannelTypes(ChannelType.GuildText))),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var channel = options.getChannel('channel');
        var data = await msglog.findOne({ Guild: interaction.guild.id, Channel: channel.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'add':
                if (data) {
                    await sendMessage(`⚠️ Looks like the message log system is already setup for that channel`);
                } else {
                    var logchannel = options.getChannel('log-channel');
                    await msglog.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id,
                        LogChannel: logchannel.id
                    });

                    await sendMessage(`🌍 The message logger system is now enabled for ${channel}! All messages will be logged into ${logchannel}`);
                }

            break;
            case 'remove':
                if (!data) {
                    await sendMessage(`⚠️ There is no message log system for that channel`);
                } else {
                    await msglog.deleteOne({ Guild: interaction.guild.id, Channel: channel.id});
                    await sendMessage(`🌍 I have disabled the message log system for ${channel}`);
                }
        }
        
    }
}