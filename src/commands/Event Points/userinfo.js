const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { google } = require('googleapis');
const Cooldown = require('../../Schemas/cooldownSchema'); // Path to your schema
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');
const inactivityRoleId = '1027684343495262208';
const cooldownRoleId = '896777084721041419';
const your_channel_id = '943983420290256966';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View the user\'s information.')
    .addUserOption(option => option.setName('user').setDescription('The user to get the info of.').setRequired(false)),
  async execute(interaction) {
    // Fetch EP data settings from your database
    var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
    var values = [];
    await data.forEach(async value => {
      if (!value.Name) return;
      else {
        values.push(Sheetid = value.Sheetid, Range = value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
      }
    });

    // Initialize variables for EP data
    let totalEps = 0;
    let weeklyEps = 0;
    
    let userFound = false; // Initialize userFound to false

    // Determine the target user
    let targetUser = interaction.options.getMember('user') || interaction.member;
    if (!targetUser) {
      targetUser = interaction.member;
    }

    await interaction.deferReply();
    const officer = interaction.guild.members.cache.get(targetUser.id);
    const officerNickname = officer.nickname || officer.user.username;
    const officerNicknameWithoutTimezone = officerNickname.replace(/\s*\[.*\]\s*$/, '');

    // Function to fetch EP data from Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json', // Use your credentials file
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = Range; // Make sure Range is defined correctly

    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: Sheetid,
        range,
      });

      const values = res.data.values;

      if (values) {
        console.log('Searching in the specified range:');
        for (let rIndex = 0; rIndex < values.length; rIndex++) {
          const row = values[rIndex];
          for (let cIndex = 0; cIndex < row.length; cIndex++) {
            const currentNickname = row[cIndex];
            const currentNicknameWithoutTimezone = currentNickname.replace(/\s*\[.*\]\s*$/, '');
            if (currentNicknameWithoutTimezone) {
              const cleanedCurrentNickname = currentNicknameWithoutTimezone.trim();
              const officerNicknameLower = officerNicknameWithoutTimezone.trim().toLowerCase();
              if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                totalEps = parseInt(row[cIndex + Totaloffset]);
                weeklyEps = parseInt(row[cIndex + Weeklyoffset]);
                console.log('User found in the sheet');
                console.log('User\'s Total EP:', totalEps);
                console.log('User\'s Weekly EP:', weeklyEps);
                const robloxUsername = officerNicknameWithoutTimezone; // Assuming this gives the Roblox username
                const userIdResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
                  usernames: [robloxUsername]
                });
                const robloxUserId = userIdResponse.data.data[0].id;
                const friendsCountResponse = await axios.get(`https://friends.roblox.com/v1/users/${robloxUserId}/friends/count`);
                const followersCountResponse = await axios.get(`https://friends.roblox.com/v1/users/${robloxUserId}/followers/count`);

                const friendsCount = friendsCountResponse.data.count || 'N/A';
                const followersCount = followersCountResponse.data.count || 'N/A';

                const joinDate = officer.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                // Fetching weekly event hosting data
                const channel = interaction.guild.channels.cache.get(your_channel_id);
                if (!channel) {
                  await interaction.editReply('Error: The specified channel does not exist.');
                  return;
                }

                // Calculate the start of the current week (Sunday)
                const today = new Date();
                const dayOfWeek = today.getDay();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - dayOfWeek);

                const messages = await channel.messages.fetch({ limit: 100 }).catch(err => {
                  console.error('Error fetching messages:', err);
                  interaction.editReply('An error occurred while fetching messages from the channel.');
                  return;
                });

                if (!messages) return;

                const eventMessages = messages.filter(msg => 
                  msg.author.id === targetUser.id && 
                  !msg.attachments.some(att => att.contentType && att.contentType.startsWith('image')) && 
                  msg.createdAt >= startOfWeek
                );

                const weeklyEventsHosted = eventMessages.size;

                // Fetch inactivity data
                const now = new Date();
                let inactivityInfo = 'N/A';
                const cooldownData = await Cooldown.findOne({ User: targetUser.id, Guild: interaction.guild.id });
            
                if (cooldownData) {
                    let timeLeft;
                    let roleType;
            
                    if (targetUser.roles.cache.has(cooldownRoleId)) {
                        // User has the cooldown role
                        timeLeft = cooldownData.EndTime - now;
                        roleType = 'Inactivity Notice';
                    } else if (targetUser.roles.cache.has(inactivityRoleId)) {
                        // User has the inactivity role
                        timeLeft = cooldownData.InactivityEndTime - now;
                        roleType = 'Inactivity Notice Cooldown';
                    }
                    
                    if (timeLeft > 0) {
                        inactivityInfo = `${roleType}: ${formatDuration(timeLeft)} left.`;
                    } else {
                        inactivityInfo = `${roleType} should have already been removed. Please check manually.`;
                    }
                } else {
                    inactivityInfo = 'N/A';
                }

                const fields = [
                  { name: 'Username', value: officerNicknameWithoutTimezone, inline: true },
                  { name: 'Roblox ID', value: robloxUserId, inline: true },
                  { name: 'Discord', value: `<@${targetUser.id}>`, inline: true },
                  { name: ' ', value: ' ', inline: false },
                  { name: 'Statistics', value: `Friends: ${friendsCount}\nFollowers: ${followersCount}\nJoin Date: ${joinDate}`, inline: false },
                  { name: ' ', value: ' ', inline: false },
                  { name: 'Weekly EP', value: weeklyEps.toString(), inline: true },
                  { name: 'Total EP', value: totalEps.toString(), inline: true },
                  { name: 'Inactivity Status', value: inactivityInfo, inline: false }
                ];

                // Only add the 'Weekly Company Events Hosted' field if the user has the specific role
                if (targetUser.roles.cache.has('900476279164383242')) {
                  fields.push({ name: 'Weekly Company Events Hosted', value: weeklyEventsHosted.toString(), inline: true });
                }

                console.log('Location: row', rIndex + 60, 'column', String.fromCharCode(65 + cIndex));
                userFound = true;

                // Create the user information embed
                await interaction.editReply({
                  embeds: [{
                    title: `User Information | ${officerNicknameWithoutTimezone}`,
                    color: 0x00FF00,
                    fields: fields,
                    footer: { text: 'userinfo | Points Tracker' }, // Set your bot's name here
                  }]
                });
              }
            }
          }
        }
      }

      if (!userFound) {
        const robloxUsername = officerNicknameWithoutTimezone; // Assuming this gives the Roblox username
        const userIdResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
          usernames: [robloxUsername]
        });
        const robloxUserId = userIdResponse.data.data[0].id;
        const friendsCountResponse = await axios.get(`https://friends.roblox.com/v1/users/${robloxUserId}/friends/count`);
        const followersCountResponse = await axios.get(`https://friends.roblox.com/v1/users/${robloxUserId}/followers/count`);

        const friendsCount = friendsCountResponse.data.count || 'N/A';
        const followersCount = followersCountResponse.data.count || 'N/A';

        const joinDate = officer.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        const fields = [
          { name: 'Username', value: officerNicknameWithoutTimezone, inline: true },
          { name: 'Roblox ID', value: robloxUserId, inline: true },
          { name: 'Discord', value: `<@${targetUser.id}>`, inline: true },
          { name: ' ', value: ' ', inline: false },
          { name: 'Statistics', value: `Friends: ${friendsCount}\nFollowers: ${followersCount}\nJoin Date: ${joinDate}`, inline: false },
          { name: ' ', value: ' ', inline: false },
          { name: 'Weekly EP', value: 'N/A', inline: true },
          { name: 'Total EP', value: 'N/A', inline: true },
          { name: 'Inactivity Status', value: 'N/A', inline: false }
        ];

        await interaction.editReply({
          embeds: [{
            title: `User Information | ${officerNicknameWithoutTimezone}`,
            color: 0xFF0000,
            fields: fields,
            footer: { text: 'userinfo | Points Tracker' }, // Set your bot's name here
          }]
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      await interaction.editReply('An error occurred while fetching data.');
    }
  }
};

// Utility function to format the duration in hours, minutes, and seconds
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}
