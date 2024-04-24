const { EmbedBuilder } = require('@discordjs/builders');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
const axios = require('axios');
const { REST, Routes } = require('discord.js');





const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('epboard')
        .setDescription('The top weekly and total EP users!'),
    async execute(interaction) {
        var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
        var values = [];
        await data.forEach(async value => {
            if (!value.Name) return;
            else {

                values.push(Sheetid = value.Sheetid, Range = value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
            }
        });

        console.log('Sheet', Sheetid.String);

        await interaction.deferReply({ ephemeral: true });
        console.log('EP Board command started');

        // Debug statement 2: Check if the Google Sheets API is being called
        console.log('Calling Google Sheets API');

        try {
            const { google } = require('googleapis');
            const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json', // Use your credentials file
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            sheets = google.sheets({ version: 'v4', auth });

            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range: Range, // Update the range to include D, L, T, and AB columns
            });

            // Debug statement 3: Check if data is retrieved from Google Sheets
            console.log('Data retrieved from Google Sheets');

            const values = res.data.values;

            if (values) {
                console.log('EP data available');
                const leaderboard = [];
                const weeklyLeaderboard = [];

                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                    const row = values[rIndex];
                    for (let cIndex = 0; cIndex < row.length; cIndex++) {
                        let username = row[cIndex];
                        username = username.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone

                        if (username && username.trim() !== "") {
                            // Calculate the index for total EP column (3 columns over)
                            const totalEpColumnIndex = cIndex + Totaloffset;
                            // Get the total EP from the corresponding column
                            const totalEp = parseInt(row[totalEpColumnIndex]);

                            // Calculate the index for weekly EP column (2 columns over)
                            const weeklyEpColumnIndex = cIndex + Weeklyoffset;
                            // Get the weekly EP from the corresponding column
                            const weeklyEp = parseInt(row[weeklyEpColumnIndex]);

                            if (totalEp > 0) {
                                leaderboard.push({ username, totalEp });
                            }

                            if (weeklyEp > 0) {
                                weeklyLeaderboard.push({ username, weeklyEp });
                            }
                        }
                    }
                }

                // Sort the leaderboards by total EP and weekly EP in descending order
                leaderboard.sort((a, b) => b.totalEp - a.totalEp);
                weeklyLeaderboard.sort((a, b) => b.weeklyEp - a.weeklyEp);

                const embed = new EmbedBuilder();
                embed.setAuthor({
                    name: interaction.user.username
                });
                embed.setTitle('EP Leaderboard');
                embed.setColor(0x00fff6);

                const topWeeklyEpUsers = weeklyLeaderboard.slice(0, 3).map((member, index) => {
                    const { username, weeklyEp } = member;
                    const rankText = getRankText(index);
                    return `${rankText} ${index + 1} - Weekly EP: ${username} (*${weeklyEp} Weekly EP*)`;
                }).join('\n');

                const topTotalEpUsers = leaderboard.slice(0, 3).map((member, index) => {
                    const { username, totalEp } = member;
                    const rankText = getRankText(index);
                    return `${rankText} ${index + 1} - Total EP: ${username} (*${totalEp} EP*)`;
                }).join('\n');

                const description = `**Top Weekly EP Users:**\n${topWeeklyEpUsers}\n\n**Top Total EP Users:**\n${topTotalEpUsers}`;

                embed.setDescription(description);

                embed.setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

                // Make sure to check if the interaction is still valid before replying
                if (!interaction.replied) {
                    await interaction.editReply({ embeds: [embed] });
                }
            } else {
                // Debug statement 4: Check if the data is not found
                console.log('Spreadsheet data not found.');
                // Again, check if the interaction is still valid before replying
                if (!interaction.replied) {
                    await interaction.editReply('Spreadsheet data not found.');
                }
            }
        } catch (error) {
            // Debug statement 5: Check if an error occurs
            console.error('Error fetching data from Google Sheets:', error);

            // Check if the interaction is still valid before replying with an error message
            if (!interaction.replied) {
                await interaction.editReply('An error occurred while fetching data from Google Sheets.');
            }
        }


        // Function to get the corresponding rank text
        function getRankText(index) {
            if (index === 0) {
                return ':first_place:';
            } else if (index === 1) {
                return ':second_place:';
            } else if (index === 2) {
                return ':third_place:';
            } else {
                return `${index + 1}th`;
            }
        }
    },

}
