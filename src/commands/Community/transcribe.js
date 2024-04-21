const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('image-to-text')
    .setDescription('Extract the text from any image and print it into text (CHOOSE ONE INPUT OPTION BELOW)')
    .addAttachmentOption(option => option.setName('image-attachment').setDescription('Attach an image to scan'))
    .addStringOption(option => option.setName('image-url').setDescription("Use an image URL to scan")),
    async execute (interaction) {

        const { options } = interaction;
        const image = options.getString('image-url');
        const attachment = options.getAttachment('image-attachment');

        async function sendMessage (message, edit) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            if (edit) {
                await interaction.editReply({ content: '', embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (!image && !attachment) return await sendMessage(`⚠️ You must use at least one input option`);

        await sendMessage(`⭐ Loading your transcription... this takes AT LEAST 10 seconds`);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        var response;
        setTimeout(async () => {
            if (!response) {
                await sendMessage(`⚠️ There was an error completing this request`, true);
                await browser.close().catch(err => {});
            }
        }, 30000);

        await page.goto('https://www.prepostseo.com/image-to-text');
        
        const button = '#togglebylink';
        await page.waitForSelector(button);
        await page.click(button);

        const inputSelector = '#inputURL';

        var input;
        if (attachment) {
            input = attachment.url;
        } else {
            input = image;
        }

        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, input);
        await page.keyboard.press("Enter");

        const text = '#textt0';
        await page.waitForSelector(text);

        setTimeout(async () => {
            var eText = await page.$eval(text, element => element.textContent);
            await browser.close();

            eText = eText.replace('Extracting Text: 0%', 'No text found in this image that I could transcribe. Media attachments from discord dont work for this.  Try using the attachment option to upload your image.');
            
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(`🌍 Image to text transcription`)
            .setImage(input)
            .setDescription(eText)
            .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });
            response = true;
        }, 10000);

    }
}