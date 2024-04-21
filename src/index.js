const { Channel } = require('diagnostics_channel');
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, Events, Partials, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, DefaultDeviceProperty, ChannelType, AttachmentBuilder } = require(`discord.js`);
const fs = require('fs');
const Discord = require('discord.js');
const internal = require('stream');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Message, Partials.Channel, Partials.Reaction] }); 
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('./Schemas/ep');
client.commands = new Collection();

require('dotenv').config();
/*
let officerReplying = null;
let lookingForReply = false;
let msgToReplyep = null;
let reason = '';
let mentionedUser = null;
let amountToRemoveep = null;
let amountToAddep = null;
let avatar = '';
let guild = null;
let Guilds = null*/
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
// Import necessary modules and classes


const path = require('path');
let botDisabled = false;
// Create a new Discord client


// Create a collection to store commands
client.commands = new Collection();

// Create a Map to store guild states
const guildStates = new Map();

// Create a Map to store button custom IDs and their associated commands
const buttonCommands = new Map();

// Read command files


for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join('./src/commands', folder)).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', folder, file));

    if (command.data) {
      client.commands.set(command.data.name, command);

      // Check if the command has a buttonCustomId and associate it with the command instance
      if (command.buttonCustomId) {
        buttonCommands.set(command.buttonCustomId, command);
      }
    } else {
      console.error(`[WARNING] Invalid command file: ${file}`);
    }
  }
}
const commandContexts = new Map();
// Event handler for when the bot is ready
client.once(Events.ClientReady, () => {
  console.log('Ready!');
});
/*
// Event handler for when an interaction occurs
client.on(Events.InteractionCreate, async interaction => {
  if (botDisabled && interaction.user.id !== '721500712973893654') {
    await interaction.reply({ ephemeral: true, content: 'The BARC points bot is currently disabled. Please contact <@721500712973893654> with any concerns.' });
    return;
  }
  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
  if (command) {
    // Retrieve or create the guild state
    let guildState = guildStates.get(interaction.guild.id);
    if (!guildState) {
      guildState = {
        // initialize your state variables here
      };
      guildStates.set(interaction.guild.id, guildState);
    }

    // Store the command context
    commandContexts.set(interaction.user.id, { command: command.data.name, guildState });

    await command.execute(client, interaction, guildState);
  } else {
    console.error(`No command matching ${interaction.commandName} was found.`);
  }
    } else if (interaction.isButton()) {
      // Handle button interactions
      const buttonCustomId = interaction.customId;

      // Check if the customId corresponds to a command
      const command = buttonCommands.get(buttonCustomId);

      if (command) {
        // Retrieve or create the guild state
        let guildState = guildStates.get(interaction.guild.id);
        if (!guildState) {
          guildState = {
            // initialize your state variables here
          };
          guildStates.set(interaction.guild.id, guildState);
        }

        await command.execute(client, interaction, guildState);
      } else {
        console.error(`No command found for button customId ${buttonCustomId}.`);
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});
*/
client.on('messageCreate', async (msg) => {
  const allowedUserIds = ['721500712973893654', '409425749695791104', '1032153067501658113'];

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
  }
  if (msg.content.toLowerCase() === 'spong') {
    // Respond with a mention to @Frosty
    msg.channel.send('<@254920969758572544> Happy Birthday!! :kiss:'); 
}
  // Check if the message is a response to a command
  const commandContext = commandContexts.get(msg.author.id);
  if (commandContext) {
    // Get the command
    const command = client.commands.get(commandContext.command);

    if (command && command.handleResponse) {
      // Handle the response
      await command.handleResponse(client, msg, commandContext.guildState);
    } else {
      console.error(`No command found for message response ${commandContext.command}.`);
    }
  }
});
// Read the bot token from the config file and login



client.on(Events.MessageCreate, async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.content.includes("https://discord.com/channels/")) {

        try {
            const regex = message.content.match(/https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/);
            const [, channelId, messageId] = regex;
            const directmessage = await message.channel.messages.fetch(messageId);

            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({ name: directmessage.author.username, iconURL: directmessage.author.avatarURL()})
            .setDescription(directmessage.content)

            const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('View Message')
                .setURL(regex[0])
                .setStyle(ButtonStyle.Link)
            );

            await message.reply({ embeds: [embed], components: [button] });
        } catch (e) {
            return console.log(e);
        }

    } else {
        return;
    }

});

