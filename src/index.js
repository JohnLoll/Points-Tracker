const { Channel } = require('diagnostics_channel');
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, Events, Partials, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, DefaultDeviceProperty, ChannelType, AttachmentBuilder } = require(`discord.js`);
const fs = require('fs');
const internal = require('stream');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessages], partials: [Partials.Message, Partials.Channel, Partials.Reaction] }); 
const axios = require('axios');
let { cepModel, Eprange, Officerstart} = require('./Schemas/company');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('./Schemas/ep');
client.commands = new Collection();
let botDisabled = false;
require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();


client.on(Events.MessageCreate, async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    
    

});

const Cooldown = require('./Schemas/cooldownSchema'); // Path to your schema


// Role IDs
const cooldownRoleId = '896777084721041419'; // Replace with your actual cooldown role ID
const inactivityRoleId = '1027684343495262208'; // Replace with your actual inactivity role ID

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const currentDateTime = new Date();
  const activeCooldowns = await Cooldown.find({ EndTime: { $gt: currentDateTime } });

  activeCooldowns.forEach(async (cooldown) => {
    const guild = client.guilds.cache.get(cooldown.Guild);
    if (!guild) return;

    const member = guild.members.cache.get(cooldown.User);
    if (!member) return;

    const remainingCooldownTime = cooldown.EndTime - currentDateTime;
    const remainingInactivityTime = cooldown.InactivityEndTime - cooldown.EndTime;

    // Re-schedule role removals and additions
    setTimeout(async () => {
      await member.roles.remove(cooldownRoleId);
      await member.roles.add(inactivityRoleId);

      setTimeout(async () => {
        await member.roles.remove(inactivityRoleId);
        await Cooldown.findOneAndDelete({ User: cooldown.User, Guild: cooldown.Guild });
      }, remainingInactivityTime);
    }, remainingCooldownTime);
  });
});

