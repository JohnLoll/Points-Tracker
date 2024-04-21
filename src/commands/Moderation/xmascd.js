const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const xmas = require('../../Schemas/xmascountdown');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('christmas-countdown')
    .setDescription('Christmas countdown')
    .addSubcommand(command => command.setName('setup').setDescription('Setup the christmas countdown').addChannelOption(option => option.setName('channel').setDescription('The channel to count-down in').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the christmas countdown system')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await xmas.findOne({ Guild: interaction.guild.id});

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message)

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'setup':
                if (data) return await sendMessage(`👉 Looks like you already have this setup`);
                else {
                    const channel = await options.getChannel('channel');

                    await xmas.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id
                    });

                    await sendMessage(`🧠 Your christmas countdown will start in ${channel}`);
                }
            
            break;
            case 'disable':
                if (!data) return await sendMessage(`👉 Looks like you dont have this system setup yet`);
                else {
                    await xmas.deleteOne({ Guild: interaction.guild.id});
                    await sendMessage(`🌍 I have disabled your countdown to christmas system!`);
                }
        }

    }
}