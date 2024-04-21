const { Events, ActivityType } = require('discord.js');
const wstatus = require('../Schemas/wstatus');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute (member, client) {

        var data = await wstatus.findOne({ Guild: member.guild.id});
        if (!data) return;

        var guild = member.guild;
        var string = `👋 Welcome ${member.user.username} to ${guild.name}! You are their ${guild.members.cache.size}th member`;
        var toDm = `🥥 Take a look at my status! You may not be there for long...`;

        setTimeout(async () => {
            if (!member) return;
            await client.user.setActivity({
                name: string,
                type: ActivityType.Custom
            });
        }, 5000);

        if (data.DM) {
            var msg = await member.send(toDm).catch(err => {});
            await msg.react("⭐");
        }

    }
}