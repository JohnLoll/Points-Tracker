const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('puppeteer')
    .setDescription('Test puppeteer stuff for new video'),
    async execute (interaction) {

        const browser = await puppeteer.launch();
        const page = await browser.
        console.log('test')
        const c = await page.goto('https://google.com/search?q=test');
        console.log('test1')
        console.log(c)
    }
}