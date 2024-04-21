const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const favorites = require('../../Schemas/favoritemessages');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('favorite-message')
    .setDescription('favorite message')
    .addSubcommand(command => command.setName('get').setDescription('Get your favorite messages'))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a favorite message')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await favorites.find();

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (data.length == 0) return await sendMessage(`⚠️ Looks like there is no favorite message data`);
        switch (sub) {
            case 'get':
                
        }
    }
}