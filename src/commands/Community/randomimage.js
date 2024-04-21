const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('random-image')
    .setDescription('Get a totally random image!'),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const image = await axios.get(`https://picsum.photos/1920/1080?random=1`);

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setImage(`https://fastly.picsum.photos/${image.request.path}`);

        await interaction.editReply({ embeds: [embed] });
    }
}