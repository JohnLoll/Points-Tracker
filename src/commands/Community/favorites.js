const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const favorites = require('../../Schemas/favoriteschema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('favorites')
    .addSubcommand(command => command.setName('add').setDescription('Add a favorite channel').addChannelOption(option => option.setName('channel').setDescription('The channel to favorite').addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildForum).setRequired(true)).addStringOption(option => option.setName('note').setDescription('A note about the channel')))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a channel from the favorites').addChannelOption(option => option.setName('channel').setDescription('The channel to remove').setRequired(true)))
    .addSubcommand(command => command.setName('get').setDescription('Get your favorited channels')),
    async execute (interaction, client) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await favorites.find({ User: interaction.user.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'add':
                var channel = options.getChannel('channel');
                var note = options.getString('note') || '';
                data = await favorites.findOne({ Guild: interaction.guild.id, User: interaction.user.id, Channel: channel.id});
                if (data) {
                    await sendMessage(`⚠️ This channel is already favorited`);
                } else {
                    await favorites.create({
                        Guild: interaction.guild.id, 
                        User: interaction.user.id,
                        Channel: channel.id,
                        Note: note
                    });

                    await sendMessage(`🌍 I have favorited ${channel}`);
                }
            break;
            case 'remove':
                var channel = options.getChannel('channel');
                data = await favorites.findOne({ Guild: interaction.guild.id, User: interaction.user.id, Channel: channel.id});
                if (!data) {
                    await sendMessage(`⚠️ That channel is not yet favorited`);
                } else {
                    await favorites.deleteOne({ Guild: interaction.guild.id, User: interaction.user.id, Channel: channel.id});
                    await sendMessage(`🌍 ${channel} has been removed from your favorites`);
                }
            break;
            case 'get':
                if (!data) {
                    await sendMessage(`⚠️ You dont have any favorited channels yet!`);
                } else {
                    var string = ``;
                    await data.forEach(async value => {
                        var channel = await client.channels.fetch(value.Channel);
                        if (value.Note) {
                            string += `> **Channel:** ${channel}\n> **Notes:** \`${value.Note}\`\n\n`;
                        } else {
                            string += `> **Channel:** ${channel}\n\n`;
                        }
                    });

                    await sendMessage(`⭐ **Your favorite channels:** \n\n${string || 'No favorite channels yet!'}`);
                }
        }
    }
}