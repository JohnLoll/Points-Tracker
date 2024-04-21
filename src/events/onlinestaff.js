const { Events, EmbedBuilder } = require('discord.js');
const onlinestaff = require('../Schemas/onlinestaff');

module.exports = {
    name: Events.PresenceUpdate,
    async execute (oldStatus, newStatus, client) {

        if (!newStatus.guild || newStatus.bot) return;

        var data = await onlinestaff.findOne({ Guild: newStatus.guild.id});
        if (!data) return;
        else {
            const mRoles = await newStatus.member.roles.cache.map(role => role.id);

            var check;
            await mRoles.forEach(async role => {
                if (role == data.Role) check = true;
            });

            if (check) {
                var old;
                if (!oldStatus) old = 'offline';
                else old = oldStatus.status;
                
                var updated = newStatus.status;

                if (old == updated) return;
                else {
                    var guild = await client.guilds.fetch(data.Guild);
                    var channel = await guild.channels.fetch(data.Channel);

                    if (old !== 'offline' && updated !== 'offline') return;
                    if (!old) old = 'offline';

                    var statMsg = 'This staff member is now ';
                    if (old == 'offline')  statMsg += 'on discord!';
                    else statMsg += 'no longer on discord.';      

                    const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setDescription(`🌍 **Staff Member Status Change:** \n\n**Staff Member:** ${newStatus.user} \n**Previous Status:** \`${old}\` ➡️ **New Status:** \`${updated}\` \n${statMsg}`);
                    
                    await channel.send({ embeds: [embed] });
                }
            }
        }
    }
}