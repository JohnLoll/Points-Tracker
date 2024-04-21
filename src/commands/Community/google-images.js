const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const google = require('images-scraper');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('google-images')
    .setDescription('Google an image!')
    .addStringOption(option => option.setName('query').setDescription('What image do you want to find').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const query = options.getString('query');

        const image = new google({
            puppeteer: {
                headless: true,
            },
        });

        const results = await image.scrape(query, 4);

        const mainEmbed = new EmbedBuilder().setURL('https://youtube.com').setImage(results[0].url);
        const secondEmbed = new EmbedBuilder().setURL('https://youtube.com').setImage(results[1].url);
        const thirdEmbed = new EmbedBuilder().setURL('https://youtube.com').setImage(results[2].url);
        const fourthEmbed = new EmbedBuilder().setURL('https://youtube.com').setImage(results[3].url);

        await interaction.editReply({ embeds: [mainEmbed, secondEmbed, thirdEmbed, fourthEmbed] });
        
    }
}