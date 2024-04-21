const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mediachannel')
    .setDescription('Create a media channel'),
    async execute (interaction) {
        await interaction.guild.channels.create({
            name: 'Media',
            type: 16
        });
    }
}