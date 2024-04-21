const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('invite-leaderboard')
    .setDescription('Get the total --all time-- invite leaderboard'),
    async execute (interaction) {

        var invites = await interaction.guild.invites.fetch();
        var members = await interaction.guild.members.fetch();

        async function total () {
            var userInvs = [];
            await members.forEach(async member => {
                var uInvites = await invites.filter(u => u.inviter && u.inviter.id === member.user.id);
                var count = 0;

                await uInvites.forEach(async invite => count += invite.uses);
                userInvs.push({ member: member.user.id, invites: count });
            });

            return userInvs;
        }

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        var leaderboard = await total();
        leaderboard.sort((a, b) => b.invites - a.invites);
        var output = leaderboard.slice(0, 10);

        var string;
        var num = 1;
        await output.forEach(async value => {
            var member = await interaction.guild.members.fetch(value.member);
            string += `#${num} Member: **${member.user.username}**, Total Invites: \`${value.invites}\`\n`;
            num++;
        });

        string = string.replace('undefined', '');
        await sendMessage(`🌍 **Total Invite Leaderboard** \n\n${string}`);
        
    }
}