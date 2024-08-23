const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const companyhicom = require('../../Schemas/companyhicom');
const ownerid = '721500712973893654'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('companyhicom')
        .setDescription('Company hicoms.')
        .addSubcommand(command =>
            command
                .setName('add')
                .setDescription('Add a company hicom role to the database')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The company hicom role to add')
                        .setRequired(true)
                )
                
        )
        .addSubcommand(command =>
            command
                .setName('remove')
                .setDescription('Remove a role from the company hicom role database')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)
                )
                
        )
        .addSubcommand(command =>
            command
                .setName('check')
                .setDescription('Check the company hicom role(s)')
        ),

    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await companyhicom.find({ Guild: interaction.guild.id});

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

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== ownerid) {
            return await interaction.reply({ content: `⚠️ You don't have perms to use this!`, ephemeral: true });
        }

        switch (sub) {
            case 'add':
              
                var role = options.getRole('role');
            
                // Check if the company hicom role already exists
                var existingConfig = await companyhicom.findOne({ Guild: interaction.guild.id});
            
                if (existingConfig) {
                    // If the company hicom role exists, update its configuration by adding the new role
                    existingConfig.Role = Array.isArray(existingConfig.Role) ? existingConfig.Role : [existingConfig.Role]; // Ensure Role is an array
                    existingConfig.Role.push(role.id);
                    await existingConfig.save();
                    return await sendMessage(`🌍 I have added ${role} as a company hicom role!`);
                } else {
                    // If the company hicom role doesn't exist, create a new configuration
                    await companyhicom.create({
                        Guild: interaction.guild.id,
                        Role: [role.id] // Create an array with the new role
                    });
                    return await sendMessage(`🌍 I have added ${role} as a company hicom role!`);
                }
            break;
            

            case 'remove':
                var role = options.getRole('role');
            
                // Find the company hicom role configuration
                var existingConfig = await companyhicom.findOne({ Guild: interaction.guild.id});
            
                if (!existingConfig || !existingConfig.Role.includes(role.id)) {
                    return await sendMessage(`⚠️ Looks like that role is not a company hicom role, so I can't remove it!`);
                } else {
                    // If the role is found in the 'Role' array, remove it
                    existingConfig.Role = existingConfig.Role.filter(roleId => roleId.toString() !== role.id);
                    await existingConfig.save();
                    return await sendMessage(`🌍 ${role} is no longer a company hicom role!`);
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
        await sendMessage(`🌍 **Company Hicom Roles**\n\n${values.join('\n')}`);
    } else {
        await sendMessage(`⚠️ Looks like there are no company hicom roles here!`);
    }

        }
        
    }
}