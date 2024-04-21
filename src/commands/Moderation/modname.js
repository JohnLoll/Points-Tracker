const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('modname')
    .setDescription('Moderate a users nickname')
    .addUserOption(option => option.setName('user').setDescription('The user to moderate').setRequired(true)),
    async execute (interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: `You dont have perms to use this!`, ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const user = options.getUser('user');

        const member = await interaction.guild.members.fetch(user.id).catch(err => {});
        const tagline = Math.floor(Math.random() * 10000) + 1;

        const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(`🛠️ I have set ${user.username}'s nickname to Moderated Nickname ${tagline}`);

        try {
            await member.setNickname(`Moderated Nickname ${tagline}`);
        } catch (e) {
            return await interaction.editReply({ content: `⚠️ I was not able to complete this mod name!`});
        }

        await interaction.editReply({ embeds: [embed] });
    }
}