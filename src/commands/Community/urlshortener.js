const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('url-shortener')
    .setDescription('Shorten a URL')
    .addStringOption(option => option.setName('link').setDescription('The link to shorten').setRequired(true))
    .addStringOption(option => option.setName('alias').setDescription('The alias for your short URL')),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const link = options.getString('link');
        let alias = options.getString('alias') || '';

        const input = {
            method: 'POST',
            url: 'https://url-shortener23.p.rapidapi.com/shorten',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.rapid,
                'X-RapidAPI-Host': 'url-shortener23.p.rapidapi.com'
            },
            data: {
                url: link,
                alias: alias
            }
        };

        try {
            const output = await axios.request(input);

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(`🔗 Here is your shortened link for \`${link}\`: ${output.data.short_url}`)

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            if (e.statusCode === 400) {
                return await interaction.editReply({ content: `⚠️ The alias \`${alias}\` is already in use!`});
            } else {
                return await interaction.editReply({ content: `⚠️ There was an error while shortening your URL! Try again later.`});
            }
        }

    }
}