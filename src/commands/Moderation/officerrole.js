const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const officerrole = require('../../Schemas/officerrole');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('officerrole')
    .setDescription('officer role')
    .addSubcommand(command => command.setName('add').setDescription('Add a officer role to the database').addRoleOption(option => option.setName('role').setDescription('The officer role to add').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a role from the officer role database').addRoleOption(option => option.setName('role').setDescription('The role to remove').setRequired(true)))
    .addSubcommand(command => command.setName('check').setDescription('Check the officer role(s)')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await officerrole.find({ Guild: interaction.guild.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function checkData (add) {
            var check;
            var role = options.getRole('role');

            await data.forEach(async value => {
                if (value.Role == role.id) return check = true;
            });

            return check;
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await sendMessage(`⚠️ You dont have perms to use this!`);

        switch (sub) {
            case 'add':
                var check = await checkData(true);
                var role = options.getRole('role');

                if (check) {
                    return await sendMessage(`⚠️ Looks like that is already a officer role!`);
                } else {
                    await officerrole.create({
                        Guild: interaction.guild.id,
                        Role: role.id
                    });

                    return await sendMessage(`🌍 I have added ${role} as officer role!`);
                }
            break;
            case 'remove':
                var check = await checkData();
                var role = options.getRole('role');

                if (!check) {
                    return await sendMessage(`⚠️ Looks like that role is not a officer role, so I cant remove it!`);
                } else {
                    await officerrole.deleteOne({ Guild: interaction.guild.id, Role: role.id});
                    return await sendMessage(`🌍 ${role} is no longer a officer role!`);
                }
            break;
            case 'check':
                var values = [];
                await data.forEach(async value => {
                    if (!value.Role) return;
                    else {
                        var r = await interaction.guild.roles.cache.get(value.Role);
                        values.push(`**Role Name:** ${r.name}\n**Role ID:** ${r.id}`);
                    }
                });

                if (values.length > 0) {
                    await sendMessage(`🌍 **Officer Roles**\n\n${values.join('\n')}`);
                } else {
                    await sendMessage(`⚠️ Looks like there are no officer roles here!`);
                }
        }
        
    }
}