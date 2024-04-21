const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ytmp4')
    .setDescription('Download youtube videos')
    .addStringOption(option => option.setName('video-id').setDescription('The youtube video ID to download').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const vidId = options.getString('video-id');
        
        const input = {
            method: "GET",
            url: 'https://youtube-video-download-info.p.rapidapi.com/dl',
            params: { id: vidId },
            headers: {
                'X-RapidAPI-Key': process.env.rapid,
                'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
            }
        };

        try {
            const output = await axios.request(input);
            const link = output.data.link[22];

            const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel(`📬 Download MP4`)
                .setStyle(ButtonStyle.Link)
                .setURL(link[0])
            );

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(`📹 Download the mp4 version of \`${output.data.title}\` below!`)

            await interaction.editReply({ embeds: [embed], components: [button] });
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: `⚠️ That video ID is not valid! Go to the URL and copy the ID at the end of the link`});
        }

    }
}