// Function to get the nickname without timezone
function getNicknameWithoutTimezone(user) {
    const nickname = user.nickname || user.user.username;
    return nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
}
async function UpdateUserNickname( oldNickname, newNickname) {
  let { epModel, Name, Guild, Sheetid, Range } = require('./Schemas/ep');
  var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
  var values = [];
  await data.forEach(async value => {
      if (!value.Name) return;
      else {
          values.push(Sheetid = value.Sheetid, Range = value.Range);
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

          for (let rIndex = 0; rIndex < values.length; rIndex++) {
              rowIndex = rIndex;

              const row = values[rIndex];

              for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                  const currentNickname = row[columnIndex];

                  if (currentNickname) {
                      const cleanedCurrentNickname = currentNickname.trim().replace(/[^\w\s]/gi, '');
                      const oldNicknameLower = oldNickname.trim().replace(/[^\w\s]/gi, '').toLowerCase();

                      if (cleanedCurrentNickname.toLowerCase() === oldNicknameLower) {
                          // Update the nickname to the new nickname
                          values[rowIndex][columnIndex] = newNickname;

                          const usernameColumnLetter = getColumnLetter(columnIndex + 3);

                          console.log('Update Range:', {
                              usernameColumnLetter,
                              rowIndex,
                          });

                          modifiedCells.push({
                              range: `${usernameColumnLetter}${rowIndex + 62}:${usernameColumnLetter}${rowIndex + 62}`,
                              values: [[newNickname]], // Set the new nickname
                          });

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
              // Update only the modified cells with the new nickname
              await sheets.spreadsheets.values.batchUpdate({
                  spreadsheetId: Sheetid,
                  resource: {
                      data: modifiedCells,
                      valueInputOption: 'USER_ENTERED',
                  },
              });

              console.log(`Updated nickname from ${oldNickname} to ${newNickname} in the EP spreadsheet.`);
              //interaction.channel.send(`Updated ${oldNickname} to ${newNickname} in the EP spreadsheet.`);

              return { oldNickname, newNickname };
          } else {
              console.log(`User with Discord nickname "${oldNickname}" not found in the spreadsheet.`);
              //interaction.channel.send(`User with Discord nickname "${oldNickname}" not found in the EP sheet.`);
              return null;
          }
      } else {
          console.log('Spreadsheet data not found.');
          //interaction.channel.send('Spreadsheet data not found.');
          return null;
      }

  } catch (error) {
      console.error('Error getting and updating user data:', error);
      //interaction.channel.send('Error getting and updating user data:', error);
      return null;
  }
}

// Function to check for nickname changes
const nicknameCache = {}; // Initialize at the top level

function checkNicknameChanges(guild) {
    guild.members.fetch().then(members => {
        members.forEach(member => {
            const oldNickname = nicknameCache[member.id];
            const newNickname = member.nickname || member.user.username;

            // Only consider a nickname change if there's a previously cached nickname
            if (oldNickname && oldNickname !== newNickname) {
                // Log the old and new nicknames without timezone info
                const oldNicknameCleaned = getNicknameWithoutTimezone({ nickname: oldNickname });
                const newNicknameCleaned = getNicknameWithoutTimezone({ nickname: newNickname });

                console.log(`Nickname change detected for ${member.user.tag}`);
                console.log(`Old: ${oldNicknameCleaned}`);
                console.log(`New: ${newNicknameCleaned}`);

                // Update the user nickname
                UpdateUserNickname(oldNicknameCleaned, newNicknameCleaned);

                // Update the cache with the new nickname
                nicknameCache[member.id] = newNickname;
            } else if (!oldNickname) {
                // Initialize the cache with the current nickname if not previously cached
                nicknameCache[member.id] = newNickname;
            }
        });
    }).catch(error => {
        console.error('Error fetching members:', error);
    });
}


// Set the interval to check every 5 minutes
client.once('ready', () => {
  
    const guild = client.guilds.cache.get('877869164344262746'); // Replace with your guild ID
    if (guild) {
        console.log(`Bot is ready and checking for nickname changes every 5 minutes.`);
        checkNicknameChanges(guild)
        setInterval(() => checkNicknameChanges(guild), 60 * 1000); // 5 minutes in milliseconds
    }
});
const Audit_Log = require('./Schemas/auditlog');
let cepStatus = '✅';
    let epStatus = '✅';
    let cepStatusnew = '✅';
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'selectLoggingLevel') {
    const selectedLevels = interaction.values;
    const guildId = interaction.guildId;

    await Audit_Log.findOneAndUpdate(
      { Guild: guildId },
      { LogLevel: selectedLevels },
      { new: true, upsert: true }
    );

    const updatedSettings = await Audit_Log.findOne({ Guild: guildId });
    const updatedSettingsList = updatedSettings.LogLevel.length > 0
      ? updatedSettings.LogLevel.map(level => `â€¢ ${level}`).join('\n')
      : 'None selected.';

    const updatedEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("🔧 Audit Log Settings Updated")
      .setDescription(`Your audit log settings have been updated.\n\n**Current Logging Levels:**\n${updatedSettingsList}`)
      .setThumbnail("https://i.imgur.com/PcMoVgq.png")
      .setFooter({ text: "Audit log configuration." })
      .setTimestamp();

      await interaction.update({ embeds: [updatedEmbed] });
  }
});
const GUILD_ID = '877869164344262746';
const ROLE_ID = '1257810777679593502';

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //sendRepeatedMessage();

  const guild = await client.guilds.fetch(GUILD_ID);
  if (!guild) {
      console.error(`Guild with ID ${GUILD_ID} not found.`);
      return;
  }

  // Store members who have the role initially
  let membersWithRole = new Set();

  const updateMembersWithRole = async () => {
    console.log(`Checking for role changes at ${new Date().toLocaleString()}`);
    
    const members = await guild.members.fetch();
    const newMembersWithRole = new Set();

    members.forEach(member => {
        if (member.roles.cache.has(ROLE_ID)) {
            newMembersWithRole.add(member.id);
        }
    });

    // Compare with previous set of members
    membersWithRole.forEach(async memberId => {
        if (!newMembersWithRole.has(memberId)) {
            const member = guild.members.cache.get(memberId);
            console.log(`User ${member.user.tag} lost the role ${ROLE_ID} in guild ${GUILD_ID}`);
            const channelId = '1173429422251057152';
            const channel = client.channels.cache.get(channelId);
      
            channel.send({ embeds: [embed] });
            const newCompany = newRank.name;
            var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
            var values = [];
                        await data.forEach(async value => {
                            if (!value.Name) return;
                            else {
                               
                                values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                            }
                        });
                       
            const userRowData = await getAndRemoveUserData(Sheetid, member);
            await moveUserToNewCompany(Sheetid, userRowData, newCompany);
            // Add any additional actions you want to perform here
            const embed = new EmbedBuilder()
      .setColor("DarkGreen")
      .setTitle('Member passes Initiate')
      .setDescription('A member has passed the initiate stage.')
      .addFields([
        { name: 'Roblox Nickname', value: member.user.nickname },
      
        { name: 'New Rank', value: member.role ? member.role.name : 'N/A' },
        //{ name: 'CEP', value: `Auto moved the user in the Trooper CEP sheet` },
        { name: 'EP', value: `Auto moved the user in the EP sheet ${epStatus}` }
      ])
      .setTimestamp();
     
        }
    });

    // Update the set for the next interval
    membersWithRole = newMembersWithRole;
};


  // Run the update function immediately, then every 3 minutes
  updateMembersWithRole();
  setInterval(updateMembersWithRole, 3 * 60 * 1000);
});
const USER_ID = '365945134988394497'
async function sendRepeatedMessage() {
  try {
      const user = await client.users.fetch(USER_ID);
      if (user) {
          while (true) {
              await user.send('Congrats Ms.Ponds');
              console.log('Message sent to user!');
              // Wait for 5 seconds before sending the next message
              await new Promise(resolve => setTimeout(resolve, 500));
          }
      } else {
          console.log('User not found!');
      }
  } catch (error) {
      console.error('Error sending message:', error);
  }
}

