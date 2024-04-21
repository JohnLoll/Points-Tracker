const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('copilot')
    .setDescription('Use copilot AI')
    .addStringOption(option => option.setName('message').setDescription('The message for AI').setRequired(true)),
    async execute (interaction) {

        const { options } = interaction;
        const message = options.getString('message');

        await interaction.deferReply({ ephemeral: true });

        async function getResponse() {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();

            await page.goto('https://copilot.microsoft.com/?FORM=undexpand&');

            const textBoxSelector = '#searchbox-text.area';
            await page.waitForSelector(textBoxSelector);

            await page.type(textBoxSelector, message);
            await page.keyboard.press("Enter");

            const outputSelector = '.ac-textBlock';

            await page.waitForSelector(outputSelector);

            const pContent = await page.evaluate((outputSelector) => {
                const div = document.querySelector(outputSelector);
                const pElement = div.querySelector('p');
                return pElement.textContent.trim();
            }, outputSelector);

            await browser.close();

            return pContent;
        }

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(`🌍 **Copilot Response** \n\n\`\`\`${await getResponse()}\`\`\``);

        await interaction.editReply({ embeds: [embed], ephemeral: true });

        
    }
}