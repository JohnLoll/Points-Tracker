const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
module.exports = {
    
    data: new ContextMenuCommandBuilder()
	.setName('View Event Points')
	.setType(ApplicationCommandType.User),
    async execute(interaction) {
        var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
        var values = [];
                    await data.forEach(async value => {
                        if (!value.Name) return;
                        else {
                           
                            values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                        }
                    });
        let targetUser = interaction.targetUser.id;
      
      // If no user is mentioned, use the user who sent the command
      if (!targetUser) {
          targetUser = interaction.member;
      }
  
      const officer = await interaction.guild.members.fetch(targetUser);
      let officerNickname = officer.nickname || officer.user.username;
  
      // Remove the timezone information from the nickname
      officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
  
  
      // Debug statement 1: Check if the command starts
      console.log('Command started');
  
      // Debug statement 2: Check if the Google Sheets API is being called
      console.log('Calling Google Sheets API');

      // Fetch data from Google Sheets
      try {
          const { google } = require('googleapis');
          const auth = new google.auth.GoogleAuth({
              keyFile: 'credentials.json', // Use your credentials file
              scopes: 'https://www.googleapis.com/auth/spreadsheets',
          });
  
          sheets = google.sheets({ version: 'v4', auth });
  
          const res = await sheets.spreadsheets.values.get({
              spreadsheetId: Sheetid,
          range: Range,
          });
  
          // Debug statement 3: Check if data is retrieved from Google Sheets
          console.log('Data retrieved from Google Sheets');
  
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
                              const totalEp = parseInt(row[cIndex + Totaloffset]); // Get total EP
                              const weeklyEp = parseInt(row[cIndex + Weeklyoffset]); // Get weekly EP
  
                              // Debug statements
                              console.log(`Searching in the specified range: User found in the sheet.`);
                              console.log(`User's Total EP: ${totalEp}`);
                              console.log(`User's Weekly EP: ${weeklyEp}`);
                              console.log(`Location: row ${rIndex + 60}, column ${String.fromCharCode(65 + cIndex)}`);
  
                              // Rest of your code
                              await interaction.reply({ephemeral: true, content:`User ${officerNickname} has **Total EP: ${totalEp}** and **Weekly EP: ${weeklyEp}**.`});
                              return true;
                          }
                      }
                  }
              }
  
              if (!found) {
                  // Debug statement 5: Check if the data is not found
                  console.log(`User with Discord nickname "${officerNickname}" not found in the sheet.`);
                  await interaction.reply(`User with Discord nickname "${officerNickname}" not found in the sheet.`);
              }
          } else {
              // Debug statement 6: Check if the data is not found
              console.log('Spreadsheet data not found.');
              await interaction.reply('Spreadsheet data not found.');
          }
      } catch (error) {
          // Debug statement 7: Check if an error occurs
          console.error('Error fetching data from Google Sheets:', error);
          await interaction.reply('An error occurred while fetching data from Google Sheets.');
      }
    }
}