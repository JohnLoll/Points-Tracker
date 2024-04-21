const { EmbedBuilder, PermissionsBitField, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('Steal Sticker')
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuildExpressions)
    .setDMPermission(false),
    async execute (interaction) {

        async function sendMessage (message, edit) {
            if (!edit) {
                await interaction.reply({ content: message, ephemeral: true });
            } else {
                await interaction.editReply({ content: message });
            }
        }

        await sendMessage(`✨ Stealing your sticker...`);

        const message = await interaction.channel.messages.fetch(interaction.targetId);
        const sticker = message.stickers.first();

        if (!sticker) return await sendMessage(`⚠️ There is no sticker in this message...`, true);
        if (sticker.url.endsWith('.json')) return await sendMessage(`⚠️ That is not a valid sticker file...`, true);

        var error;
        const created = await interaction.guild.stickers.create({
            name: sticker.name,
            description: sticker.description || '',
            tags: sticker.tags,
            file: sticker.url
        }).catch(async err => {
            error = true;
            if (err.code == 30039) return await sendMessage(`⚠️ Looks like you reached your guild's **sticker limit**...`, true);
            else return await sendMessage(`⚠️ An unknown error has occured...`, true);
        });

        if (error) return;
        await sendMessage(`🌍 Created your sticker using the name [${created.name}](${created.url})`, true);

    }
}