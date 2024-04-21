const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const onlinestaff = require('../../Schemas/onlinestaff');

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
    .setName('online-staff')
    .setDescription('online staff')
    .addSubcommand(command => command.setName('setup').setDescription("Setup your online staff system").addChannelOption(option => option.setName('channel').setDescription('The channel to send online updates into').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('The role to track online status from').setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription("Disable your online staff system")),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await onlinestaff.findOne({ Guild: interaction.guild.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'setup':
                if (data) {
                    await sendMessage(`⚠️ Looks like you already have this system setup in <#${data.Channel}>`);
                } else {
                    var channel = options.getChannel('channel');
                    var role = options.getRole('role');

                    await onlinestaff.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id,
                        Role: role.id
                    });

                    await sendMessage(`🌍 When someone with the role ${role} has a presence change, a notification will be sent in ${channel}`);
                }
            break;
            case 'disable':
                if (!data) {
                    await sendMessage(`⚠️ Looks like you have no online staff system setup`);
                } else {
                    await onlinestaff.deleteOne({ Guild: interaction.guild.id});
                    await sendMessage(`🌍 Your online staff system has been disabled!`);
                }
        }
        
    }
}