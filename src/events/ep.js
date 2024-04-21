/*const { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../Schemas/ep');
const EP = require('../Schemas/epSchema');
const {amountToAddep, amountToRemoveep, officerReplying, lookingForReply, msgToReplyep, reason, mentionedUser, avatar} = require('../commands/Event Points/ep.js');
const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
module.exports = {
     name: Events.MessageCreate,
    async execute (msg) {
        var data = await epModel.find({ Guild: Guilds, Name: 'EP' });
        var values = [];
                    await data.forEach(async value => {
                        if (!value.Name) return;
                        else {
                           
                            values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                        }
                    });
        const { google } = require('googleapis');


  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', 
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

  async function addPointsToUserByNickname(spreadsheetId, epmember, amountToAddep, officerNickname) {
    try {
      
      const member = guild.members.cache.get(epmember);
  
      if (member) {
        officerNickname = officerNickname || member.nickname || member.user.username;
        officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
  
        const range = Range;
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json',
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
  
                const newWeeklyPoints = currentWeeklyPoints + amountToAddep;
                const newTotalPoints = currentTotalPoints + amountToAddep;
  
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
            
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              resource: {
                data: modifiedCells,
                valueInputOption: 'USER_ENTERED',
              },
            });
          } else {
            console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
            msg.channel.send(`User with Discord nickname "${officerNickname}" not found in the range: ${range}`);
            return;
          }
        } else {
          console.log('Spreadsheet data not found.');
        }
      } else {
        console.log(`User with Discord ID "${epmember}" not found in the guild.`);
      }
    } catch (error) {
      console.error('Error adding points to the spreadsheet:', error);
    }
    console.log(`Added **${amountToAddep}** event points to ${officerNickname}`);
    msg.channel.send(`Added **${amountToAddep}** event points to ${officerNickname}`);
  }
  

  
  
  async function removePointsToUserByNickname(spreadsheetId, epmember, amountToRemoveep, officerNickname) {
    try {

      const member = guild.members.cache.get(epmember);
  
      if (member) {
        officerNickname = officerNickname || member.nickname || member.user.username;
        officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
  
        const range = Range;
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json', 
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
    
                  const newWeeklyPoints = currentWeeklyPoints - amountToRemoveep;
                  const newTotalPoints = currentTotalPoints - amountToRemoveep;
    
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
         
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              resource: {
                data: modifiedCells,
                valueInputOption: 'USER_ENTERED',
              },
            });
          } else {
            console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
            msg.channel.send(`User with Discord nickname "${officerNickname}" not found in the range: ${range}`);
            return;
          }
        } else {
          console.log('Spreadsheet data not found.');
        }
      } else {
        console.log(`User with Discord ID "${epmember}" not found in the guild.`);
      }
    } catch (error) {
      console.error('Error adding points to the spreadsheet:', error);
    }
    console.log(`Removed **${amountToRemoveep}** event points from ${officerNickname}`);
    msg.channel.send(`Removed event points from ${officerNickname}`);
  }
  
  if (lookingForReply) {
    let processedUsers = 1;
    const mentionedUserIDs = new Set();
    if (msg.author.id === officerReplying && msg.reference != null && msg.reference.messageId === msgToReplyep.id) {
     
      if (amountToAddep > 0) {
        await msgToReplyep.edit({
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: 'Cancel',
                  custom_id: 'cancel_add_ep',
                  disabled: true,
                },
              ],
            },
          ],
          content: `Who would you like to add **${amountToAddep}** event points to? Reply to this with a message mentioning all users.`,
        });
      } else if (amountToRemoveep > 0) {
        await msgToReplyep.edit({
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: 'Cancel',
                  custom_id: 'cancel_remove_ep',
                  disabled: true,
                },
              ],
            },
          ],
          content: `Who would you like to remove **${amountToRemoveep}** event points from? Reply to this with a message mentioning all users.`,
        });
      }
    

      async function processMember(member) {
        const epmember = member.id;
      
        if (epmember === '1169738850592116957' || mentionedUserIDs.has(epmember)) {
          return;
        }
      
        mentionedUserIDs.add(epmember);
   
       
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: Sheetid,
            range: Range,
          });
      
          const values = res.data.values;
      
          if (values) {
            if (amountToAddep > 0) {
              await addPointsToUserByNickname(Sheetid, epmember, amountToAddep);
              
            } else if (amountToRemoveep > 0) {
              await removePointsToUserByNickname(Sheetid, epmember, amountToRemoveep);
            }
          } else {
            console.log('Spreadsheet data not found.');
          }
          await updateUser(guild, epmember);
          processedUsers++; // Increment counter for processed users
          const mentionedMembers = [...msg.mentions.members.values()];
          console.log(`Processing ${mentionedMembers.length} mentioned members.`);
  // Check if all mentioned users have been processed
  console.log(`Processed ${processedUsers} users so far`);
  if (processedUsers === mentionedMembers.length) {
    lookingForReply = false; // Set lookingForReply to false after processing all mentioned members
    console.log('All mentioned users have been processed.');
  }  
        } catch (error) {
          console.error('Error processing member:', error);
        }
      }
      
      async function processMembers() {
        const mentionedMembers = [...msg.mentions.members.values()];
      
        for (const member of mentionedMembers) {
          await new Promise(resolve => setTimeout(resolve, 2500)); // 2500 milliseconds = 2.5 seconds
    await processMember(member);
          
  
        }
      
      }
      
      processMembers();
      
      
  if (amountToAddep > 0){
    const excludedUserID = '1169738850592116957'; // User ID to exclude

const affectedUsers = msg.mentions.members
.filter((member) => member.id !== excludedUserID) // Exclude the specified user
.map((member) => `<@${member.id}>`)
.join(', ');
 
    const logChannelId = '1173429422251057152';
     
   
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
      value: `${affectedUsers}`, 
      inline: true,
    },
    {
      name: 'Amount Added',
      value: `${amountToAddep}`,
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
     const logChannel = guild.channels.cache.get(logChannelId);
    if (logChannel instanceof Discord.TextChannel) { 
      await logChannel.send({ embeds: [logEmbed] });
    }
    
  
  }
  if(amountToRemoveep > 0){
    const excludedUserID = '1169738850592116957'; // User ID to exclude

    const affectedUsers = msg.mentions.members
      .filter((member) => member.id !== excludedUserID) // Exclude the specified user
      .map((member) => `<@${member.id}>`)
      .join(', ');
          const logChannelId = '1173429422251057152';
   
   


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
      value: `${affectedUsers}`, 
      inline: true,
    },
    {
      name: 'Amount Removed',
      value: `${amountToRemoveep}`,
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
  
     const logChannel = guild.channels.cache.get(logChannelId);
    if (logChannel instanceof Discord.TextChannel) { 
      await logChannel.send({ embeds: [logEmbed] });
    }
 
  }
  
    }
  }
    }
}

*/
/*
const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../Schemas/ep');
const EP = require('../Schemas/epSchema');

module.exports = {
  name: Events.MessageCreate,
  async execute(msg) {
    try {
      const guild = msg.guild;
      const Guilds = guild.id;

      // Fetching EP document from MongoDB
      let epDoc = await EP.findOne({}).exec();

      // If EP document not found, create a new one
      if (!epDoc) {
        epDoc = new EP();
      }

      // Extracting data from the EP document
      let { officerReplying, lookingForReply, msgToReplyep, reason, mentionedUser, amountToRemoveep, amountToAddep, avatar } = epDoc;

      var data = await epModel.find({ Guild: Guilds, Name: 'EP' });
      var values = [];
      await data.forEach(async (value) => {
        if (!value.Name) return;
        else {
          values.push((Sheetid = value.Sheetid, (Range = value.Range), (Weeklyoffset = value.Weeklyoffset), (Totaloffset = value.Totaloffset)));
        }
      });
      const { google } = require('googleapis');


      const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json', 
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
    
      async function addPointsToUserByNickname(spreadsheetId, epmember, amountToAddep, officerNickname) {
        try {
          
          const member = guild.members.cache.get(epmember);
      
          if (member) {
            officerNickname = officerNickname || member.nickname || member.user.username;
            officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
      
            const range = Range;
            const auth = new google.auth.GoogleAuth({
              keyFile: 'credentials.json',
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
      
                    const newWeeklyPoints = currentWeeklyPoints + amountToAddep;
                    const newTotalPoints = currentTotalPoints + amountToAddep;
      
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
                
                await sheets.spreadsheets.values.batchUpdate({
                  spreadsheetId,
                  resource: {
                    data: modifiedCells,
                    valueInputOption: 'USER_ENTERED',
                  },
                });
              } else {
                console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                msg.channel.send(`User with Discord nickname "${officerNickname}" not found in the range: ${range}`);
                return;
              }
            } else {
              console.log('Spreadsheet data not found.');
            }
          } else {
            console.log(`User with Discord ID "${epmember}" not found in the guild.`);
          }
        } catch (error) {
          console.error('Error adding points to the spreadsheet:', error);
        }
        console.log(`Added **${amountToAddep}** event points to ${officerNickname}`);
        msg.channel.send(`Added **${amountToAddep}** event points to ${officerNickname}`);
      }
      
    
      
      
      async function removePointsToUserByNickname(spreadsheetId, epmember, amountToRemoveep, officerNickname) {
        try {
    
          const member = guild.members.cache.get(epmember);
      
          if (member) {
            officerNickname = officerNickname || member.nickname || member.user.username;
            officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
      
            const range = Range;
            const auth = new google.auth.GoogleAuth({
              keyFile: 'credentials.json', 
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
        
                      const newWeeklyPoints = currentWeeklyPoints - amountToRemoveep;
                      const newTotalPoints = currentTotalPoints - amountToRemoveep;
        
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
             
                await sheets.spreadsheets.values.batchUpdate({
                  spreadsheetId,
                  resource: {
                    data: modifiedCells,
                    valueInputOption: 'USER_ENTERED',
                  },
                });
              } else {
                console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                msg.channel.send(`User with Discord nickname "${officerNickname}" not found in the range: ${range}`);
                return;
              }
            } else {
              console.log('Spreadsheet data not found.');
            }
          } else {
            console.log(`User with Discord ID "${epmember}" not found in the guild.`);
          }
        } catch (error) {
          console.error('Error adding points to the spreadsheet:', error);
        }
        console.log(`Removed **${amountToRemoveep}** event points from ${officerNickname}`);
        msg.channel.send(`Removed event points from ${officerNickname}`);
      }
      
      if (lookingForReply) {
        let processedUsers = 1;
        const mentionedUserIDs = new Set();
        if (msg.author.id === officerReplying && msg.reference != null && msg.reference.messageId === msgToReplyep.id) {
         
          if (amountToAddep > 0) {
            await msgToReplyep.edit({
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      style: 1,
                      label: 'Cancel',
                      custom_id: 'cancel_add_ep',
                      disabled: true,
                    },
                  ],
                },
              ],
              content: `Who would you like to add **${amountToAddep}** event points to? Reply to this with a message mentioning all users.`,
            });
          } else if (amountToRemoveep > 0) {
            await msgToReplyep.edit({
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      style: 1,
                      label: 'Cancel',
                      custom_id: 'cancel_remove_ep',
                      disabled: true,
                    },
                  ],
                },
              ],
              content: `Who would you like to remove **${amountToRemoveep}** event points from? Reply to this with a message mentioning all users.`,
            });
          }
        
    
          async function processMember(member) {
            const epmember = member.id;
          
            if (epmember === '1169738850592116957' || mentionedUserIDs.has(epmember)) {
              return;
            }
          
            mentionedUserIDs.add(epmember);
       
           
            try {
              const res = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range: Range,
              });
          
              const values = res.data.values;
          
              if (values) {
                if (amountToAddep > 0) {
                  await addPointsToUserByNickname(Sheetid, epmember, amountToAddep);
                  
                } else if (amountToRemoveep > 0) {
                  await removePointsToUserByNickname(Sheetid, epmember, amountToRemoveep);
                }
              } else {
                console.log('Spreadsheet data not found.');
              }
              await updateUser(guild, epmember);
              processedUsers++; // Increment counter for processed users
              const mentionedMembers = [...msg.mentions.members.values()];
              console.log(`Processing ${mentionedMembers.length} mentioned members.`);
      // Check if all mentioned users have been processed
      console.log(`Processed ${processedUsers} users so far`);
      if (processedUsers === mentionedMembers.length) {
        lookingForReply = false; // Set lookingForReply to false after processing all mentioned members
        console.log('All mentioned users have been processed.');
      }  
            } catch (error) {
              console.error('Error processing member:', error);
            }
          }
          
          async function processMembers() {
            const mentionedMembers = [...msg.mentions.members.values()];
          
            for (const member of mentionedMembers) {
              await new Promise(resolve => setTimeout(resolve, 2500)); // 2500 milliseconds = 2.5 seconds
        await processMember(member);
              
      
            }
          
          }
          
          processMembers();
          
          
      if (amountToAddep > 0){
        const excludedUserID = '1169738850592116957'; // User ID to exclude
    
    const affectedUsers = msg.mentions.members
    .filter((member) => member.id !== excludedUserID) // Exclude the specified user
    .map((member) => `<@${member.id}>`)
    .join(', ');
     
        const logChannelId = '1173429422251057152';
         
       
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
          value: `${affectedUsers}`, 
          inline: true,
        },
        {
          name: 'Amount Added',
          value: `${amountToAddep}`,
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
         const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel instanceof Discord.TextChannel) { 
          await logChannel.send({ embeds: [logEmbed] });
        }
        
      
      }
      if(amountToRemoveep > 0){
        const excludedUserID = '1169738850592116957'; // User ID to exclude
    
        const affectedUsers = msg.mentions.members
          .filter((member) => member.id !== excludedUserID) // Exclude the specified user
          .map((member) => `<@${member.id}>`)
          .join(', ');
              const logChannelId = '1173429422251057152';
       
       
    
    
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
          value: `${affectedUsers}`, 
          inline: true,
        },
        {
          name: 'Amount Removed',
          value: `${amountToRemoveep}`,
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
      
         const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel instanceof Discord.TextChannel) { 
          await logChannel.send({ embeds: [logEmbed] });
        }
     
      }
      
        }
      }
    } catch (error) {
      console.error('Error in EP event:', error);
    }
  },
};
*/