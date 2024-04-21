const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('fortnite-shop')
    .setDescription('Check the fortnite item shop!'),
    async execute (interaction) {

        async function sendMessage (message) {
            await interaction.reply({ content: message, ephemeral: true })
        }

        var output = await fetch('https://fortnite-api.com/v2/shop/br');
        var data = await output.json();

        var cosmetics = data.data.featured.entries;
        let formatString = '';

        await cosmetics.forEach(async value => {
            formatString += `Item: **${value.layout.name}** Category: **${value.layout.category || 'None'}** Final Price: **${value.finalPrice}**\n`;
        }); 

       console.log(cosmetics)
      

        /*var test = await fetch('https://fortnite-api.com/v2/shop/br')
        .then(response => response.json())
        .then(data => {
            console.log(data.data.featured.entries)
        }) */

    }
}