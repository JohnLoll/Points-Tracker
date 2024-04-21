const { SlashCommandBuilder } = require("discord.js");
let { cepModel, Eprange} = require('../../Schemas/company');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
module.exports = {
    officer: true,
data: new SlashCommandBuilder()
.setName('move')
.setDescription('Move a user to a new company in ep sheet')
.addUserOption(option =>
    option
    .setName('user')
			.setDescription('The user to move')
            .setRequired(true)) 
            .addStringOption(option => option 
                .setName('company')
                .setDescription('the new company')
                .setRequired(true)),
        async execute(interaction) {
          function getNicknameWithoutTimezone(user) {
            const nickname = user.nickname || user.user.username;
            return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
            }
                try {
                  const selectedUser = interaction.options.getUser('user');
                  const officer = interaction.guild.members.cache.get(selectedUser.id);
                  const officerNickname = getNicknameWithoutTimezone(officer);
                  const newCompany = interaction.options.getString('company');
              
                  var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
                  var values = [];
                              await data.forEach(async value => {
                                  if (!value.Name) return;
                                  else {
                                     
                                      values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                                  }
                              });
              
                 
                    
                     
                    
                   
                  const userRowData = await getAndRemoveUserData(interaction, Sheetid, officer.id, officerNickname);
              
                  if (userRowData) {
                    await moveUserToNewCompany(interaction, Sheetid, userRowData, newCompany);
                  } else {
                    interaction.reply(`User with Discord nickname "${officerNickname}" not found in the old company.`);
                  }
                
                } catch (error) {
                  console.error('Error during move command:', error);
                  interaction.reply('An error occurred during the removeepuser command:', error);
                }
             
                  }
}
async function getAndRemoveUserData(interaction, spreadsheetId, epmember, officerNickname) {

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
      const guild = interaction.guild;
      
      const member = guild.members.cache.get(epmember);
  
      if (member) {
        officerNickname = officerNickname || member.nickname || member.user.username;
        officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
  
       
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
          
            return null;
          }
        } else {
          console.log('Spreadsheet data not found.');
          return null;
        }
      } else {
        console.log(`User with Discord ID "${epmember}" not found in the guild.`);
        return null;
      }
    } catch (error) {
      console.error('Error getting and removing user data:', error);
      return null;
    }
  }
  
  async function moveUserToNewCompany(interaction, spreadsheetId, userRowData, newCompany) {
    try {
     
      var data = await cepModel.find({ Guild: interaction.guild.id, Name: newCompany });
                  var valuez = [];
                              await data.forEach(async value => {
                                  if (!value.Name) return;
                                  else {
                                     
                                      valuez.push(Eprange =  value.Eprange);
                                  }
                              });
      const { google } = require('googleapis');
      const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json', // Use your credentials file
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      const sheets = google.sheets({ version: 'v4', auth });
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
          newRow[Weeklyoffset] = userRowData.userWeeklyPoints;
          newRow[Totaloffset] = userRowData.userTotalPoints;
  
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
        await interaction.reply(`Moved ${userRowData.userNickname} to ${newCompany}. Weekly: ${userRowData.userWeeklyPoints}, Total: ${userRowData.userTotalPoints}`);
      } else {
        interaction.reply(`No empty row found in the new company's range.`);
      }
    } catch (error) {
      console.error('Error moving user to new company:', error);
      throw error;
    }
  }