const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    owner: true,
    testing: 'this works',
    cooldown: 10,
    data: new SlashCommandBuilder()
    .setName('properties-testing')
    .setDescription('testing command properties'),
    async execute (interaction, client) {
        const command = client.commands.get('properties-testing');
        const text = `${command.owner.toString()}, ${command.testing.toString()}, ${command.cooldown.toString()}`
        await interaction.reply({ content: text, ephemeral: true });
        console.log(command);
    }
}