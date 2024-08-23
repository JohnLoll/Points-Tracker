const { ContextMenuCommandBuilder, ApplicationCommandType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to update.').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
        var values = [];
        await data.forEach(async value => {
            if (!value.Name) return;
            else {
                values.push(Sheetid = value.Sheetid, Range = value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
            }
        });
        const { logchannelModel } = require('../../Schemas/logchannel');
        let logchannel = null;
        var logdata = await logchannelModel.find({ Guild: interaction.guild.id });
        var logvalues = [];
        await logdata.forEach(async value => {
            if (!value.Channel) return;
            else {
                logvalues.push(logchannel = value.Channel);
            }
        });
        const mentionedUser = interaction.user.id;

        const mentionedUsers = interaction.options.get('user');

        if (!mentionedUsers || !mentionedUsers.user) {
            await interaction.editReply('Please mention a user to update.');
            return;
        }

        async function updateUser(guild, UserId, ranksOnly) {
            let officerNickname = null;
            const rankRoles = [
                { id: '1017642552863764511', pointsRequired: 50 },
                { id: '1017643829958017024', pointsRequired: 100 },
                { id: '1017644230509854760', pointsRequired: 200 },
                { id: '1017644332242702446', pointsRequired: 300 },
                { id: '1017644686124523631', pointsRequired: 500 },
                { id: '1115710853916917820', pointsRequired: 750 },
                { id: '1081669031364399104', pointsRequired: 1000 },
            ];
            let officer = null;

            officer = await guild.members.fetch(UserId);
            officerNickname = officer.nickname || officer.user.username;

            // Remove the timezone information from the nickname
            officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');

            console.log("User's nickname:", officerNickname); // Log user's nickname
            const { google } = require('googleapis');
            const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json', // Use your credentials file
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const range = Range;
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range,
            });
            const values = res.data.values;

            let roleUpdated = false;

            if (values) {
                console.log('Searching in the specified range:');
                let rowIndex;
                let columnIndex;
                let found = false;

                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                    const row = values[rIndex];
                    for (let cIndex = 0; cIndex < row.length; cIndex++) {
                        const currentNickname = row[cIndex];
                        if (currentNickname) {
                            const cleanedCurrentNickname = currentNickname.trim();
                            const officerNicknameLower = officerNickname.trim().toLowerCase();

                            if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                                const ep = values[rIndex][cIndex + 3]; // Log EP
                                console.log(`Searching in the specified range: User found in the sheet.`);
                                console.log(`User's EP: ${ep}`);
                                console.log(`Location: row ${rIndex + 60}, column ${String.fromCharCode(65 + cIndex)}`);

                                // Rest of your code
                                const totalEpColumn = cIndex + 3;
                                const totalEp = parseInt(values[rIndex][totalEpColumn]);
                                var newRankId = null;

                                for (const rankRoleIndex in rankRoles) {
                                    const rankRole = rankRoles[rankRoleIndex];
                                    if (totalEp >= rankRole.pointsRequired) {
                                        newRankId = rankRole.id;
                                    } else {
                                        break;
                                    }
                                }

                                for (const rankRoleIndex in rankRoles) {
                                    const rankRoleId = rankRoles[rankRoleIndex].id;
                                    if (rankRoleId === newRankId) {
                                        if (!officer.roles.cache.has(newRankId)) {
                                            const newRank = await guild.roles.cache.find((role) => role.id === newRankId);

                                            await officer.roles.add(newRank);
                                            console.log(`Added a new rank: ${newRank.name}`);
                                            roleUpdated = true;

                                            const auditLogEmbed = new EmbedBuilder()
                                                .setColor(0xffcc00) // Yellow color
                                                .setTitle('User Rank Update')
                                                .addFields(
                                                    { name: 'User ID', value: `<@${UserId}>`, inline: true },
                                                    { name: 'Previous Rank', value: 'None', inline: true },
                                                    { name: 'New Rank', value: `${newRank.name}`, inline: true },
                                                )
                                                .setTimestamp();

                                            const logChannel = guild.channels.cache.get(logchannel);
                                            if (logChannel.isTextBased()) {
                                                await logChannel.send({ embeds: [auditLogEmbed] });
                                            }
                                        }
                                    } else {
                                        if (officer.roles.cache.has(rankRoleId)) {
                                            const newRank = await guild.roles.cache.find((role) => role.id === newRankId);
                                            const rankRole = await guild.roles.cache.find((role) => role.id === rankRoleId);

                                            await officer.roles.remove(rankRole);
                                            console.log(`Removed rank: ${rankRole.name}`);
                                            roleUpdated = true;

                                            const auditLogEmbed = new EmbedBuilder()
                                                .setColor(0xffcc00) // Yellow color
                                                .setTitle('User Rank Update')
                                                .addFields(
                                                    { name: 'User ID', value: `<@${UserId}>`, inline: true },
                                                    { name: 'Previous Rank', value: `${rankRole.name}`, inline: true },
                                                    { name: 'New Rank', value: `${newRank.name}`, inline: true },
                                                )
                                                .setTimestamp();

                                            const logChannel = guild.channels.cache.get(logchannel);
                                            if (logChannel.isTextBased()) {
                                                await logChannel.send({ embeds: [auditLogEmbed] });
                                            }
                                        }
                                    }
                                }

                                found = true;
                                break;
                            }
                        }
                    }
                    if (found) {
                        break;
                    }
                }

                if (!found) {
                    console.log(`User with Discord nickname "${officerNickname}" not found in the sheet.`);
                }
            }

            return roleUpdated;
        }

        const roleUpdated = await updateUser(interaction.guild, interaction.options.getUser('user').id);

        const resultEmbed = new EmbedBuilder()
            .setColor(roleUpdated ? 0x00ff00 : 0xff0000) // Green for checkmark, Red for X
            .setTitle('Update Complete')
            .setDescription(`Check below for status of update!`)
            .addFields(
                { name: 'Role Updated', value: roleUpdated ? '✅' : '❌', inline: true }
            )
            .setFooter({ text: `update | Points Tracker` }) // Set your bot's name here
            

        await interaction.editReply({ embeds: [resultEmbed] });
    }
}
