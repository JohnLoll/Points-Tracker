const { SlashCommandBuilder } = require("discord.js");
let { cepModel, Eprange} = require('../../Schemas/company');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
let logchannel = null;
const Discord = require('discord.js');
const { logchannelModel } = require('../../Schemas/logchannel');
module.exports = {
officer: true,
data: new SlashCommandBuilder()
.setName('move')
.setDescription('Move a user to a new company in ep sheet')
.addStringOption(option =>
    option
    .setName('user')
			.setDescription('The user to move')
            .setRequired(true)) 
            .addStringOption(option => option 
                .setName('company')
                .setDescription('the new company')
                .setRequired(true)
                .addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
                { name: 'Dusk Company', value: 'Dusk Company' },
                { name: 'Trooper', value: 'Trooper' },
                { name: 'Storm Company', value: 'Storm Company' },
                { name: 'Initiate', value: 'Initiate'},)),
                
        async execute(interaction) {
          const guild = interaction.guild;
          interaction.reply('Please Wait....')
          var logdata = await logchannelModel.find({ Guild: interaction.guild.id});
          var logvalues = [];
                await logdata.forEach(async value => {
                    if (!value.Channel) return;
                    else {
                       
                        logvalues.push(logchannel = value.Channel);
                    }
                });
          let officerNickname = null;
          function getNicknameWithoutTimezone(user) {
            const nickname = user.nickname || user.user.username;
            return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
            }
             
                 
                  
                 
                  const newCompany = interaction.options.getString('company');
                  const mentionedUsersString = interaction.options.getString('user');
                  const mentionedUsers = mentionedUsersString.match(/(\d+)/g); // Extract user IDs using regular expression
                  var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
                  var values = [];
                              await data.forEach(async value => {
                                  if (!value.Name) return;
                                  else {
                                     
                                      values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                                  }
                              });
              
                 
                              const logEmbed = {
                                color: 0x34c759, // Green color
                                title: 'Move Command',
                                author: {
                                  name: interaction.user.tag,
                                  icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                                },
                                description: 'Moved user(s) in EP sheet.',
                                fields: [
                                  {
                                    name: 'Command Issued by',
                                    value: `<@${interaction.user.id}>`,
                                    inline: true,
                                  },
                                  {
                                    name: 'User Affected',
                                    value: `${mentionedUsersString}`,
                                    inline: true,
                                  },
                                  {
                                    name: 'New Company',
                                    value: `${newCompany}`,
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
                              if (logChannel instanceof Discord.TextChannel) {
                                await logChannel.send({ embeds: [logEmbed] });
                              }
                     
                              for (const mentionedUserId of mentionedUsers) {
                                try {
                                  const officer = interaction.guild.members.cache.get(mentionedUserId); // No need to trim, as IDs don't have leading/trailing spaces
                                  officerNickname = getNicknameWithoutTimezone(officer);
                                  console.log(`Officer nickname: ${officerNickname}`);
                              } catch (error) {
                                  console.error(`Error sending DM to ${officerNickname}: ${error}`);
                              }
                  const userRowData = await getAndRemoveUserData(interaction, Sheetid, officerNickname);
              
                  if (userRowData) {
                    await moveUserToNewCompany(interaction, Sheetid, userRowData, newCompany);
                  } else {
                    interaction.channel.send(`User with Discord nickname "${officerNickname}" not found in the EP Spreadsheet.`);
                  }
                
                              }
             
                  }
}
async function getAndRemoveUserData(interaction, spreadsheetId, officerNickname) {

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
     
      
  
      
      
  
       
        const { google } = require('googleapis');
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json', // Use your credentials file
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: Sheetid,
          range: Range, // Update the range to include D, L, T, and AB columns
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
              spreadsheetId,
              resource: {
                data: modifiedCells,
                valueInputOption: 'USER_ENTERED',
              },
            });
  
            console.log(`Saved user data: Name: ${userNickname}, Weekly: ${userWeeklyPoints}, Total: ${userTotalPoints}`);
            console.log(`Removed nickname: ${removedNickname}`);
  
            return { userNickname, userWeeklyPoints, userTotalPoints, removedNickname };
          } else {
            console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
            interaction.channel.send('User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);')
          
            return null;
          }
        } else {
          console.log('Spreadsheet data not found.');
          interaction.channel.send('Spreadsheet data not found.')
          return null;
        }
      
    } catch (error) {
      console.error('Error getting and removing user data:', error);
      return null;
    }
  }
  
  async function moveUserToNewCompany(interaction, spreadsheetId, userRowData, newCompany) {
    try {
      let { cepModel, Eprange } = require('../../Schemas/company');
      var cepdata = await cepModel.find({ Guild: interaction.guild.id, Name: `${newCompany}` });
      var cepvalues = [];
      await cepdata.forEach(async value => {
        if (!value.Name) return;
        else {
          cepvalues.push(Eprange = value.Eprange);
        }
      });
  
      const { google } = require('googleapis');
      const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json', // Use your credentials file
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      const sheets = google.sheets({ version: 'v4', auth });
  
      console.log(`Spreadsheet ID: ${spreadsheetId}`);
      console.log(`Eprange: ${Eprange}`);
  
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
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
          newRow[0] = userRowData.userNickname;
          
          // Adjust these indexes based on where your Weekly and Total points should go
          const weeklyPointsIndex = 2; // Replace with the actual index for weekly points
          const totalPointsIndex = 3; // Replace with the actual index for total points
  
          newRow[weeklyPointsIndex] = userRowData.userWeeklyPoints.toString();
          newRow[totalPointsIndex] = userRowData.userTotalPoints.toString();
  
          // Extract the starting column index, row index, and end column from Eprange
          const match = Eprange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
  
          if (!match) {
            throw new Error('Invalid Eprange format');
          }
  
          const startColumn = match[1];
          const startRow = parseInt(match[2], 10);
          const endColumn = match[3];
  
          // Log the new row for debugging
          console.log(`New row data:`, newRow);
  
          // Update values in the new row
          values[newRowIndex] = newRow;
  
          // Update spreadsheet with modified values
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${startColumn}${newRowIndex + startRow}:${endColumn}${newRowIndex + startRow}`, // Change only the row index
            valueInputOption: 'USER_ENTERED',
            resource: { values: [newRow] }, // Use the modified newRow here
          });
  
          break;
        }
      }
  
      if (foundEmptyRow) {
        // Respond to the interaction
        await interaction.channel.send(`Moved ${userRowData.userNickname} to ${newCompany}. Weekly: ${userRowData.userWeeklyPoints}, Total: ${userRowData.userTotalPoints}`);
      } else {
        interaction.channel.send(`No empty row found in the new company's range.`);
      }
    } catch (error) {
      console.error('Error moving user to new company:', error);
      throw error;
    }
  }
  
  