client.on('interactionCreate', async (interaction) => {

  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "selectAuditLogChannel") {
    if (!interaction.guild) return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });

    const selectedChannelId = interaction.values[0];

    try {
      let data = await Audit_Log.findOne({ Guild: interaction.guild.id });

      if (!data) {
        config = await Audit_Log.create({
          Guild: interaction.guild.id,
          Channel: selectedChannelId,
          LogLevel: []
        });
      } else {
        data.Channel = selectedChannelId;
        await data.save();
      }

      await interaction.reply({ content: `Audit log channel has been updated to <#${selectedChannelId}>.`, ephemeral: true });
    } catch (error) {
      console.error("Error updating the audit log channel: ", error);
      await interaction.reply({ content: "There was an error while updating the audit log channel. Please try again later.", ephemeral: true });
    }
  }
});
client.on('messageCreate', async (msg) => {
  const allowedUserIds = ['721500712973893654', '409425749695791104', '365945134988394497', '254920969758572544'];

  if (allowedUserIds.includes(msg.author.id)) {
      if (msg.content.toLowerCase() === 'v!disable') {
          botDisabled = true; 
          await msg.reply('Bot disabled.');
          return;
      }
  
      if (msg.content.toLowerCase() === 'v!enable') {
          botDisabled = false; 
          await msg.reply('Bot enabled.');
          return;
      }
  
      if (msg.content.toLowerCase() === 'v!shutdown') {
          await msg.reply('Shutting down.');
          client.destroy();
          return;
      }
  
      if (msg.content.toLowerCase() === 'v!uptime') {
          await msg.reply(`Uptime is **${uptime/100}** seconds.`);
          return;
      }
      if (msg.content.toLowerCase() === '!servers') {
        const guilds = client.guilds.cache;
        let reply = "I am in the following servers:\n";

        for (const guild of guilds.values()) {
            try {
                const owner = await guild.fetchOwner();
                reply += `**${guild.name}** - Owner: ${owner.user.tag}\n`;
            } catch (error) {
                reply += `**${guild.name}** - Owner: Unknown (couldn't fetch owner)\n`;
            }
        }

        msg.channel.send(reply);
    }
    if (msg.content.startsWith('!leave ')) {
      const guildName = msg.content.slice(7).trim(); // Extract the guild name from the message
      const guild = client.guilds.cache.find(g => g.name === guildName);

      if (!guild) {
          msg.channel.send(`I couldn't find a server with the name "${guildName}".`);
          return;
      }

      try {
          await guild.leave();
          msg.channel.send(`I have left the server "${guildName}".`);
      } catch (error) {
          msg.channel.send(`I couldn't leave the server "${guildName}".`);
          console.error(error);
      }
  }

      if (msg.content.toLowerCase() === 'v!restart') {
        await msg.reply('Restarting......');
        client.destroy(); // Destroy the current client instance
        

    // Optionally, you may want to clear any intervals or timeouts before restarting

    // Re-create a new client instance
    const newClient = new Discord.Client();
    newClient.login(process.env.TOKEN);
        return;
    }
  }
  });

