const { Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const block = require('../Schemas/blockcmd');
const modrole = require('../Schemas/modrole');
const officerrole = require('../Schemas/officerrole');
const companyrole = require('../Schemas/companyrole');
const companyhicom = require('../Schemas/companyhicom');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        if (interaction.customId) {
            if (interaction.customId.includes("bugSolved - ")) {
                var stringId = interaction.customId;
                stringId = stringId.replace("bugSolved - ", "");

                var member = await client.users.fetch(stringId);
                await member.send(`🌍 This message was initialized by the developers indicating that the bug you reported has been solved.`).catch(err => {});
                await interaction.reply({ content: `🌍 I have notified the member that their report is now solved.`, ephemeral: true });
                await interaction.message.delete().catch(err => {});
            }
        }

        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (command.owner == true) {
            if (interaction.user.id !== '721500712973893654') return await interaction.reply({ content: `You cant use this command`, ephemeral: true });
        }

        //block cmd 
        try {
            var data = await block.find({ Guild: interaction.guild.id });
            var match = [];
            await data.forEach(async value => {
                if (value.Command == interaction.commandName) return match.push(value);
            });
    
            //mod role
            if (command.mod) {
                var modRoleData = await modrole.find({ Guild: interaction.guild.id});
                if (modRoleData.length > 0) {
                    var check;
                    await modRoleData.forEach(async value => {
                        const mRoles = await interaction.member.roles.cache.map(role => role.id);
                        await mRoles.forEach(async role => {
                            if (role == value.Role) check = true;
                        });
                    });
    
                    if (!check) return await interaction.reply({ content: `⚠️ Only **moderators** can use this command!`, ephemeral: true });
                }
            }
              //officer role
              if (command.officer) {
                var officerRoleData = await officerrole.find({ Guild: interaction.guild.id});
                if (officerRoleData.length > 0) {
                    var check;
                    await officerRoleData.forEach(async value => {
                        const mRoles = await interaction.member.roles.cache.map(role => role.id);
                        await mRoles.forEach(async role => {
                            if (role == value.Role) check = true;
                        });
                    });
    
                    if (!check) return await interaction.reply({ content: `⚠️ Only **Officers** can use this command!`, ephemeral: true });
                }
            }
//company role
if (command.company) {
    var companyRoleData = await companyrole.find({ Guild: interaction.guild.id, Name: interaction.options.getString('company') });
    
    if (companyRoleData.length > 0) {
        var userHasCompanyRole = false;
        
        // Iterate through each company role configuration
        for (const value of companyRoleData) {
            // Iterate through the user's roles
            for (const userRole of interaction.member.roles.cache.values()) {
                // Check if the user has a role that matches any role in the company's role array
                if (value.Role.includes(userRole.id)) {
                    userHasCompanyRole = true;
                    break; // Exit the loop if a match is found
                }
            }
            if (userHasCompanyRole) {
                break; // Exit the loop if a match is found
            }
        }

        if (!userHasCompanyRole) {
            return await interaction.reply({ content: `⚠️ Only **Company members** can use this command for the specified company!`, ephemeral: true });
        }
    }
}
//Company Hicom
if (command.companyhicom) {
    var companyHicomData = await companyrole.find({ Guild: interaction.guild.id, Name: interaction.options.getString('company') });
    
    if (companyHicomData.length > 0) {
        var userHasCompanyHicom = false;
        
        // Iterate through each company role configuration
        for (const value of companyHicomData) {
            // Iterate through the user's roles
            for (const userRole of interaction.member.roles.cache.values()) {
                // Check if the user has a role that matches any role in the company's role array
                if (value.Role.includes(userRole.id)) {
                    userHasCompanyHicom = true;
                    break; // Exit the loop if a match is found
                }
            }
            if (userHasCompanyHicom) {
                break; // Exit the loop if a match is found
            }
        }

        if (!userHasCompanyHicom) {
            return await interaction.reply({ content: `⚠️ Only **Company Hicom** can use this command!`, ephemeral: true });
        }
    }
}

            if (match.length > 0) {
                return await interaction.reply({ content: `⚠️ Sorry! Looks like the server has this command **blocked from use!**`, ephemeral: true });
            }
            //
        } catch (e) {
            console.log(e);
        }
        

        if (!command) return
        
        //error handling
        try{
            const cmd = await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: 'There was an error while executing this command!', 
                ephemeral: true
            }).catch(err => {});


            //error flag system
            var guild = interaction.guild;
            var member = interaction.member;
            var channel = interaction.channel;
            var errorTime = `<t:${Math.floor(Date.now() / 1000)}:R>`;

            const sendChannel = await client.channels.fetch('1170500543504982016');

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(`⚠️ Flagged Error!`)
            .setDescription('An error has been flagged while using a slash command.  All other forms of interaction will not be logged with this system')
            .addFields({ name: "Error Command", value: `\`${interaction.commandName}\``})
            .addFields({ name: "Error Stack", value: `\`${error.stack}\``})
            .addFields({ name: "Error Message", value: `\`${error.message}\``})
            .addFields({ name: "Error Timestamp", value: `${errorTime}`})
            .setFooter({ text: `Error Flag System`})
            .setTimestamp();

            const button = new ButtonBuilder()
            .setCustomId('fetchErrorUserInfo')
            .setLabel(`📩 Fetch User Info`)
            .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
            .addComponents(
                button
            );

            const msg = await sendChannel.send({ embeds: [embed], components: [row] }).catch(err => {});

            var time = 300000;
            const collector = await msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time
            });

            collector.on('collect', async i => {
                if (i.customId == 'fetchErrorUserInfo') {
                    const userEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .addFields({ name: "Error Guild", value: `\`${guild.name} (${guild.id})\``})
                    .addFields({ name: "Error User", value: `\`${member.user.username} (${member.id})\``})
                    .addFields({ name: "Error Command Channel", value: `\`${channel.name} (${channel.id})\``})
                    .setDescription('This user has triggered a slash command error while using one of the commands listed above.')
                    .setTimestamp();

                    await i.reply({ embeds: [userEmbed], ephemeral: true });
                }
            });

            collector.on('end', async () => {
                button.setDisabled(true);
                embed.setFooter({ text: "Error Flag System -- your user fetch button has expired."});
                await msg.edit({ embeds: [embed], components: [row] });
            });

        } 

    },
    


};