const { EmbedBuilder } = require('@discordjs/builders');
let { epModel,Sheetid, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
let { cepModel, Weeklycolumoffset, Totalcolumoffset,} = require('../../Schemas/company');
const { logchannelModel } = require('../../Schemas/logchannel');
const axios = require('axios');
const { REST, Routes } = require('discord.js');
const Discord = require('discord.js');
let logchannel = null;
let officerNickname = null;
let  cepSheetid = null;
let cepWeeklyoffset = null;
let cepTotaloffset = null;
let cepRange = null;
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    companyhicom: true,
    data: new SlashCommandBuilder()
    .setName('discharge')
    .setDescription('Discharge a user from the EP and CEP sheets.')
            .addStringOption(option => option.setName('company')
            .setDescription('Specify the company to add or remove users from.')
            .setRequired(true)
            .addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
            { name: 'Dusk Company', value: 'Dusk Company' },
            { name: 'Trooper', value: 'Trooper' },
            { name: 'Storm Company', value: 'Storm Company' },
            { name: 'Initiate', value: 'Initiate'},))
            .addStringOption(option =>
              option.setName('user')
              .setDescription('The user to Discharge.')
              .setRequired(true)),
  async execute(interaction) {
    let Dischargetotalcep = 0; 
let Dischargetotalep = 0; 
    var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
      var values = [];
      await data.forEach(async value => {
        if (!value.Name) return;
        else {
          values.push(Sheetid = value.Sheetid, Range = value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
        }
      });
      const guild = interaction.guild;
      var valuez = [];
      var datas = await cepModel.find({ Guild: interaction.guild.id, Name: interaction.options.getString('company') });
      await datas.forEach(async value => {
        if (!value.Name) return;
        valuez.push(cepSheetid = value.Sheetid, cepRange = value.Ceprange, Officerstart = value.Officerstart, Weeklycolumoffset = value.Weeklycolumoffset, Totalcolumoffset = value.Totalcolumoffset, cepWeeklyoffset = value.Weeklyoffset, cepTotaloffset = value.Totaloffset);
      });
        const mentionedUsersString = interaction.options.getString('user');
        const mentionedUsers = mentionedUsersString.match(/(\d+)/g); // Extract user IDs using regular expression
        const company = interaction.options.getString('company');
        const mentionedUser = interaction.user.id;
        const avatar = interaction.user.displayAvatarURL({ dynamic: true });
        await interaction.deferReply({ ephemeral: true });
    
        if (!mentionedUsers || mentionedUsers.length === 0) {
          interaction.reply({ ephemeral: true, content: 'No users mentioned.' });
          return;
        }
        function getNicknameWithoutTimezone(user) {
            const nickname = user.nickname || user.user.username;
            return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
            }
        for (const mentionedUserId of mentionedUsers) {
          const officer = interaction.guild.members.cache.get(mentionedUserId);
          if (!officer) {
            interaction.reply({ ephemeral: true, content: `User with ID ${mentionedUserId} not found.` });
            continue;
          }
          const officerNickname = getNicknameWithoutTimezone(officer);
    
          await RemoveUser(Sheetid, officerNickname);
    
          
    
         
    
          // Call the function with the provided values
          await removeUserFromSheet(cepSheetid, officerNickname, cepRange, cepTotaloffset, cepWeeklyoffset);
          async function removeUserFromSheet(spreadsheetId, officerNickname, cepRange, totalnum, weeklynum) {
            try {
                const { google } = require('googleapis');
                const auth = new google.auth.GoogleAuth({
                  keyFile: 'credentials.json',
                  scopes: 'https://www.googleapis.com/auth/spreadsheets',
                });
              const sheets = google.sheets({ version: 'v4', auth });
              const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: cepRange,
              });
            
              const values = res.data.values;
            
              console.log('Searching for Discord nickname:', officerNickname);
            
              if (values) {
                console.log('Searching in the specified range:');
                let rowIndex;
                let found = false;
            
                for (let rIndex = 0; rIndex < values.length; rIndex++) {
                  rowIndex = rIndex; // Store rowIndex
                  const row = values[rIndex];
            
                  const cleanedCurrentNickname = row[0] ? row[0].trim().replace(/[^\w\s]/gi, '') : '';
            
                  if (cleanedCurrentNickname.toLowerCase() === officerNickname.toLowerCase()) {
                    console.log(`Match found at row ${rIndex + 60}`);
                    found = true;
                    break;
                  }
                }
            
                if (found) {
                  // Remove the username and set weekly and total points to zero
                  values[rowIndex][0] = ''; // Remove the username
                  values[rowIndex][weeklynum] = '0'; // Set weekly points to zero
                  values[rowIndex][totalnum] = '0'; // Set total points to zero
                  Dischargetotalcep = totalnum
                  await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: cepRange,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values },
                  });
            
                  console.log('Saved spreadsheet');
                  console.log('Found user at row:', rowIndex + 60);
                  await interaction.editReply(`Removed ${officerNickname} from the CEP sheet.`);
                } else {
                  console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                  interaction.editReply(`User with Discord nickname "${officerNickname}" not found in the CEP sheet.`);
                }
              } else {
                console.log('Spreadsheet data not found.');
            interaction.editReply('Spreadsheet data not found.');
              }
            } catch (error) {
              console.error('Error removing user from the spreadsheet:', error);
              interaction.editReply('Error removing user from the spreadsheet.');
            }
            }
          const logChannelId = '1173429422251057152';
          const logEmbed = {
            color: 0xff0000,
            title: 'Discharge command.',
            author: {
              name: mentionedUser.tag,
              icon_url: avatar,
            },
            description: 'Discharged User from BARC.',
            fields: [
              {
                name: 'Command Issued by',
                value: `<@${mentionedUser}>`,
                inline: true,
              },
              {
                name: 'User Affected',
                value: `${officerNickname}`,
                inline: true,
              },
              {
                name: 'Company',
                value: `${company}`,
                inline: true,
              },
              {
                name: 'Total EP',
                value: `${Dischargetotalep}`,
                inline: true,
              },
              {
                name: 'Total CEP',
                value: `${Dischargetotalcep}`,
                inline: true,
              },
            ],
            footer: {
              text: 'Command executed',
            },
            timestamp: new Date(),
          };
    
          // Send the log message to the log channel
         
          const logChannel = guild.channels.cache.get(logChannelId);
          if (logChannel instanceof Discord.TextChannel) {
            await logChannel.send({ embeds: [logEmbed] });
          }
          async function RemoveUser(spreadsheetId, officerNickname) {

            function getColumnLetter(columnIndex) {
              let letter = '';
            
              while (columnIndex >= 0) {
                const remainder = columnIndex % 26;
                letter = String.fromCharCode(65 + remainder) + letter;
                columnIndex = Math.floor(columnIndex / 26) - 1;
              }
            
              return letter;
            }
            try {
              
             
          
              
          
                const range = Range;
                const { google } = require('googleapis');
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
                  let userNickname;
                  let userWeeklyPoints;
                  let userTotalPoints;
                  let removedNickname;
          
                  for (let rIndex = 0; rIndex < values.length; rIndex++) {
                    rowIndex = rIndex;
          
                    const row = values[rIndex];
          
                    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                      const currentNickname = row[columnIndex];
          
                      if (currentNickname) {
                        const cleanedCurrentNickname = currentNickname.trim().replace(/[^\w\s]/gi, '');
                        const officerNicknameLower = officerNickname.trim().replace(/[^\w\s]/gi, '').toLowerCase();
          
                        if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                          const weeklyPointsColumn = columnIndex +2;
                          const totalPointsColumn = columnIndex + 3;
          
                          userNickname = cleanedCurrentNickname;
                          userWeeklyPoints = parseInt(values[rowIndex][weeklyPointsColumn]);
                          userTotalPoints = parseInt(values[rowIndex][totalPointsColumn]);
                          Dischargetotalep = userTotalPoints;
                          console.log('User Data:', {
                            userNickname,
                            userWeeklyPoints,
                            userTotalPoints,
                            weeklyPointsColumn,
                            totalPointsColumn,
                          });
          
                          // Set nickname, weekly, and total points in variables
                          const newWeeklyPoints = '0';
                          const newTotalPoints = '0';
          
                          // Save the removed nickname
                          removedNickname = cleanedCurrentNickname;
          
                          // Update sheet with zero points and empty nickname
                          values[rowIndex][weeklyPointsColumn] = newWeeklyPoints.toString();
          values[rowIndex][totalPointsColumn] = newTotalPoints.toString();
          values[rowIndex][columnIndex] = ''; // Set nickname to an empty string
          
          const usernameColumnLetter = getColumnLetter(columnIndex + 3);
          const weeklyColumnLetter = getColumnLetter(weeklyPointsColumn + 3);
          const totalColumnLetter = getColumnLetter(totalPointsColumn + 3);
          
          console.log('Update Range:', {
            weeklyColumnLetter,
            totalColumnLetter,
            rowIndex,
          });
          
          modifiedCells.push({
            range: `${usernameColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`,
            values: [['', newWeeklyPoints.toString(), newTotalPoints.toString(), newTotalPoints.toString()]],
          });
          console.log(`${usernameColumnLetter}${rowIndex + 62}:${totalColumnLetter}${rowIndex + 62}`)
          
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
          
                 
                    console.log(`Removed nickname: ${removedNickname}`);
                    interaction.editReply(`Removed ${officerNickname} from the EP spreadsheet.`);
          
                    return { userNickname, userWeeklyPoints, userTotalPoints, removedNickname };
                  } else {
                    console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                   interaction.editReply(`User with Discord nickname "${officerNickname}" not found in the EP sheet.`);
                    return null;
                  }
                } else {
                  console.log('Spreadsheet data not found.');
                  interaction.editReply('Spreadsheet data not found.');
                  return null;
                }
              
            } catch (error) {
              console.error('Error getting and removing user data:', error);
              interaction.editReply('Error getting and removing user data:', error);
              return null;
            }
           
          }
        }
    }
  }