const groupId = '6652666';
let lastMemberData = [];

async function fetchGroupMembers() {
  try {
    const maxMembersPerRequest = 100;
    let allMembers = [];
    let cursor = null; // Start with no cursor

    do {
      const response = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/users`, {
        params: {
          limit: maxMembersPerRequest,
          cursor: cursor // Pass cursor if available
        }
      });
      allMembers = [...allMembers, ...(response.data.data || [])];
      cursor = response.data.nextPageCursor; // Update cursor for the next page
    } while (cursor); // Continue until there's no cursor for the next page

    console.log('Received member data:', allMembers.length);
    return allMembers;
  } catch (error) {
    console.error('Error fetching group members:', error.message);
    throw error;
  }
}

function compareMembers(oldMembers, newMembers) {
  const oldMemberIds = oldMembers.map((member) => member.user.userId);
  const newMemberIds = newMembers.map((member) => member.user.userId);

  const addedMembers = newMembers.filter((member) => !oldMemberIds.includes(member.user.userId));
  const removedMembers = oldMembers.filter((member) => !newMemberIds.includes(member.user.userId));

  return {
    addedMembers,
    removedMembers,
  };
}

function compareRanks(oldMembers, newMembers) {
  const rankUpdates = [];

  newMembers.forEach((newMember) => {
    const oldMember = oldMembers.find((member) => member.user.userId === newMember.user.userId);

    if (oldMember && oldMember.role.name !== newMember.role.name) {
      rankUpdates.push({
        member: newMember.user,
        oldRank: { id: oldMember.role.id, name: oldMember.role.name }, // Store id and name
        newRank: { id: newMember.role.id, name: newMember.role.name }, // Store id and name
      });
    }
  });

  return rankUpdates;
}

async function sendJoinEmbed(member) {
  
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Member Join')
      .setDescription('A member has joined/been accepted!')
      .addFields([
        { name: 'Roblox Username', value: member.user.username },
        { name: 'Roblox ID', value: member.user.userId.toString() },
        { name: 'New Rank', value: member.role ? member.role.name : 'N/A' },
        //{ name: 'CEP', value: `Auto added to Trooper CEP sheet: ${cepStatus}` },
        { name: 'EP', value: `Auto added to EP sheet: ${epStatus}` }
      ])
      .setTimestamp();
      
    const channelId = '1173429422251057152';
    const channel = client.channels.cache.get(channelId);

    // Add user to EP sheet before sending the embed
    await addUserToEP('Initiate', member.user.username);

    await channel.send({ embeds: [embed] });
  
}

async function addUserToEP(company, officerNickname) {
  let { epModel, Name, Guild, Sheetid, Weeklyoffset, Totaloffset } = require('./Schemas/ep');
  var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
  var values = [];
  await data.forEach(value => {
    if (value.Name) {
      values.push({ Sheetid: value.Sheetid, Weeklyoffset: value.Weeklyoffset, Totaloffset: value.Totaloffset });
    }
  });

  let { cepModel, Eprange } = require('./Schemas/company');
  var cepdata = await cepModel.find({ Guild: '877869164344262746', Name: company });
  var cepvalues = [];
  await cepdata.forEach(value => {
    if (value.Name) {
      cepvalues.push({ Eprange: value.Eprange });
    }
  });

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: values[0].Sheetid,
      range: cepvalues[0].Eprange,
    });

    const sheetValues = res.data.values;
    let foundEmptyRow = false;
    let newRowIndex;

    for (let rowIndex = 0; rowIndex < sheetValues.length; rowIndex++) {
      const row = sheetValues[rowIndex];
      if (!row[0]) {
        foundEmptyRow = true;
        newRowIndex = rowIndex;

        const newRow = new Array(sheetValues[0].length).fill('');
        newRow[0] = officerNickname;
        newRow[values[0].Weeklyoffset] = '0';
        newRow[values[0].Totaloffset] = '0';

        const match = cepvalues[0].Eprange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
        if (!match) {
          throw new Error('Invalid cepRange format');
        }

        const startColumn = match[1];
        const startRow = parseInt(match[2], 10);
        const endColumn = match[3];

        sheetValues[newRowIndex] = newRow;

        await sheets.spreadsheets.values.update({
          spreadsheetId: values[0].Sheetid,
          range: `${startColumn}${newRowIndex + startRow}:${endColumn}${newRowIndex + startRow}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [newRow] },
        });

        console.log(`Added ${officerNickname} to ${company}.`);
        epStatus = '✅';
        break;
      }
    }

    if (!foundEmptyRow) {
      console.log('No empty row found in the new company\'s range.');
      epStatus = '❌';
    }
  } catch (error) {
    console.error(`Error adding user to company ${company}:`, error);
    epStatus = '❌';
    throw error;
  }
}




