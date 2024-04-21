const { SlashCommandBuilder } = require('discord.js');
const superagent = require('superagent');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gifsearch')
    .setDescription('Search for a gif')
    .addStringOption(option => option.setName('query').setDescription('What to search for').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const query = options.getString('query');
        const key = 'AIzaSyAsnX8SqTQwz-xKCoKGwKKwNtbd_UGjBXY';
        const clientkey = "Test";
        const lmt = 8;

        let choice = Math.floor(Math.random() * lmt);

        const link = "https://tenor.googleapis.com/v2/search?q=" + query + "&key=" + key + "&client_key=" + clientkey + "&limit=" + lmt;

        const output = await superagent.get(link).catch(err => {});

        try {
            await interaction.editReply({ content: output.body.results[choice].itemurl });
        } catch (e) {
            return await interaction.editReply({ content: `⚠️ I could not find a matching gif to \`${query}\`! `});
        }

    }
}