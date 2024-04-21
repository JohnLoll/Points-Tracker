const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize a channels recent conversations'),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        try {
            async function summarize (messages) {
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
            
                await page.goto('https://chat-app-f2d296.zapier.app/');
            
                const textBoxSelector = 'textarea[aria-label="chatbot-user-prompt"]';
                await page.waitForSelector(textBoxSelector);
    
                var textInput = `Summarize each message in given ORDER by their topic of discussion (the first messages go FIRST in your reply, and so on based on the order in which the messages are given to you).  Format your response as (DO NOT DISOBEY THIS FORMAT.  DO NOT ADD ANY EXTRA SPACES, OR ANYTHING OTHER THAN WHAT IS DESCRIBED TO YOU.): Topic: (your topic, 1-2 words), Description: (your description of the topic, 1 sentence), Start: (the message content for the START of the topic), End: (the message content for the END of the topic) (EACH MESSAGE IS SEPERATED BY  , ) (REFER TO THE MESSAGE AUTHORS AS USERS IN YOUR DESCRIPTIONS): ${messages}`;
    
                await page.type(textBoxSelector, textInput);
                await page.keyboard.press("Enter");
    
                await page.waitForSelector('[data-testid="final-bot-response"] p').catch(err => {
                    return;
                });
            
                value = await page.$$eval('[data-testid="final-bot-response"]', async (elements) => {
                    return elements.map((element) => element.textContent);
                });
            
                await browser.close();
            
                value.shift()
                return value.join('\n\n\n\n');
            }
    
            var messages = await interaction.channel.messages.fetch({ limit: 10 });
            var content = [];
            await messages.forEach(async message => {
                content.push(`${message.content}`);
            });
    
            await content.reverse();
            var output = await summarize(content.join(', '));
    
            var keywords = ['Topic:', 'Description:', 'Messages:', 'Start:'];
            for (const value of keywords) {
                const regex = new RegExp(value, 'g');
                output = output.replace(regex, `**${value}**`);
            }
    
            await messages.forEach(async message => {   
                output = output.replace(`End: ${message.content}`, `**End:** ${message.content}\n\n`);
                const regex = new RegExp(message.content, 'g');
                output = output.replace(regex, `[${message.content}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${message.id})`);
            });
            
            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`🌍 Channel Message Summary`)
            .setDescription(output)
            .setTimestamp()
            .setFooter({ text: `Summarized 10 messages`})
    
            await interaction.editReply({ embeds: [embed] }); 
        } catch (e) {
            return await interaction.editReply({ content: `⚠️ There was an issue summarizing this channel...`, ephemeral: true });
        }
        
    }
}

//`Summarize each message in given ORDER by their topic of discussion (the first messages go FIRST in your reply, and so on based on the order in which the messages are given to you).  Format your response as (DO NOT DISOBEY THIS FORMAT.  DO NOT ADD ANY EXTRA SPACES, OR ANYTHING OTHER THAN WHAT IS DESCRIBED TO YOU.): Topic: (your topic, 1-2 words), Description: (your description of the topic, 1 sentence), Messages: (the MESSAGES included in each topic SEPERATED BY A , ), Start: (the message content for the START of the topic), End: (the message content for the END of the topic) (EACH MESSAGE IS SEPERATED BY  , ) (REFER TO THE MESSAGE AUTHORS AS USERS IN YOUR DESCRIPTIONS): ${messages}`;