const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { networkConditions } = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('random-quote')
    .setDescription('Get a random quote'),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const input = {
            method: 'GET',
            url: 'https://quotes15.p.rapidapi.com/quotes/random/',
            headers: {
                'X-RapidAPI-Key': process.env.rapid,
                'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
              }
        };

        try {
            const output = await axios.request(input);

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(`${output.data.content} ━ *${output.data.originator.name}*`)

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: `TThere was an error! Try again later`});
        }

    }
}