const { SlashCommandBuilder, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const favorite = require('../../Schemas/favoritemessages');

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('favorite')
    .setType(ApplicationCommandType.Message),
    async execute (interaction) {

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        var data = await favorite.findOne({ MessageID: interaction.message.id});
        if (data) return await sendMessage(`⚠️ Looks like that message is already saved`);

        await favorite.create({
            MessageID: interaction.message.id,
            MessageContent: interaction.message.content,
            MessageLink: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.message.id}`
        });

        await sendMessage(`🌍 I have favorited \`${interaction.message.content}\``);
        
    }
}