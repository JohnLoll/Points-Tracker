const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const { google } = require('googleapis');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
const { range } = require('mathjs');
const { logchannelModel } = require('../../Schemas/logchannel');
let logchannel = null;
let reason = null;
let avatar = '';
let isProcessing = false; // Global variable to track command execution state
let officer = null
let guild = null;
module.exports = {
  officer: true,
  data: new SlashCommandBuilder()
    .setName('ep')
    .setDescription('Manage the amount of event points for users.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of event points to add.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for adding event points.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('How would you like to manage the users EP?')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'Add' },
          { name: 'Remove', value: 'Remove' },
        ))
    .addStringOption(option =>
      option.setName('user')
        .setDescription('The user to add/remove EP from.')
        .setRequired(true)),

  async execute(interaction) {
    if (isProcessing) {
      return interaction.reply({
        content: 'Another EP command is currently being processed. Please try again later.',
        ephemeral: true
      });
    }

    isProcessing = true;
    interaction.reply('Please wait...');

    try {
      const mentionedUser = interaction.user.id;
      var logdata = await logchannelModel.find({ Guild: interaction.guild.id });
      var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
      var values = [];
      await data.forEach(async value => {
        if (!value.Name) return;
        else {
          values.push(Sheetid = value.Sheetid, Range = value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
        }
      });
      var logvalues = [];
      await logdata.forEach(async value => {
        if (!value.Channel) return;
        else {
          logvalues.push(logchannel = value.Channel);
        }
      });

      amountToAdd = 0;
      amountToRemove = 0;

      const mentionedUsersString = interaction.options.getString('user');

      // Adjust the regex to match user mentions (IDs) even if there's plain text around them
      const mentionedUsers = mentionedUsersString.match(/<@!?(\d+)>/g)?.map(mention => mention.match(/\d+/)[0]) || [];
      
      function getNicknameWithoutTimezone(user) {
          const nickname = user.nickname || user.user.username;
          return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
      }
      
      reason = interaction.options.getString('reason');
      const action = interaction.options.getString('action');
      
      for (const mentionedUserId of mentionedUsers) {
          amount = interaction.options.getInteger('amount');
          console.log(`Processing mentioned user ID: ${mentionedUserId}`);
          let officerNickname = null;
          try {
              officer = interaction.guild.members.cache.get(mentionedUserId); // No need to trim, as IDs don't have leading/trailing spaces
              officerNickname = getNicknameWithoutTimezone(officer);
              // await modifyEPAndSendDM(officer.user, action === 'Add' ? amount : amount, reason, action.toLowerCase());
              console.log(`Officer nickname: ${officerNickname}`);
          } catch (error) {
              console.error(`Error getting officer nickname: ${error}`);
          }
      
      
        async function modifyEPAndSendDM(user, amount, reason, operation) {
          try {
            // Send DM to the affected user
            const dmChannel = await user.createDM();
            await dmChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`EP ${operation === 'add' ? 'Addition' : 'Removal'}`)
                  .setDescription(`<@${mentionedUser}> ${operation === 'add' ? 'added' : 'removed'} ${amount} EP, for reason: ${reason}`)
                  .setColor(operation === 'add' ? '#00FF00' : '#FF0000') // Green or Red
                  .setTimestamp()
                  .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() // Your provided icon URL
                  })
              ]
            });
          } catch (error) {
            console.error(`Error sending DM to ${user.username}: ${error}`);
          }
        }

        if (action === 'Add') {
          amountToAdd = interaction.options.getInteger('amount');
          await new Promise(resolve => setTimeout(resolve, 2500));
          await addep(officerNickname, amountToAdd)
          async function addep(officerNickname, amountToAdd) {
            try {
               guild = interaction.guild

              const { google } = require('googleapis');

              const range = Range;
              const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json', // Use your credentials file
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
              });
              const sheets = google.sheets({ version: 'v4', auth });
              const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range,
              });

              const values = res.data.values;

              if (values) {
                let rowIndex;
                let found = false;
                let modifiedCells = [];

                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                  rowIndex = rIndex;

                  const row = values[rIndex];

                  for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                    const currentNickname = row[columnIndex];

                    if (currentNickname) {
                      const cleanedCurrentNickname = currentNickname.trim().replace(/[^\w\s]/gi, '');
                      const officerNicknameLower = officerNickname.trim().replace(/[^\w\s]/gi, '').toLowerCase();

                      if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                        const weeklyPointsColumn = columnIndex + Weeklyoffset;
                        const totalPointsColumn = columnIndex + Totaloffset;

                        const currentWeeklyPoints = parseInt(values[rowIndex][weeklyPointsColumn]);
                        const currentTotalPoints = parseInt(values[rowIndex][totalPointsColumn]);

                        const newWeeklyPoints = currentWeeklyPoints + amountToAdd;
                        const newTotalPoints = currentTotalPoints + amountToAdd;

                        values[rowIndex][weeklyPointsColumn] = newWeeklyPoints.toString();
                        values[rowIndex][totalPointsColumn] = newTotalPoints.toString();

                        const weeklyColumnLetter = getColumnLetter(weeklyPointsColumn + 3);
                        const totalColumnLetter = getColumnLetter(totalPointsColumn + 3);

                        modifiedCells.push({
                          range: `${weeklyColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`,
                          values: [[newWeeklyPoints.toString(), newTotalPoints.toString()]],
                        });

                        console.log(`${weeklyColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`);
                        found = true;
                        break;
                      }
                    }
                  }

                  if (found) {
                    break;
                  }
                }
                if (found) {
                  // Update only the modified cells
                  await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: Sheetid,
                    resource: {
                      data: modifiedCells,
                      valueInputOption: 'USER_ENTERED',
                    },
                  });
                } else {
                  console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                  interaction.channel.send(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                  return;
                }
              } else {
                console.log('Spreadsheet data not found.');
              }

            } catch (error) {
              console.error('Error adding points to the spreadsheet:', error);
            }
            console.log(`Added **${amountToAdd}** event points to ${officerNickname}`);
            interaction.channel.send(`Added **${amountToAdd}** Event Points to ${officerNickname}`);
            await updateUser(interaction.guild, officer.user);

          }

        } else if (action === 'Remove') {
          amountToRemove = interaction.options.getInteger('amount');
          await new Promise(resolve => setTimeout(resolve, 2500));
          await addep(officerNickname, amountToRemove)
          async function addep(officerNickname, amountToRemove) {
            try {
              guild = interaction.guild

              const { google } = require('googleapis');

              const range = Range;
              const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json', // Use your credentials file
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
              });
              const sheets = google.sheets({ version: 'v4', auth });
              const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range,
              });

              const values = res.data.values;

              if (values) {
                let rowIndex;
                let found = false;
                let modifiedCells = [];

                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                  rowIndex = rIndex;

                  const row = values[rIndex];

                  for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                    const currentNickname = row[columnIndex];

                    if (currentNickname) {
                      const cleanedCurrentNickname = currentNickname.trim().replace(/[^\w\s]/gi, '');
                      const officerNicknameLower = officerNickname.trim().replace(/[^\w\s]/gi, '').toLowerCase();

                      if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                        const weeklyPointsColumn = columnIndex + Weeklyoffset;
                        const totalPointsColumn = columnIndex + Totaloffset;

                        const currentWeeklyPoints = parseInt(values[rowIndex][weeklyPointsColumn]);
                        const currentTotalPoints = parseInt(values[rowIndex][totalPointsColumn]);

                        const newWeeklyPoints = currentWeeklyPoints - amountToRemove;
                        const newTotalPoints = currentTotalPoints - amountToRemove;

                        values[rowIndex][weeklyPointsColumn] = newWeeklyPoints.toString();
                        values[rowIndex][totalPointsColumn] = newTotalPoints.toString();

                        const weeklyColumnLetter = getColumnLetter(weeklyPointsColumn + 3);
                        const totalColumnLetter = getColumnLetter(totalPointsColumn + 3);

                        modifiedCells.push({
                          range: `${weeklyColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`,
                          values: [[newWeeklyPoints.toString(), newTotalPoints.toString()]],
                        });

                        console.log(`${weeklyColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`);
                        found = true;
                        break;
                      }
                    }
                  }

                  if (found) {
                    break;
                  }
                }
                if (found) {
                  // Update only the modified cells
                  await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: Sheetid,
                    resource: {
                      data: modifiedCells,
                      valueInputOption: 'USER_ENTERED',
                    },
                  });
                } else {
                  console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                  interaction.channel.send(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                  return;
                }
              } else {
                console.log('Spreadsheet data not found.');
              }

            } catch (error) {
              console.error('Error removing points from the spreadsheet:', error);
            }
            console.log(`Removed **${amountToAdd}** Event Points from ${officerNickname}`);
            interaction.channel.send(`Removed **${amountToRemove}** Event Points from ${officerNickname}`);
            await updateUser(interaction.guild, officer.user);

          }
        }

        const { google } = require('googleapis');

        // Set up your authentication and the Google Sheets client
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json', // Use your credentials file
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });
        sheets = google.sheets({ version: 'v4', auth });
        function getColumnLetter(columnIndex) {
          let letter = '';

          while (columnIndex >= 0) {
            const remainder = columnIndex % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            columnIndex = Math.floor(columnIndex / 26) - 1;
          }

          return letter;
        }

      

      }
      if (amountToAdd > 0) {
        guild = interaction.guild

        const logEmbed = {
          color: 0xff0000, // Red color
          title: 'EP Addition Command',
          author: {
            name: mentionedUser.tag,
            icon_url: avatar,
          },
          description: 'Added EP.',
          fields: [
            {
              name: 'Command Issued by',
              value: `<@${mentionedUser}>`,
              inline: true,
            },
            {
              name: 'Users Affected',
              value: `${mentionedUsersString}`,
              inline: true,
            },
            {
              name: 'Amount Added',
              value: `${amountToAdd}`,
              inline: true,
            },
            {
              name: 'Reason',
              value: `${reason}`,
              inline: true,
            },
          ],
          footer: {
            text: 'Command executed',
          },
          timestamp: new Date(),
        };

        // Send the log message to the log channel
        const logChannel = guild.channels.cache.get(logchannel);
        if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
          await logChannel.send({ embeds: [logEmbed] });
        }

      }
      if (amountToRemove > 0) {
        guild = interaction.guild

        const logEmbed = {
          color: 0xff0000, // Red color
          title: 'EP Removal Command',
          author: {
            name: mentionedUser.tag,
            icon_url: avatar,
          },
          description: 'Removed EP.',
          fields: [
            {
              name: 'Command Issued by',
              value: `<@${mentionedUser}>`,
              inline: true,
            },
            {
              name: 'Users Affected',
              value: `${mentionedUsersString}`,
              inline: true,
            },
            {
              name: 'Amount Removed',
              value: `${amountToRemove}`,
              inline: true,
            },
            {
              name: 'Reason',
              value: `${reason}`,
              inline: true,
            },
          ],
          footer: {
            text: 'Command executed',
          },
          timestamp: new Date(),
        };
        // Send the log message to the log channel

        const logChannel = guild.channels.cache.get(logchannel);
        if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
          await logChannel.send({ embeds: [logEmbed] });
        }

      }
    } finally {
      isProcessing = false;
    }
  }
};

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
  sheets = google.sheets({ version: 'v4', auth });
  const range = Range;
  res = await sheets.spreadsheets.values.get({
    spreadsheetId: Sheetid,
    range,
  });
  const values = res.data.values;

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
                  const auditLogEmbed = {
                    color: 0xffcc00, // Yellow color
                    title: 'User Rank Update',
                    fields: [
                      
                      {
                        name: 'User ID',
                        value: `<@${UserId}>`,
                        inline: true,
                      },
                      {
                        name: 'Previous Rank',
                        value: `None`,
                        inline: true,
                      },
                      {
                        name: 'New Rank',
                        value: `${newRank.name}`,
                        inline: true,
                      },
                    ],
                    timestamp: new Date(),
                  };
                  
                  // Send the audit log message to the desired log channel
                  
                  
                              const logChannel = guild.channels.cache.get(logchannel);
                              if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
                                await logChannel.send({ embeds: [auditLogEmbed] });
                              }
                }
              } else {
                if (officer.roles.cache.has(rankRoleId)) {
                  const newRank = await guild.roles.cache.find((role) => role.id === newRankId);
                  const rankRole = await guild.roles.cache.find((role) => role.id === rankRoleId);
                  
                  await officer.roles.remove(rankRole);
                  console.log(`Removed rank: ${rankRole.name}`);
                  const auditLogEmbed = {
                    color: 0xffcc00, // Yellow color
                    title: 'User Rank Update',
                    fields: [
                     
                      {
                        name: 'User ID',
                        value: `<@${UserId}>`,
                        inline: true,
                      },
                      {
                        name: 'Previous Rank',
                        value: `${rankRole.name}`,
                        inline: true,
                      },
                      {
                        name: 'New Rank',
                        value: `${newRank.name}`,
                        inline: true,
                      },
                    ],
                    timestamp: new Date(),
                  };
                  
                  // Send the audit log message to the desired log channel
                  
                  
                  const logChannel = guild.channels.cache.get(logchannel);
                  if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
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
}