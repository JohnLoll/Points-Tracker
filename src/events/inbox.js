const { Events, PermissionsBitField } = require('discord.js');
const inbox = require('../Schemas/inbox');

module.exports = {
    name: Events.MessageCreate,
    async execute (message) {

        if (!message.guild || message.author.bot) return;

        var members = await message.guild.members.fetch();

        async function create (member) {
            if (member.id == message.author.id) return;

            const memberPermissions = message.channel.permissionsFor(member);
            if (!memberPermissions || !memberPermissions.has(PermissionsBitField.Flags.ViewChannel)) return;

            await inbox.create({
                User: member.id,
                Message: message.content,
                Guild: message.guild.id,
                ID: message.id,
                Channel: message.channel.id
            });
        }

        if (message.mentions.members.size > 0) {
            await message.mentions.members.forEach(async member => {
                await create(member);
            });
        } else if (message.content.includes('@here') || message.content.includes('@everyone')) {
            await members.forEach(async member => {
                await create(member);
            });
        } else {
            await message.mentions.roles.filter(async role => {
                await members.forEach(async member => {
                    if (member.roles.cache.has(role.id)) {
                        await create(member);
                    }
                });
            });
        }


    }
}