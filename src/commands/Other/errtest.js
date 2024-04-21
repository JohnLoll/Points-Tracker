const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('errotest')
    .setDescription('error test'),
    async execute (interaction) {
        await interaction.reply({ cnent: `${interaction.player.id}`, ephamaeral: true });
    }
}