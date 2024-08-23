const { SlashCommandBuilder} = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_missing_members')
        .setDescription('Compares Discord nicknames with Roblox group members to find missing users.'),
    async execute(interaction) {
        const ownerid = '721500712973893654'
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== ownerid) {
          const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('⚠️ Permission Denied')
            .setDescription('You do not have the necessary permissions to use this command.')
            .setTimestamp()
            .setFooter({ text: `check_missing_members | Points Tracker` }) // Set your bot's name here
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        try {
            console.log('Command execution started.');

            await interaction.deferReply(); // Defer the reply if the operation takes a while
            console.log('Reply deferred.');

            // Fetch all members from the Discord server
            console.log('Fetching members from the Discord server...');
            const members = await interaction.guild.members.fetch();
            console.log(`Fetched ${members.size} members from the Discord server.`);

            // Process each member's nickname
            console.log('Processing nicknames...');
            const discordNicknames = members.map(member => {
                const cleanedNickname = getNicknameWithoutTimezone(member);
                console.log(`Cleaned nickname: ${cleanedNickname}`);
                return cleanedNickname.toLowerCase(); // Convert to lowercase for case-insensitive comparison
            });

            // Fetch the Roblox group members
            const robloxGroupId = '6652666'; // Replace with your group ID
            console.log(`Fetching Roblox group members for group ID ${robloxGroupId}...`);
            const robloxGroupMembers = await fetchRobloxGroupMembers(robloxGroupId);
            console.log(`Fetched ${robloxGroupMembers.length} members from the Roblox group.`);

            // Find members who are in the Roblox group but not in the Discord server
            console.log('Finding missing members...');
            const missingMembers = robloxGroupMembers.filter(username => {
                const lowerUsername = username.toLowerCase(); // Convert to lowercase for case-insensitive comparison
                const found = discordNicknames.includes(lowerUsername);
                
                if (!found) {
                    console.log(`User "${username}" not found in Discord by nickname, checking Discord username...`);
                    const discordUserFound = members.some(member => 
                        member.user.username.toLowerCase() === lowerUsername
                    );
                    if (discordUserFound) {
                        console.log(`User "${username}" found in Discord by their username.`);
                    }
                    return !discordUserFound;
                }

                return false;
            });

            console.log(`Found ${missingMembers.length} missing members:`, missingMembers);

            // Create an embed to show the results
            console.log('Creating embed...');
            const embed = new EmbedBuilder()
                .setTitle('Missing Members')
                .setDescription(missingMembers.length > 0 
                    ? 'These users are in the Roblox group but not in the Discord server:' 
                    : 'All Roblox group members are in the Discord server.')
                .setColor("Red");

            if (missingMembers.length > 0) {
                embed.addFields(
                    { name: 'Missing Members', value: missingMembers.join('\n').slice(0, 1024) }
                );
            }

            console.log('Sending reply...');
            await interaction.editReply({ embeds: [embed] });
            console.log('Reply sent with the embed.');

        } catch (error) {
            console.error('Error fetching or comparing members:', error);
            await interaction.editReply('An error occurred while processing the command.');
        }
    },
};

function getNicknameWithoutTimezone(user) {
    const nickname = user.nickname || user.user.username;
    const cleanedNickname = nickname.replace(/\s*\[.*\]\s*$/, ''); // Remove the timezone information from the nickname
    return cleanedNickname;
}

async function fetchRobloxGroupMembers(groupId) {
    try {
        let members = [];
        let nextCursor = null;

        do {
            console.log(`Fetching Roblox group members for group ID ${groupId}, cursor: ${nextCursor}...`);
            const response = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/users`, {
                params: {
                    limit: 100, // You can set the limit to 100, which is the maximum per page
                    cursor: nextCursor
                }
            });

            members = members.concat(response.data.data.map(member => member.user.username));
            nextCursor = response.data.nextPageCursor;
            console.log(`Fetched ${response.data.data.length} members from this page. Total members so far: ${members.length}.`);

        } while (nextCursor); // Continue fetching until there's no next page cursor

        console.log(`Finished fetching all members. Total members fetched: ${members.length}`);
        return members;
    } catch (error) {
        console.error(`Error fetching Roblox group members for group ID ${groupId}:`, error);
        throw new Error('Failed to fetch Roblox group members.');
    }
}
