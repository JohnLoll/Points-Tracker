const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('google-lense')
    .setDescription('Use google lense!')
    .addStringOption(option => option.setName('image').setDescription('The image to look up').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const image = options.getString('image');

        const input = {
            method: 'GET',
            url: 'https://google-bard1.p.rapidapi.com/beta/lens/',
            headers: {
                psid: 'YOUR PSID',
                text: image,
                'X-RapidAPI-Key': process.env.rapid,
                'X-RapidAPI-Host': 'google-bard1.p.rapidapi.com'
            }
        };

        try {
            const output = await axios.request(input);
            console.log(output.data);
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: `There was an error getting that response!`});
        }

    }
}