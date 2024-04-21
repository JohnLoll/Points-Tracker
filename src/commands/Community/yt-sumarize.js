const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('yt-summarize')
    .setDescription('Summarize a yt video')
    .addStringOption(option => option.setName('url').setDescription('The video URL to summarize').setRequired(true)),
    async execute (interaction) {

        const { options } = interaction;
        const url = options.getString('url');

        await interaction.deferReply({ ephemeral: true });

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.summarize.tech/');

        await page.waitForSelector('input.me-auto.form-control[placeholder="URL of a YouTube video"]');
        await page.type('input.me-auto.form-control[placeholder="URL of a YouTube video"]', url);

        await page.keyboard.press('Enter');

        await page.waitForSelector('section');

        var text = await page.evaluate((selector) => {
            const paragraph = document.querySelector(selector);
            return paragraph.textContent;
        }, 'section > p:first-of-type').catch(err => {});

        if (!text) return await interaction.editReply({ content: `This video does not have a transcript to summarize`});

        text = text.replace('YouTube video', `[YouTube video](${url})`);

        await browser.close();

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(text);

        await interaction.editReply({ embeds: [embed] });

    }
}