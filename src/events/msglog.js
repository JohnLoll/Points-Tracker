const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const msglog = require('../Schemas/msglog');

module.exports = {
    name: Events.MessageCreate,
    async execute (message) {

        if (!message.guild || !message) return;
        var data = await msglog.findOne({ Guild: message.guild.id, Channel: message.channel.id});
        if (!data) return;

        var sendChannel = await message.guild.channels.fetch(data.LogChannel);

        var b = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(`🗑️ Delete Message`)
        .setCustomId(`msglogdeletemsg`)
        .setDisabled(false);

        var button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
            .setLabel(`View Message`),

            b
        );  

        var attachments = await message.attachments.map(attachment => attachment.url).toString();

        var msg = await sendChannel.send({ content: `➡️ **New Message Logged - <#${data.Channel}>** \n\n> ${message.content || 'No Message Content'}\n${attachments}\n\nThis message was sent by - ${message.author} (${message.author.id}) - and is being logged here. Take moderative action below if needed-- please note if some of the buttons don't work, it means the message has been deleted.`, components: [button] });
            
        var time = 300000;
        const collector = await msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        await collector.on('collect', async i => {
            if (i.customId !== 'msglogdeletemsg') return;

            if (!message) return await msg.edit({ content: `➡️ **New Message Logged - <#${data.Channel}>** \n\n> ${message.content || 'No Message Content'}\n${attachments}\n\nThis message was sent by - ${message.author} (${message.author.id}) - and is being logged here. **THIS MESSAGE HAS BEEN DELETED BY A MODERATOR OR THE MESSAGE AUTHOR**.`, components: [] }).catch(err => {});
    
            var error;
            await message.delete().catch(err => {
                error = true;
            });
    
            if (error) {
                await i.reply({ content: `⚠️ I could not delete that message`, ephemeral: true });
            } else {
                await i.reply({ content: `🌍 I have deleted that message`, ephemeral: true });
                await msg.edit({ content: `➡️ **New Message Logged - <#${data.Channel}>** \n\n> ${message.content || 'No Message Content'}\n${attachments}\n\nThis message was sent by - ${message.author} (${message.author.id}) - and is being logged here. **THIS MESSAGE HAS BEEN DELETED BY THE MESSAGE LOG MODERATOR BUTTONS**.`, components: [] }).catch(err => {});
            }
    
        });

        collector.on('end', async () => {
            await b.setDisabled(true);
            await msg.edit({ content: `➡️ **New Message Logged - <#${data.Channel}>** \n\n> ${message.content || 'No Message Content'}\n${attachments}\n\nThis message was sent by - ${message.author} (${message.author.id}) - and is being logged here. **THE TIME HAS EXPIRED FOR MODERATIVE ACTION BELOW.  YOU CAN STILL VIEW THE MESSAGE USING THE BUTTON-- IF IT DOESN'T WORK, IT MEANS THE MESSAGE WAS DELETED.**`, components: [button] }).catch(err => {});
        })


    }
}