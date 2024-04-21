const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const main = require('../../Schemas/spamdetectsetup');

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
    .setName('spam-detect')
    .setDescription('spamdetect')
    .addSubcommand(command => command.setName('enable').setDescription('Enable the spam detect system').addChannelOption(option => option.setName('channel').setDescription('The log channel for spam catches').addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the spam detect system')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await main.findOne({ Guild: interaction.guild.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'enable':
                if (data) {
                    await sendMessage(`⚠️ Looks like this system is already setup!`);
                } else {
                    const channel = options.getChannel("channel") || false;
                    if (!channel) {
                        await main.create({ Guild: interaction.guild.id});
                    } else {
                        await main.create({ Guild: interaction.guild.id, Channel: channel.id})
                    }

                    await sendMessage(`🌍 The spam detect system is now enabled`);
                }
            break;
            case 'disable':
                if (!data) {
                    await sendMessage(`⚠️ This system is not yet setup`);
                } else {
                    await main.deleteOne({ Guild: interaction.guild.id});
                    await sendMessage(`🌍 I have disabled the spam detect system`);
                }
        }


    }
} 