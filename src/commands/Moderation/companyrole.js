const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const companyrole = require('../../Schemas/companyrole');


module.exports = {
    companyhicom: true,
    data: new SlashCommandBuilder()
        .setName('companyrole')
        .setDescription('Company role')
        .addSubcommand(command =>
            command
                .setName('add')
                .setDescription('Add a company role to the database')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The company role to add')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('company')
                        .setDescription('Specify the company')
                        .setRequired(true).addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
                        { name: 'Dusk Company', value: 'Dusk Company' },
                        { name: 'Trooper', value: 'Trooper' },
                        { name: 'Storm Company', value: 'Storm Company' },
                        { name: 'Initiate', value: 'Initiate'},)
                )
        )
        .addSubcommand(command =>
            command
                .setName('remove')
                .setDescription('Remove a role from the company role database')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('company')
                        .setDescription('Specify the company')
                        .setRequired(true).addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
                        { name: 'Dusk Company', value: 'Dusk Company' },
                        { name: 'Trooper', value: 'Trooper' },
                        { name: 'Storm Company', value: 'Storm Company' },
                        { name: 'Initiate', value: 'Initiate'},)
                )
        )
        .addSubcommand(command =>
            command
                .setName('check')
                .setDescription('Check the company role(s)')
        ),

    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await companyrole.find({ Guild: interaction.guild.id});

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

       
        switch (sub) {
            case 'add':
                var name = options.getString('company');
                var role = options.getRole('role');
            
                // Check if the company role already exists
                var existingConfig = await companyrole.findOne({ Guild: interaction.guild.id, Name: name });
            
                if (existingConfig) {
                    // If the company role exists, update its configuration by adding the new role
                    existingConfig.Role = Array.isArray(existingConfig.Role) ? existingConfig.Role : [existingConfig.Role]; // Ensure Role is an array
                    existingConfig.Role.push(role.id);
                    await existingConfig.save();
                    return await sendMessage(`🌍 I have added ${role} to the company role "${name}"!`);
                } else {
                    // If the company role doesn't exist, create a new configuration
                    await companyrole.create({
                        Guild: interaction.guild.id,
                        Name: name,
                        Role: [role.id] // Create an array with the new role
                    });
                    return await sendMessage(`🌍 I have added ${role} as a company role under "${name}"!`);
                }
            break;
            

            case 'remove':
                var name = options.getString('company');
                var role = options.getRole('role');
            
                // Find the company role configuration
                var existingConfig = await companyrole.findOne({ Guild: interaction.guild.id, Name: name });
            
                if (!existingConfig || !existingConfig.Role.includes(role.id)) {
                    return await sendMessage(`⚠️ Looks like that role is not a company role under "${name}", so I can't remove it!`);
                } else {
                    // If the role is found in the 'Role' array, remove it
                    existingConfig.Role = existingConfig.Role.filter(roleId => roleId.toString() !== role.id);
                    await existingConfig.save();
                    return await sendMessage(`🌍 ${role} is no longer a company role under "${name}"!`);
                }
            break;
            

case 'check':
    // Create an object to store company names and their associated roles
    var companyRolesMap = {};

    // Populate the companyRolesMap with company names and their roles
    data.forEach(value => {
        if (value.Name) {
            if (Array.isArray(value.Role)) {
                // If 'Role' is an array, add each role to the company's list
                if (!companyRolesMap[value.Name]) {
                    companyRolesMap[value.Name] = [];
                }
                value.Role.forEach(roleId => {
                    companyRolesMap[value.Name].push(roleId);
                });
            } else {
                // If 'Role' is a single role ID, add it to the company's list
                if (!companyRolesMap[value.Name]) {
                    companyRolesMap[value.Name] = [];
                }
                companyRolesMap[value.Name].push(value.Role);
            }
        }
    });

    // Generate the message content
    var messageContent = '';
    for (const [companyName, roleIds] of Object.entries(companyRolesMap)) {
        var companyRoles = [];
        for (const roleId of roleIds) {
            var role = interaction.guild.roles.cache.get(roleId);
            if (role) {
                companyRoles.push(`<@&${role.id}>`);
            }
        }
        if (companyRoles.length > 0) {
            messageContent += `**Company:** ${companyName}\n**Roles:** ${companyRoles.join(', ')}\n\n`;
        }
    }

    // Send the message
    if (messageContent) {
        await sendMessage(`🌍 **Company Roles**\n\n${messageContent}`);
    } else {
        await sendMessage(`⚠️ Looks like there are no company roles here!`);
    }
break;

        }
        
    }
}