async function sendLeaveEmbed(member, oldRank) {
  
  try {
    console.log('Old Rank:', oldRank); // Log oldRank to inspect its structure

    const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('Detected a member leaving/being kicked')
    .setDescription(`A member has left/been kicked!`)
    .addFields(
      { name: 'Roblox Username', value: member.user.username },
      { name: 'Roblox ID', value: member.user.userId.toString() },
      { name: 'Old Rank', value: oldRank !== undefined ? oldRank : 'N/A' },
      //{ name: 'CEP', value: `Auto removed user from CEP sheet: ${cepStatusnew}` },
      { name: 'EP', value: `Auto removed user from EP sheet: ${epStatus}` }
    )
    .setTimestamp();  

    const channelId = '1173429422251057152';
    const channel = client.channels.cache.get(channelId);
    await RemoveUserep(member.user.username);
    //await RemoveUser(oldRank, member.user.username);
    await channel.send({ embeds: [embed] });
    async function RemoveUserep( officerNickname) {

        let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('./Schemas/ep');
        var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
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
                epStatus = '✅';
                //interaction.editReply(`Removed ${officerNickname} from the EP spreadsheet.`);
      
                return { userNickname, userWeeklyPoints, userTotalPoints, removedNickname };
              } else {
                console.log(`User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);
                epStatus = '❌';
               //interaction.editReply(`User with Discord nickname "${officerNickname}" not found in the EP sheet.`);
                return null;
              }
            } else {
              console.log('Spreadsheet data not found.');
              epStatus = '❌';
              //interaction.editReply('Spreadsheet data not found.');
              return null;
            }
          
        } catch (error) {
          console.error('Error getting and removing user data:', error);
          epStatus = '❌';
          //interaction.editReply('Error getting and removing user data:', error);
          return null;
        }
      }
    
      
  } catch (error) {
    console.error('Error creating or sending embed:', error);
  }

}

async function sendPromotionEmbed(member, oldRank, newRank) {
 
  try {
    
    const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setTitle('Rank Change')
    .setDescription('A member(s) rank has been updated.')
    .addFields([
      { name: 'Roblox Username', value: member|| 'Unknown' },
      { name: 'Old Rank', value: oldRank.name || 'Unknown' },
      { name: 'New Rank', value: newRank.name || 'Unknown' },
      //{ 
        //name: 'CEP Status', 
        //value: `Auto removed user from CEP sheet: ${cepStatusnew || 'Unknown'}\nAuto added user to the new users company(s) CEP sheet: ${cepStatus || 'Unknown'}` 
      //},
      { 
        name: 'EP', 
        value: `Auto moved the user on the EP sheet: ${epStatus || 'Unknown'}` 
      }
    ])
    .setTimestamp();
  const channelId = '1173429422251057152';
    const channel = client.channels.cache.get(channelId);
    const newCompany = newRank.name;
    var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
    var values = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                       
                        values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                    }
                });
               
    const userRowData = await getAndRemoveUserData(Sheetid, member);
    await moveUserToNewCompany(Sheetid, userRowData, newCompany);
  //await AddUser(newRank.name, member);
  //await RemoveUser(oldRank.name, member);
    await channel.send({ embeds: [embed] });
    
    var data = await epModel.find({ Guild: '877869164344262746', Name: 'EP' });
    var valuesep = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                       
                        valuesep.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                    }
                });

   
      
       
   
     
   

    
  } catch (error) {
    console.error('Error creating or sending embed:', error);
  }

}

async function checkMemberEvents() {
  try {
    const newMembers = await fetchGroupMembers();

    if (lastMemberData.length === 0) {
      lastMemberData = newMembers;
      console.log('Initial member data set:', newMembers.map((member) => member.user.username));
      return;
    }

    const { addedMembers, removedMembers } = compareMembers(lastMemberData, newMembers);

    const rankUpdates = compareRanks(lastMemberData, newMembers);
rankUpdates.forEach(({member, oldRank, newRank }) => {
  const minSeconds = 30;
const maxSeconds = 60;
let lastTimeoutMilliseconds = 0;
function generateUniqueTimeout() {
  
  let randomSeconds;
    do {
        randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    } while (Math.abs(randomSeconds * 1000 - lastTimeoutMilliseconds) < 5000);

    lastTimeoutMilliseconds = randomSeconds * 1000;
    return lastTimeoutMilliseconds;
}

const timeoutMilliseconds = generateUniqueTimeout();

setTimeout(async () => {
  console.log('Rank updated:', member.username, 'Old Rank:', oldRank.name, 'New Rank:', newRank.name);
  sendPromotionEmbed(member.username, oldRank, newRank);
}, timeoutMilliseconds);
  
});
  
    addedMembers.forEach((member) => {
    
     let lastTimeoutMilliseconds = 0;

const minSeconds = 30;
const maxSeconds = 60;

function generateUniqueTimeout() {
    let randomSeconds;
    do {
        randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    } while (Math.abs(randomSeconds * 1000 - lastTimeoutMilliseconds) < 5000);

    lastTimeoutMilliseconds = randomSeconds * 1000;
    return lastTimeoutMilliseconds;
}

const timeoutMilliseconds = generateUniqueTimeout();

setTimeout(async () => {
  console.log('Member joined:', member.user.username);
  sendJoinEmbed(member);
}, timeoutMilliseconds);
      
   
  });
  /*
  removedMembers.forEach((member) => {
    console.log('Member left:', member.user.username);
    const oldMember = lastMemberData.find((m) => m.user.userId === member.user.userId);
    sendLeaveEmbed(member, oldMember ? oldMember.role.name : 'N/A');
  
      
  });
  */

  
  
removedMembers.forEach((member) => {

      const minSeconds = 30;
const maxSeconds = 60;
let lastTimeoutMilliseconds = 0;
function generateUniqueTimeout() {
    let randomSeconds;
    do {
        randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    } while (Math.abs(randomSeconds * 1000 - lastTimeoutMilliseconds) < 5000);

  lastTimeoutMilliseconds = randomSeconds * 1000;
    return lastTimeoutMilliseconds;
}

const timeoutMilliseconds = generateUniqueTimeout();

setTimeout(async () => {
  console.log('Member left:', member.user.username);
  const oldMember = lastMemberData.find((m) => m.user.userId === member.user.userId);
  sendLeaveEmbed(member, oldMember ? oldMember.role.name : 'N/A');
}, timeoutMilliseconds);
  

});

         
     
  
  

    lastMemberData = newMembers;
  } catch (error) {
    console.error('Error checking member events:', error.message);
  }
}

function startChecks() {
  setInterval(checkMemberEvents, 3 * 60 * 1000); // 3 minutes interval
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkMemberEvents();
  startChecks();
});
async function AddUser(company, officerNickname) {
  let { cepModel, Name, Guild, Sheetid, Trooperrange, Ceprange, Weeklyoffset, Totaloffset } = require('./Schemas/company');
  var data = await cepModel.find({ Guild: '877869164344262746', Name: `${company}` });
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
          cepStatus = '❌';
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
      console.log(`Added ${officerNickname} to the CEP Sheet.`);
      cepStatus = '✅';
  } else {
     console.log(`No empty row found in the CEP Sheet range.`);
     cepStatus = '❌';
  }
} catch (error) {
  console.error(`Error adding user to CEP Sheet`, error);
  cepStatus = '❌';
  throw error;
}
}

async function RemoveUser(company, officerNickname) {
  let { cepModel, Name, Guild, Sheetid, Trooperrange, Ceprange, Weeklyoffset, Totaloffset } = require('./Schemas/company');
  var data = await cepModel.find({ Guild: '877869164344262746', Name: `${company}` });
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
        console.log(`${officerNickname} not found in the CEP Sheet.`);
        cepStatusnew = '❌';
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
      console.log(`Removed ${officerNickname} from the CEP Sheet.`);
      cepStatusnew = '✅';
  } catch (error) {
      console.error(`Error removing user from CEP Sheet: ${error}`);
      cepStatusnew = '❌';
      throw error;
  }
}


async function getAndRemoveUserData(spreadsheetId, officerNickname) {

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
                const weeklyPointsColumn = columnIndex + 2;
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
          //interaction.channel.send('User with Discord nickname "${officerNickname}" not found in the spreadsheet.`);')
        
          return null;
        }
      } else {
        console.log('Spreadsheet data not found.');
        //interaction.channel.send('Spreadsheet data not found.')
        return null;
      }
    
  } catch (error) {
    console.error('Error getting and removing user data:', error);
    return null;
  }
}

