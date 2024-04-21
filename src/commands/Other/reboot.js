const { SlashCommandBuilder } = require('discord.js');
const { reboot } = require('remote-utilities');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('Reboots your machine.')
    .addStringOption(o => o.setName('message').setDescription('Set the reboot prompt message.'))
    .setDMPermission(false),
    async execute(interaction, client) {

        if (interaction.user.id !== '721500712973893654') return await interaction.reply({ content: `Only <@${process.env.user}> can use this **command**!`, ephemeral: true });

        const prompt = interaction.options.getString('message');
        await interaction.reply({ content: `🚧 **Rebooting** your machine..` })
        const r = await reboot({ message: prompt || '' });
        console.log(r)

    }
}