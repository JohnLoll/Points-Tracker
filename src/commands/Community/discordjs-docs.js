const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('discordjs-docs')
    .setDescription('Query the djs docs')
    .addStringOption(option => option.setName('query').setDescription('The thing to find in the docs').setRequired(true)),
    async execute (interaction) {

        const { options } = interaction;
        var query = options.getString('query');
        await interaction.deferReply({ ephemeral: true });

        query = query.replace(' ', '%');

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        var openURL = `https://old.discordjs.dev/#/docs/discord.js/14.11.0/search?query=${query}`;
        await page.goto(openURL);

        var wait;
        setTimeout(async () => {
            if (wait !== true) {
                await browser.close();
                return await interaction.editReply({ content: `⚠️ I am having a hard time processing this request.`});
            }
        },30000);

        await page.waitForSelector('div > ul.no-list');
        wait = true;

        const values = await page.evaluate(() => {
            const div = document.querySelector('div > ul.no-list');
            const listItems = div.querySelectorAll('li');

            const valuesArray = [];
            listItems.forEach((li) => {
                const text = li.innerText;
                const link = `https://old.discordjs.dev/${li.querySelector('a').getAttribute('href')}`;
                valuesArray.push({ text, link });
            });

            return valuesArray;
        });

        await browser.close();

        if (values <= 1) return await interaction.editReply({ content: `⚠️ No documentation found matching query \`${query}\``})

        async function getValues (num) {
            const output = values.slice(0, num);
            const format = output.map(item => `[${item.text.replace('\n', '').substring(1)}](${item.link})\n`);
            return format;
        };

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Load More')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('djsload'),

            new ButtonBuilder()
            .setLabel('Full List')
            .setStyle(ButtonStyle.Link)
            .setURL(openURL)
        );
        
        query = query.replace('%', ' ');
        const finalOutput = await getValues(10);
        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`Discord.js Documentation Query: ${query}`)
        .setDescription(finalOutput.join(''))
        .setFooter({ text: `Loaded 10 values`});

        const msg = await interaction.editReply({ embeds: [embed], components: [button] });
        const collector = await msg.createMessageComponentCollector();

        var num = 20;
        collector.on('collect', async i => {
            if (i.customId == 'djsload') {
                if (num == 40) return await i.reply({ content: `I can't load anymore values...`, ephemeral: true });

                const newOutput = await getValues(num);
                embed.setDescription(newOutput.join(''));
                embed.setFooter({ text: `Loaded ${num} values`});
                await interaction.editReply({ embeds: [embed], components: [button] });
                await i.reply({ content: `Loaded 10 more values!`, ephemeral: true });

                num += 10;
            }
        });

    }
}