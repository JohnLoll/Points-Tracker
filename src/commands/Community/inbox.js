const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const inbox = require('../../Schemas/inbox');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('inbox')
    .setDescription('Get your mention inbox')
    .addSubcommand(command => command.setName('get').setDescription('Get your mention inbox'))
    .addSubcommand(command => command.setName('clear').setDescription('Clear your message inbox').addStringOption(option => option.setName('id').setDescription('The ID of the message to clear (type ALL to clear everything)').setRequired(true))),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await inbox.find({ User: interaction.user.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'get':
                if (data.length == 0) {
                    await sendMessage(`⚠️ You have nothing in your inbox...`);
                } else {
                    var string = `📫 **Your Inbox:**`;
                    await data.forEach(async value => {
                        string += `\n\n> Message Content: ${value.Message} (https://discord.com/channels/${value.Guild}/${value.Channel}/${value.ID}) | ID: \`${value.ID}\``;
                    });

                    if (string.length >= 2000) return await sendMessage(`⚠️ Your inbox is to full to send... run /inbox clear "ALL" to clear it`);

                    await sendMessage(string);
                }
            break;
            case 'clear':
                const id = options.getString('id');
                if (data.length == 0) return await sendMessage(`⚠️ You have nothing in your inbox...`);

                if (id == 'ALL') {
                    await inbox.deleteMany({ User: interaction.user.id});
                    await sendMessage(`🌍 I have cleared your inbox`);
                } else {
                    var checkData = await inbox.findOne({ User: interaction.user.id, ID: id});
                    if (!checkData) return await sendMessage(`⚠️ That ID does not exist in your inbox...`);

                    await inbox.deleteOne({ User: interaction.user.id, ID: id});
                    await sendMessage(`🌍 I have deleted the message with the ID \`${id}\``);
                }
        }

    }
}