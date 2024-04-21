const { Events } = require('discord.js');
const status = require('../Schemas/statusvcdelete');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute (oldState, newState, client) {

        if (oldState.member.guild === null) return;
        var data = await status.findOne({ Guild: oldState.guild.id, Channel: oldState.channelId});
        if (!data) return;
        else {
            var guild = await client.guilds.fetch(oldState.guild.id);
            var channel = await guild.channels.fetch(oldState.channelId);

            if (channel.members.size === 0) {
                await status.deleteOne({ Guild: oldState.guild.id, Channel: channel.id});
                await channel.delete().catch(err => {});
            }
        }
        
    }
}