const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const createBuilder = require('discord-command-builder');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('generate-command')
    .setDescription('Generate code for a discord.js v14 bot command!'),
    async execute (interaction) {
        createBuilder({ interaction: interaction, path: './cache/'}).catch(async err => {
            return await interaction.reply({ content: `🌍 There was an error while running this command!`, ephemeral: true });
        })
    }
}