const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Update User')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
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

        await interaction.deferReply({ ephemeral: true });

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

            let officer = await guild.members.fetch(UserId);
            officerNickname = officer.nickname || officer.user.username;
            officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
            console.log("User's nickname:", officerNickname);

            const { google } = require('googleapis');
            const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            const sheets = google.sheets({ version: 'v4', auth });
            const range = Range;
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range,
            });

            const values = res.data.values;
            if (values) {
                console.log('Searching in the specified range:');
                let rowIndex, columnIndex, found = false, rankChanged = false;
                let previousRank = 'None', newRank = 'None';

                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                    const row = values[rIndex];
                    for (let cIndex = 0; cIndex < row.length; cIndex++) {
                        const currentNickname = row[cIndex];
                        if (currentNickname) {
                            const cleanedCurrentNickname = currentNickname.trim();
                            const officerNicknameLower = officerNickname.trim().toLowerCase();
                            if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                                const ep = values[rIndex][cIndex + 3];
                                console.log(`User found in the sheet. EP: ${ep}, Location: row ${rIndex + 60}, column ${String.fromCharCode(65 + cIndex)}`);
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
                                            newRank = await guild.roles.cache.find((role) => role.id === newRankId);
                                            await officer.roles.add(newRank);
                                            rankChanged = true;
                                            console.log(`Added a new rank: ${newRank.name}`);

                                            const auditLogEmbed = new EmbedBuilder()
                                                .setColor(0xffcc00) // Yellow color
                                                .setTitle('User Rank Update')
                                                .addFields(
                                                    { name: 'User ID', value: `<@${UserId}>`, inline: true },
                                                    { name: 'Previous Rank', value: previousRank, inline: true },
                                                    { name: 'New Rank', value: newRank.name, inline: true }
                                                )
                                                .setTimestamp();

                                            const logChannel = guild.channels.cache.get(logchannel);
                                            if (logChannel && logChannel.isText()) {
                                                await logChannel.send({ embeds: [auditLogEmbed] });
                                            }
                                        }
                                    } else {
                                        if (officer.roles.cache.has(rankRoleId)) {
                                            const rankRole = await guild.roles.cache.find((role) => role.id === rankRoleId);
                                            await officer.roles.remove(rankRole);
                                            previousRank = rankRole.name;
                                            console.log(`Removed rank: ${rankRole.name}`);
                                            rankChanged = true;

                                            const auditLogEmbed = new EmbedBuilder()
                                                .setColor(0xffcc00) // Yellow color
                                                .setTitle('User Rank Update')
                                                .addFields(
                                                    { name: 'User ID', value: `<@${UserId}>`, inline: true },
                                                    { name: 'Previous Rank', value: previousRank, inline: true },
                                                    { name: 'New Rank', value: newRank.name, inline: true }
                                                )
                                                .setTimestamp();

                                            const logChannel = guild.channels.cache.get(logchannel);
                                            if (logChannel && logChannel.isText()) {
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

                return rankChanged;
            }
        }

        const rankChanged = await updateUser(interaction.guild, interaction.targetUser.id);

        const embed = new EmbedBuilder()
            .setColor(rankChanged ? 0x00FF00 : 0xFF0000)
            .setTitle('Update Complete')
            .setDescription(`Check below for status of update!`)
            .addFields(
                { name: 'Status', value: rankChanged ? '✅ Rank changed' : '❌ No rank change' }
            )
            .setFooter({ text: `update | Points Tracker` }) // Set your bot's name here

        await interaction.editReply({ embeds: [embed] });
        return;
    }
}
