const { EmbedBuilder } = require('@discordjs/builders');
let { epModel, Name, Guild, Sheetid, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
const { logchannelModel } = require('../../Schemas/logchannel');
const axios = require('axios');
const { REST, Routes } = require('discord.js');
const Discord = require('discord.js');
let logchannel = null;
let officerNickname = null;


const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  officer: true,
    data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Manage users in the EP and CEP sheets.') .addStringOption(option =>
        option.setName('action')
            .setDescription('How would you like to manage the users in the EP and CEP sheets?')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'Add' },
                { name: 'Remove', value: 'Remove' },
            ))
            /*.addStringOption(option => option.setName('type')
            .setDescription('What type of data would you like to add or remove?')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Event Points',
                    value: 'ep',
                  },
                  {
                    name: 'Company Event Points',
                    value: 'cep',
                  },
                  
            ))
                  */
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
              .setDescription('The user to add/remove from the EP sheet.')
              .setRequired(true)),
  async execute(interaction) {
    interaction.reply('Please wait...');
    var logdata = await logchannelModel.find({ Guild: interaction.guild.id});
      var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
      var values = [];
                  await data.forEach(async value => {
                      if (!value.Name) return;
                      else {
                         
                          values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                      }
                  });
                  var logvalues = [];
                  await logdata.forEach(async value => {
                      if (!value.Channel) return;
                      else {
                         
                          logvalues.push(logchannel = value.Channel);
                      }
                  });
                  function getNicknameWithoutTimezone(user) {
                    const nickname = user.nickname || user.user.username;
                    return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
                    }
                const action = interaction.options.getString('action');
                const type = 'ep'; //interaction.options.getString('type');
                const company = interaction.options.getString('company');
                const mentionedUsersString = interaction.options.getString('user');
                const mentionedUsers = mentionedUsersString.match(/(\d+)/g); // Extract user IDs using regular expression
              
                for (const mentionedUserId of mentionedUsers) {
                  console.log(`Processing mentioned user ID: ${mentionedUserId}`);
                  try {
                    const officer = interaction.guild.members.cache.get(mentionedUserId); // No need to trim, as IDs don't have leading/trailing spaces
                    officerNickname = getNicknameWithoutTimezone(officer);
                    console.log(`Officer nickname: ${officerNickname}`);
                } catch (error) {
                    console.error(`Error sending DM to ${officerNickname}: ${error}`);
                }
                

                
                 if(type === 'cep'){
                    if (action === 'Add') {
                        
                        await AddUser(interaction, company, officerNickname);
                       
                    } else if (action === 'Remove') 

                        await RemoveUser(interaction, company, officerNickname);
                          console.log('User removed from EP sheet successfully');
                          const logEmbed = {
                            color: 0xff0000,
                            title: 'User command.',
                            author: {
                              name: interaction.user.tag,
                              icon_url: interaction.user.avatarURL(),
                            },
                            description: 'User command.',
                            fields: [
                              {
                                name: 'Command Issued by',
                                value: `<@${interaction.user.id}>`,
                                inline: true,
                              },
                              {
                                name: 'User Affected',
                                value: `${officerNickname}`,
                                inline: true,
                              },
                              {
                                name: 'Action',
                                value: `${action}`,
                                inline: true,
                              },
                              {
                                name: 'Type',
                                value: `${type}`,
                                inline: true,
                              },
                              {
                                name: 'Company',
                                value: `${company}`,
                                inline: true,
                              },
                            
                            ],
                            footer: {
                              text: 'Command executed',
                            },
                            timestamp: new Date(),
                          };
                      
                          
                          const guild = interaction.guild
                          const logChannel = guild.channels.cache.get(logchannel);
                          if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
                            await logChannel.send({ embeds: [logEmbed] });
                          }
                      
                    }
                    if(type === 'ep'){
                        if (action === 'Add') {
                            await AddUserep(interaction, company, officerNickname);

                        } else if (action === 'Remove')

                            await RemoveUserep(interaction, officerNickname);
                              console.log('User removed from EP sheet successfully');
                              const logEmbed = {
                                color: 0xff0000,
                                title: 'User command.',
                                author: {
                                  name: interaction.user.tag,
                                  icon_url: interaction.user.avatarURL(),
                                },
                                description: 'User command.',
                                fields: [
                                  {
                                    name: 'Command Issued by',
                                    value: `<@${interaction.user.id}>`,
                                    inline: true,
                                  },
                                  {
                                    name: 'User Affected',
                                    value: `${officerNickname}`,
                                    inline: true,
                                  },
                                  {
                                    name: 'Action',
                                    value: `${action}`,
                                    inline: true,
                                  },
                                  {
                                    name: 'Type',
                                    value: `${type}`,
                                    inline: true,
                                  },
                                ],
                                footer: {
                                  text: 'Command executed',
                                },
                                timestamp: new Date(),
                              };
                          
                              
                              const guild = interaction.guild
                              const logChannel = guild.channels.cache.get(logchannel);
                              if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
                                await logChannel.send({ embeds: [logEmbed] });
                              }

                        }
                                
                 
                }
            }
            }
            async function AddUserep(interaction, company, officerNickname) {
                let { epModel, Name, Guild, Sheetid, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
                var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
                var values = [];
                            await data.forEach(async value => {
                                if (!value.Name) return;
                                else {
                                   
                                    values.push(Sheetid = value.Sheetid, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                                }
                            });
                            let {cepModel, Eprange, Trooperrange} = require('../../Schemas/company');
                            var cepdata = await cepModel.find({ Guild: interaction.guild.id, Name: `${company}` });
                            var cepvalues = [];
                                        await cepdata.forEach(async value => {
                                            if (!value.Name) return;
                                            else {
                                               
                                              cepvalues.push( Eprange =  value.Eprange);
                                            }
                                        });
                try {
                  
                  const { google } = require('googleapis');
                  const auth = new google.auth.GoogleAuth({
                    keyFile: 'credentials.json', // Use your credentials file
                    scopes: 'https://www.googleapis.com/auth/spreadsheets',
                  });
                  const sheets = google.sheets({ version: 'v4', auth });
                  const res = await sheets.spreadsheets.values.get({
                    spreadsheetId: Sheetid,
                    range: Eprange,
                  });
              
                  const values = res.data.values;
              
                  // Find the first empty row in the new company's range
                  let foundEmptyRow = false;
                  let newRowIndex;
              
                  for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
                    const row = values[rowIndex];
              
                    // Check if the first column is empty
                    if (!row[0]) {
                      foundEmptyRow = true;
                      newRowIndex = rowIndex;
              
                      // Set values in the new row
                      const newRow = new Array(values[0].length).fill('');
                      newRow[0] = officerNickname;
                      newRow[Weeklyoffset] = '0';
                      newRow[Totaloffset] = '0';
              
                      // Extract the starting column index, row index, and end column from cepRange
                      const match = Eprange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
              
                      if (!match) {
                        throw new Error('Invalid cepRange format');
                      }
              
                      const startColumn = match[1];
                      const startRow = parseInt(match[2], 10);
                      const endColumn = match[3];
              
                      // Update values in the new row
                      values[newRowIndex] = newRow;
              
                      // Update spreadsheet with modified values
                      await sheets.spreadsheets.values.update({
                        spreadsheetId: Sheetid,
                        range: `${startColumn}${newRowIndex + startRow}:${endColumn}${newRowIndex + startRow}`, // Change only the row index
                        valueInputOption: 'USER_ENTERED',
                        resource: { values: [newRow] }, // Use the modified newRow here
                      });
              
                      break;
                    }
                  }
              
                  if (foundEmptyRow) {
                    // Respond to the interaction
                    await interaction.channel.send(`Added ${officerNickname} to ${company}.`);
                  } else {
                    interaction.channel.send(`No empty row found in the new company's range.`);
                  }
                } catch (error) {
                  console.error(`Error adding user to company ${company}`, error);
                  interaction.channel.send(`Error adding user to company ${company}`, error);
                  throw error;
                }
              }
              async function RemoveUserep(interaction, officerNickname) {
                let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
                var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
      var values = [];
                  await data.forEach(async value => {
                      if (!value.Name) return;
                      else {
                         
                          values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                      }
                  });
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
                    const guild =interaction.guild 
                 
              
                  
              
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
                              const weeklyPointsColumn = columnIndex + Weeklyoffset;
                              const totalPointsColumn = columnIndex + Totaloffset;
              
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
                        interaction.channel.send(`Removed ${officerNickname} from the EP spreadsheet.`);
              
                        return { userNickname, userWeeklyPoints, userTotalPoints, removedNickname };
                      } else {
                        console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                        interaction.channel.send(`User with Discord nickname "${officerNickname}" not found in the EP sheet.`);
                        return null;
                      }
                    } else {
                      console.log('Spreadsheet data not found.');
                      interaction.channel.send('Spreadsheet data not found.');
                      return null;
                    }
                  
                } catch (error) {
                  console.error('Error getting and removing user data:', error);
                  interaction.channel.send('Error getting and removing user data:', error);
                  return null;
                }
              }
              async function AddUser(interaction, company, officerNickname) {
                let { cepModel, Name, Guild, Sheetid, Trooperrange, Ceprange, Weeklyoffset, Totaloffset } = require('../../Schemas/company');
                var data = await cepModel.find({ Guild: interaction.guild.id, Name: `${company}` });
                var values = [];
                            await data.forEach(async value => {
                                if (!value.Name) return;
                                else {
                                   
                                    values.push(Sheetid = value.Sheetid, Ceprange =  value.Trooperrange, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                                }
                            });
                try {
                  
                  const { google } = require('googleapis');
                  const auth = new google.auth.GoogleAuth({
                    keyFile: 'credentials.json', // Use your credentials file
                    scopes: 'https://www.googleapis.com/auth/spreadsheets',
                  });
                  const sheets = google.sheets({ version: 'v4', auth });
                  const res = await sheets.spreadsheets.values.get({
                    spreadsheetId: Sheetid,
                    range: Ceprange,
                  });
              
                  const values = res.data.values;
              
                  // Find the first empty row in the new company's range
                  let foundEmptyRow = false;
                  let newRowIndex;
              
                  for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
                    const row = values[rowIndex];
              
                    // Check if the first column is empty
                    if (!row[0]) {
                      foundEmptyRow = true;
                      newRowIndex = rowIndex;
              
                      // Set values in the new row
                      const newRow = new Array(values[0].length).fill('');
                      newRow[0] = officerNickname;
                      newRow[Weeklyoffset] = '0';
                      newRow[Totaloffset] = '0';
              
                      // Extract the starting column index, row index, and end column from cepRange
                      const match = Ceprange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
              
                      if (!match) {
                        throw new Error('Invalid cepRange format');
                      }
              
                      const startColumn = match[1];
                      const startRow = parseInt(match[2], 10);
                      const endColumn = match[3];
              
                      // Update values in the new row
                      values[newRowIndex] = newRow;
              
                      // Update spreadsheet with modified values
                      await sheets.spreadsheets.values.update({
                        spreadsheetId: Sheetid,
                        range: `${startColumn}${newRowIndex + startRow}:${endColumn}${newRowIndex + startRow}`, // Change only the row index
                        valueInputOption: 'USER_ENTERED',
                        resource: { values: [newRow] }, // Use the modified newRow here
                      });
              
                      break;
                    }
                  }
              
                  if (foundEmptyRow) {
                    // Respond to the interaction
                    interaction.channel.send(`Added ${officerNickname} to the CEP Sheet.`);
                } else {
                    interaction.channel.send(`No empty row found in the CEP Sheet range.`);
                }
            } catch (error) {
                console.error(`Error adding user to CEP Sheet`, error);
                interaction.channel.send(`Error adding user to CEP Sheet`, error);
                throw error;
            }
              }
            

              async function RemoveUser(interaction, company, officerNickname) {
                let { cepModel, Name, Guild, Sheetid, Trooperrange, Ceprange, Weeklyoffset, Totaloffset } = require('../../Schemas/company');
                var data = await cepModel.find({ Guild: interaction.guild.id, Name: company });
                var values = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                        values.push(Sheetid = value.Sheetid, Ceprange = value.Trooperrange, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                    }
                });
                try {
                    const { google } = require('googleapis');
                    const auth = new google.auth.GoogleAuth({
                        keyFile: 'credentials.json', // Use your credentials file
                        scopes: 'https://www.googleapis.com/auth/spreadsheets',
                    });
                    const sheets = google.sheets({ version: 'v4', auth });
                    const res = await sheets.spreadsheets.values.get({
                        spreadsheetId: Sheetid,
                        range: Ceprange,
                    });
            
                    const values = res.data.values;
                    let userRowIndex = -1;
            
                    for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
                        const row = values[rowIndex];
            
                        // Check if the first column matches the officerNickname
                        if (row[0] === officerNickname) {
                            userRowIndex = rowIndex;
                            break;
                        }
                    }
            
                    if (userRowIndex === -1) {
                        interaction.channel.send(`${officerNickname} not found in the CEP Sheet.`);
                        return;
                    }
            
                    // Set the user's nickname to an empty string and weekly and total values to 0
                    values[userRowIndex][0] = '';
                    values[userRowIndex][Weeklyoffset] = '0';
                    values[userRowIndex][Totaloffset] = '0';
            
                    // Extract the starting column index, row index, and end column from cepRange
                    const match = Ceprange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
            
                    if (!match) {
                        throw new Error('Invalid cepRange format');
                    }
            
                    const startColumn = match[1];
                    const startRow = parseInt(match[2], 10);
                    const endColumn = match[3];
            
                    // Update spreadsheet with modified values
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: Sheetid,
                        range: `${startColumn}${userRowIndex + startRow}:${endColumn}${userRowIndex + startRow}`, // Change only the row index
                        valueInputOption: 'USER_ENTERED',
                        resource: { values: [values[userRowIndex]] }, // Use the modified row here
                    });
            
                    // Respond to the interaction
                    interaction.channel.send(`Removed ${officerNickname} from the CEP Sheet.`);
                } catch (error) {
                    console.error(`Error removing user from CEP Sheet: ${error}`);
                    interaction.channel.send(`Error removing user from CEP Sheet: ${error}`);
                    throw error;
                }
            }
            
              