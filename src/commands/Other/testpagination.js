const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pagination = require('../../functions/pagination');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('test-pagination')
    .setDescription('Testing pagination system'),
    async execute (interaction) {

        const embeds = [];

        var page1 = `THIS IS PAGE 1 qaskldjhalsdhasd`;
        var page2 = `THIS IS PAGE 2 @askldhasdlhasdkjh22`;
        var page3 = `THIS IS PAGE 3 asdkjhasdkjhasd`;
        
        for (var i = 0; i < 3; i++) {
           if (i + 1 == 1) embeds.push(new EmbedBuilder().setColor("Blurple").setDescription(page1));
           else if (i + 1 == 2) embeds.push(new EmbedBuilder().setColor("Blurple").setDescription(page2));
           else if (i + 1 == 3) embeds.push(new EmbedBuilder().setColor("Blurple").setDescription(page3));
        }

        await pagination(interaction, embeds);

    }
}