//nqn

/*
client.on(Events.MessageCreate, async msg => {
    if (!msg.guild) return;
    if (msg.author.bot) return;
    var data = await epModel.find({ Guild: Guilds, Name: 'EP' });
    var values = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                       
                        values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                    }
                });

 
    const regex = await message.content.match(/<a:[a-zA-Z0-9_]+:[0-9]+>/g);
    
    if (regex) {
        const ID = await message.content.match(/(?<=<a:.*:)(\d+)(?=>)/g);
        const emoji = await message.guild.emojis.fetch(ID).catch(err => {});

        if (emoji) {
            const member = await message.guild.members.fetch(message.author.id);
            console.log(member.premiumSubscriptionCount)
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

  
  async function addPointsToUserByNickname(spreadsheetId, epmember, amountToAddep, officerNickname) {
    try {
      
      const member = guild.members.cache.get(epmember);
  
      if (member) {
        officerNickname = officerNickname || member.nickname || member.user.username;
        officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');
  
        const range = Range
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json', // Use your credentials file
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });
        const sheets = google.sheets({ version: 'v4', auth });
        console.log(Sheetid)
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
            // Update only the modified cells
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
            // Update only the modified cells
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
            console.log(Sheetid)
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
          //await updateUser(msg.guild, epmember);
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
          await new Promise(resolve => setTimeout(resolve, 2500)); // 3000 milliseconds = 3 seconds
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
    if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
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
    if (logChannel instanceof Discord.TextChannel) { // Use 'Discord.TextChannel' to check if it's a text channel
      await logChannel.send({ embeds: [logEmbed] });
    }
 
  }
  
    }
  }
  
});
*/

