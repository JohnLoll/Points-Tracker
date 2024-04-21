const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bard')
    .setDescription('Google bard')
    .addStringOption(option => option.setName('query').setDescription('Ask the AI something').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const query = options.getString('query');

        let input = {
            method: 'GET',
            url: 'https://google-bard1.p.rapidapi.com/',
            headers: {
              text: query,
              lang: 'en',
              psid: 'Your psid',
              'X-RapidAPI-Key': process.env.rapid,
              'X-RapidAPI-Host': 'google-bard1.p.rapidapi.com'
            }
        };

        try {
            const output = await axios.request(input);

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(output.data.response);

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e)
            return await interaction.editReply({ content: `There was an issue getting an AI response! This could be because long requests may be timed out.`})
        }

    }
}