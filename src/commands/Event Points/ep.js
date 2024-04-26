
const { SlashCommandBuilder } = require('discord.js');
const Discord = require('discord.js');
const { google } = require('googleapis');


let officerReplying = null;
let lookingForReply = false;
let msgToReplyep = null;
let reason = '';
let mentionedUser = null;
let amountToRemoveep = null;
let amountToAddep = null;
let avatar = '';
module.exports = {
  buttonCustomId: 'cancel_add_ep',
  buttonCustomId: 'cancel_remove_ep',
  data: {
    name: 'ep'
  },
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
        )),

  async execute(client, interaction) {
    const officerCommandTimestamps = {};

    if (interaction.commandName === 'ep') {
      amountToAddep = 0;
      amountToRemoveep = 0;

      const action = interaction.options.getString('action');
      if (action === 'Add') {
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
      } else if (action === 'Remove') {
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
          await interaction.reply({ ephemeral: true, content: `<@${officerReplying}> is currently using an add or remove command, please wait until their finished.` });
          return;
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
    }
  },
  handleResponse: async (client, msg) => {
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
        const guild = client.guilds.cache.get('877869164344262746');
        const member = guild.members.cache.get(epmember);

        if (member) {
          officerNickname = officerNickname || member.nickname || member.user.username;
          officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');


          const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json', // Use your credentials file
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
          });
          const sheets = google.sheets({ version: 'v4', auth });
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
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
                    const weeklyPointsColumn = columnIndex + 2;
                    const totalPointsColumn = columnIndex + 3;

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
        const guild = client.guilds.cache.get('877869164344262746');
        const member = guild.members.cache.get(epmember);

        if (member) {
          officerNickname = officerNickname || member.nickname || member.user.username;
          officerNickname = officerNickname.replace(/\s*\[.*\]\s*$/, '');


          const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json', // Use your credentials file
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
          });
          const sheets = google.sheets({ version: 'v4', auth });
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
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
                    const weeklyPointsColumn = columnIndex + 2;
                    const totalPointsColumn = columnIndex + 3;

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
              spreadsheetId: epSpreadsheetIds,
              range: 'D62:AH550',
            });

            const values = res.data.values;

            if (values) {
              if (amountToAddep > 0) {
                await addPointsToUserByNickname(epSpreadsheetIds, epmember, amountToAddep);

              } else if (amountToRemoveep > 0) {
                await removePointsToUserByNickname(epSpreadsheetIds, epmember, amountToRemoveep);
              }
            } else {
              console.log('Spreadsheet data not found.');
            }
            await updateUser(msg.guild, epmember);

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
          lookingForReply = false;
        }

        processMembers();


        if (amountToAddep > 0) {
          const excludedUserID = '1169738850592116957'; // User ID to exclude

          const affectedUsers = msg.mentions.members
            .filter((member) => member.id !== excludedUserID) // Exclude the specified user
            .map((member) => `<@${member.id}>`)
            .join(', ');
          const guild = client.guilds.cache.get('877869164344262746');
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
        if (amountToRemoveep > 0) {
          const excludedUserID = '1169738850592116957'; // User ID to exclude

          const affectedUsers = msg.mentions.members
            .filter((member) => member.id !== excludedUserID) // Exclude the specified user
            .map((member) => `<@${member.id}>`)
            .join(', ');
          const guild = client.guilds.cache.get('877869164344262746');
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

  },

};