//mod user
/*
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.guild) return;
    const commandName = interaction.commandName;
    const officerCommandTimestamps = new Map();

// Officer commands
if (interaction.commandName === 'ep') {
  amountToAddep = 0;
  amountToRemoveep = 0;
 Guilds = interaction.guild.id;
  
    const action = interaction.options.getString('action');
    if( action === 'Add') {
    if (!lookingForReply) {
          await interaction.deferReply();
          var msg = await interaction.editReply({
              components: [
                  {
                      type: 1,
                      components: [
                          {
                              type: 2,
                              style: 1,
                              label: 'Cancel',
                              custom_id: 'cancel_add_ep'
                          }
                      ]
                  }
              ],
              content: `Who would you like to add **${interaction.options.getInteger('amount')}** event points to? Reply to this with a message with all users pings.`
          });
          lookingForReply = true;
          officerReplying = interaction.user.id;
          msgToReplyep = msg;
          amountToAddep = interaction.options.getInteger('amount');
          reason = interaction.options.getString('reason');
          console.log('Amount to Add:', amountToAddep);
          mentionedUser = interaction.user.id;
          avatar = interaction.user.displayAvatarURL({ dynamic: true });
          guild = interaction.guild;
          // Record the timestamp when the command was initiated
          officerCommandTimestamps.set(interaction.user.id, Date.now());

          const timeoutId = setTimeout(() => {
              if (lookingForReply) {
                  lookingForReply = false;
                  msgToReplyep.edit({
                      components: [
                          {
                              type: 1,
                              components: [
                                  {
                                      type: 2,
                                      style: 1,
                                      label: 'Cancel',
                                      custom_id: 'cancel_add_ep',
                                      disabled: true
                                  }
                              ]
                          }
                      ],
                      content: `Who would you like to add **${amountToAddep}** event points to? Reply to this with a message with all users pings. <@${interaction.user.id}> Command Timed Out.`,
                  });
                  amountToAddep = 0;
              }
              officerCommandTimestamps.delete(interaction.user.id);
          }, 5 * 60 * 1000);

          // Store the timeout ID for cleanup
          officerCommandTimestamps.set(`${interaction.user.id}_timeout`, timeoutId);

          return;
      } else {
          await interaction.editReply({ ephemeral: true, content: `<@${officerReplying}> is currently using an add or remove command, please wait until they're finished.` });
          return;
      }
    } else if (action ==='Remove') {
      if (!lookingForReply) {
        await interaction.deferReply();
        var msg = await interaction.editReply({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: 'Cancel',
                            custom_id: 'cancel_remove_ep'
                        }
                    ]
                }
            ],
            content: `Who would you like to remove **${interaction.options.getInteger('amount')}** event points from? Reply to this with a message with all users pings.`
        });
        lookingForReply = true;
        officerReplying = interaction.user.id;
        msgToReplyep = msg;
        amountToRemoveep = interaction.options.getInteger('amount');
        reason = interaction.options.getString('reason');
        console.log('Amount to Remove:', amountToRemoveep);
mentionedUser = interaction.user.id;
avatar = interaction.user.displayAvatarURL({ dynamic: true }),
        // Record the timestamp when the command was initiated

        officerCommandTimestamps[interaction.user.id] = Date.now();
        

// Set a timeout to reset officerReplying after 5 minutes
setTimeout(() => {
  lookingForReply = false;
  msgToReplyep.edit({
    components: [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 1,
                    label: 'Cancel',
                    custom_id: 'cancel_remove_ep',
                    disabled: true
                }
            ]
        }
    ],
    content: `Who would you like to remove **${amountToRemoveep}** event points from? Reply to this with a message with all users pings. <@${interaction.user.id}> Looks like you forgot to respond to the command, what a bad Commissioned Officer. Don't worry your secret is safe with me. `,
});
amountToRemoveep = 0;
  return;
}, 5 * 60 * 1000);
        return;
        
    } else {
      await interaction.reply({ephemeral: true, content: `<@${officerReplying}> is currently using an add or remove command, please wait until their finished.`});
        return;
    }
    }
 
}

if (interaction.customId === "cancel_add_ep") {

        lookingForReply = false;
        await interaction.message.edit({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: 'Cancel',
                            custom_id: 'cancel_add_ep',
                            disabled: true
                        }
                    ]
                }
            ],
            content: `Who would you like to add **${amountToAddep}** event points to? Reply to this with a message all users pings.`
        });
        await interaction.reply(`Cancelled by <@${interaction.user.id}>`);
        amountToAddep = 0;
        return;
    
}

if (interaction.customId === "cancel_remove_ep") {
   
        lookingForReply = false;
        await interaction.message.edit({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: 'Cancel',
                            custom_id: 'cancel_remove_ep',
                            disabled: true
                        }
                    ]
                }
            ],
            content: `Who would you like to remove **${amountToRemoveep}** event points from? Reply to this with a message all users pings.`
        });
        await interaction.reply(`Cancelled by <@${interaction.user.id}>`);
        amountToRemoveep = 0;
        return;
    
}
    
    /*if (interaction.customId !== "Moderate") return;
    
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
*/
const puppeteer = require('puppeteer');
const { im } = require('mathjs');
client.on(Events.MessageCreate, async message => {
    if (message.channel.type !== ChannelType.DM) return;
    if (message.author.bot) return;

    var value;
    await message.channel.sendTyping();
    setTimeout(async () => {
        if (!value) await message.channel.sendTyping();
    }, 10000);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://chat-app-f2d296.zapier.app/');

    const textBoxSelector = 'textarea[aria-label="chatbot-user-prompt"]';
    await page.waitForSelector(textBoxSelector);
    await page.type(textBoxSelector, message.content);

    await page.keyboard.press("Enter");

    await page.waitForSelector('[data-testid="final-bot-response"] p').catch(err => {
        return;
    });

    value = await page.$$eval('[data-testid="final-bot-response"]', async (elements) => {
        return elements.map((element) => element.textContent);
    });

    await browser.close();

    value.shift()

    const output = value.join('\n\n\n\n');
    if (output.length > 2000) {
        const chunks = output.match(/.{1,2000}/g);

        for (let i = 0; i < chunks.length; i++) {
            await message.author.send(chunks[i]).catch(err => {
                console.log(err)
                message.author.send("I can't find what you are looking for right now.").catch(err => {});
            });
        } 
    } else {
        await message.author.send(output).catch(err => {
            message.author.send("I can't find what you are looking for right now.").catch(err => {});
        });
    }

});

