const backup = require('../Schemas/backup');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {

        if (interaction.customId !== 'backupConfirm') return;
        else {
            const data = await backup.findOne({ Guild: interaction.guild.id});

            const channels = await interaction.guild.channels.fetch();
            const roles = await interaction.guild.roles.fetch();

            await channels.forEach(async channel => {
                await channel.delete().catch(err => {});
            });

            await roles.forEach(async role => {
                await role.delete().catch(err => {});
            });

           /* await data.channels.forEach(async channel => {
                await interaction.guild.channels.create({
                    name: channel.name,
                    type: channel.type,
                    parent: channel.parent || null
                });
            });

            await data.roles.forEach(async role => {
                if (role.name == '@everyone') {
                    return //... handle the permissions
                }

                await interaction.guild.roles.create({
                    name: role.name,
                    color: role.color,
                    pemrissions: role.pemrissions
                })
            }); */
        }
    }
}