async function moveUserToNewCompany(spreadsheetId, userRowData, newCompany) {
  try {
    let { cepModel, Eprange } = require('./Schemas/company');
    var cepdata = await cepModel.find({ Guild: '877869164344262746', Name: `${newCompany}` });
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
      await console.log(`Moved ${userRowData.userNickname} to ${newCompany}. Weekly: ${userRowData.userWeeklyPoints}, Total: ${userRowData.userTotalPoints}`);
    } else {
     console.log(`No empty row found in the new company's range.`);
    }
  } catch (error) {
    console.error('Error moving user to new company:', error);
    throw error;
  }
}

//nqn
client.on(Events.MessageCreate, async message => {
    if (!message.guild) return;
    if (message.author.bot) return;


 /*
    const regex = await message.content.match(/<a:[a-zA-Z0-9_]+:[0-9]+>/g);
    
    if (regex) {
        const ID = await message.content.match(/(?<=<a:.*:)(\d+)(?=>)/g);
        const emoji = await message.guild.emojis.fetch(ID).catch(err => {});

        if (emoji) {
            const member = await message.guild.members.fetch(message.author.id);
            console.log(member.premiumSubscriptionCount)
        }
    } */
});

//mod user
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.guild) return;
    if (botDisabled && interaction.user.id !== '721500712973893654') {
      await interaction.reply({ ephemeral: true, content: 'The BARC points bot is currently disabled. Please contact <@721500712973893654> with any concerns.' });
      return;
    }
    if (interaction.customId !== "Moderate") return;
    else {
        const string = await interaction.values.toString();

        if (string.includes('ban')) {
            const userId = await interaction.values[0].replace(/ban/g, '');
            const reason = `Moderated by ${interaction.user.id}`;
            const ban = await interaction.guild.bans.create(userId, {reason}).catch(async err => {
                await interaction.reply({ content: `I couldn't ban that user!`, ephemeral: true });
            });

            if (ban) await interaction.reply({ content: `I have banned${userId}!`, ephemeral: true });
        }

        if (string.includes('kick')) {
            const userId = await interaction.values[0].replace(/kick/g, '');
            const member = await interaction.guild.members.fetch(userId);
            const kick = await member.kick({ reason: `Moderated by ${interaction.user.id}`}).catch(async err => {
                await interaction.reply({ content: `I couldn't kick that user!`, ephemeral: true });
            });

            if (kick) await interaction.reply({ content: `I have kicked${userId}!`, ephemeral: true });
        }
    }

});

const puppeteer = require('puppeteer');
const { officer } = require('./commands/Event Points/move');


