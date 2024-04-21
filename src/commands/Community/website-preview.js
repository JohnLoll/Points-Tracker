const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('preview-website')
    .setDescription('Preview a website by uploading it\'s html file')
    .addAttachmentOption(option => option.setName('html-file').setDescription('The html file to preview').setRequired(true)),
    async execute (interaction) {

        const attachment = interaction.options.getAttachment('html-file');

        const channel = await interaction.guild.channels.cache.get('1158161750114447410');
        const msg = await channel.send({ files: [attachment] });

        const proxy = msg.attachments.first().url;
        const url = `https://mahto.id/chat-exporter?url=${proxy}`;

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Open')
            .setStyle(ButtonStyle.Link)
            .setURL(url)
        );

        await interaction.reply({ content: `Here is your [preview](${url})!`, components: [button], ephemeral: true });
        
    }
}