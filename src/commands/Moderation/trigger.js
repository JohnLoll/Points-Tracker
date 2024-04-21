const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const trigger = require('../../Schemas/triggerschema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('Trigger system')
    .addSubcommand(command => command.setName('add').setDescription('Add a word/phrase and a trigger response').addStringOption(option => option.setName('phrase').setDescription('The phrase to reply to').setRequired(true)).addStringOption(option => option.setName('reply').setDescription('The response to the trigger phrase').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a trigger phrase').addStringOption(option => option.setName('phrase').setDescription('The EXACT phrase to remove').setRequired(true)))
    .addSubcommand(command => command.setName('check').setDescription('Check all of the trigger phrases'))
    .addSubcommand(command => command.setName('edit').setDescription('Edit a trigger').addStringOption(option => option.setName('phrase').setDescription('The phrase to edit').setRequired(true)).addStringOption(option => option.setName('new-reply').setDescription('The new reply to the phrase')).addChannelOption(option => option.setName('block-channel').setDescription('Block a channel from the trigger reply'))),
    async execute (interaction) {

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await sendMessage(`⚠️ You dont have perms to use this!`);

        const { options } = interaction;
        const sub = options.getSubcommand();

        var globalData = await trigger.find({ Guild: interaction.guild.id});
        var data;
        var phrase;
        switch (sub) {
            case "add":
                phrase = options.getString('phrase').toLowerCase();
                const reply = options.getString('reply');

                data = await trigger.findOne({ Guild: interaction.guild.id, Phrase: phrase });
                if (data) {
                    return await sendMessage(`⚠️ Looks like this phrase \`${phrase}\` is already a trigger here..`);
                } else {
                    await trigger.create({
                        Guild: interaction.guild.id,
                        Phrase: phrase,
                        Reply: reply,
                    });

                    await sendMessage(`🌍 I have added \`${reply}\` as a reply to all messages containing \`${phrase}\`! Feel free to block this reply in specific channels using /trigger edit`);
                }
            break;
            case "remove":
                phrase = options.getString('phrase').toLowerCase();
                data = await trigger.findOne({ Guild: interaction.guild.id, Phrase: phrase });

                if (!data) {
                    return await sendMessage(`⚠️ Looks like \`${phrase}\` is not an EXACT match to one of the phrase replies! Not that caps do not make a difference in finding the phrase to remove-- only spaces and characters do.`);
                } else {
                    await trigger.deleteOne({ Guild: interaction.guild.id, Phrase: phrase });
                    await sendMessage(`🌍 I have deleted \`${phrase}\` from our trigger reply database-- nothing will be sent if this phrase is sent.`);
                }
            break;
            case "edit":
                phrase = options.getString('phrase').toLowerCase();
                data = await trigger.findOne({ Guild: interaction.guild.id, Phrase: phrase });
                var newReply = options.getString('new-reply') || data.Reply;
                var blockChannel = options.getChannel('block-channel');

                if (!data) {
                    return await sendMessage(`⚠️ Looks like \`${phrase}\` is not an EXACT match to one of the phrase replies! Not that caps do not make a difference in finding the phrase to remove-- only spaces and characters do.`);
                } else {
                    var update;
                    if (blockChannel) {
                        update = {
                            $set: { Reply: newReply },
                            $push: { Block: `${blockChannel.id}` }
                        };
                    } else {
                        update = {
                            $set: { Reply: newReply }
                        }
                    }

                    await trigger.updateOne({ Guild: interaction.guild.id, Phrase: phrase }, update);
                    await sendMessage(`🌍 I have updated your trigger with your set changes.`);
                }
            break;
            case "check":
                if (globalData) {
                    var information = [];
                    await globalData.forEach(async value => {
                        var blocked = value.Block;
                        if (blocked.length == 0) blocked = 'No blocked channels';
                        else blocked = value.Block.join(', ');

                        information.push(`**Trigger Phrase** (in lowercase format): \`${value.Phrase}\`\n**Reply Phrase:** \`${value.Reply}\`\n**Blocked Channels:** \`${blocked}\`\n\n`);
                    });

                    await sendMessage(`🌍 **Your Trigger Phrases & Corresponding Data**\n\n${information.join('\n')}`);
                }
        }
    }
}