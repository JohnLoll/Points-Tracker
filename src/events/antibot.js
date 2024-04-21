const bot = require('../Schemas/antibotSchema');

module.exports = {
    name: 'guildMemberAdd',
    async execute (member, client) {

        const data = await bot.findOne({ Guild: member.guild.id });
        if (!data) return;
        else {
            if (member.user.bot && member.id !== client.user.id) return await member.kick({ reason: 'Anti Bot System' });
            else return;
        }
        
    }
}