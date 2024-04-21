const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const bot = require('../../Schemas/antibotSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('antibot')
    .setDescription(`Antibot`)
    .addSubcommand(command => command.setName('enable').setDescription('Prohibit bots from joining the server'))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the anti bot system for this server')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await bot.findOne({ Guild: interaction.guild.id });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You dont have perms to use this`, ephemeral: true });

        const embed = new EmbedBuilder()
        .setColor("Blurple");

        switch (sub) {
            case 'enable':
                if (data) {
                    return await interaction.reply({ content: `😉 You already have this system setup!`, ephemeral: true });
                } else {
                    await bot.create({
                        Guild: interaction.guild.id
                    });
                    embed.setDescription(`🌍 Bots are now prohibited from joining this server. **All current bots will be kicked within the next 10 seconds-- to reverse this, use the /antibot disable command.**`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            
            break;
            case 'disable':
                if (!data) {
                    return await interaction.reply({ content: `🧠 Looks like this system has not been setup here yet!`, ephemeral: true });
                } else {
                    await bot.deleteOne({ Guild: interaction.guild.id });
                    embed.setDescription(`🌍 Bots can now join and remain in this server`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
        }

        
    }
}