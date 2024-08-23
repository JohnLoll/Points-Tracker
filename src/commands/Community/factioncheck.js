const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('factioncheck')
        .setDescription('Check the factions a player is in.')
        .addStringOption(option =>
            option
                .setName('username')
                .setDescription('The username of player who you want to check there faction presence.')
                .setRequired(true)),
    async execute(interaction) {
        const playerName = interaction.options.getString('username');

        try {
            const response = await axios.get('https://groups.roblox.com/v1/groups/33784088/relationships/allies?StartRowIndex=1&MaxRows=100');
            console.log('API Response:', response.data);

            if (response.data && response.data.relatedGroups) {
                const alliedGroups = response.data.relatedGroups;

                const embed = new EmbedBuilder()
                    .setTitle(`Faction Groups | ${playerName}`)
                    .setColor("Green")
                    .setFooter({ text: `factioncheck | Points Tracker` }) 
                const userIdResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
                    usernames: [playerName],
                    excludeBannedUsers: true,
                });

                if (userIdResponse.data && userIdResponse.data.data && userIdResponse.data.data.length > 0) {
                    const userId = userIdResponse.data.data[0].id;

                    const groupResponse = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=false`);
                    console.log('API Response:', groupResponse.data);

                    const userGroups = groupResponse.data.data;

                    for (const groupData of userGroups) {
                        const group = groupData.group;
                        console.log(`Checking user in group ${group.id}`);

                        const isUserInGroup = alliedGroups.some((alliedGroup) => alliedGroup.id === group.id);
                        console.log(`User is ${isUserInGroup ? '' : 'NOT '}in group ${group.id}`);

                        if (isUserInGroup) {
                            embed.addFields({
                                name: group.name,
                                value: `[Link to Group](https://www.roblox.com/groups/${group.id})\nRank: ${groupData.role.name}`,
                            });
                        }
                    }

                    if (embed.data.fields.length === 0) {
                        embed.setDescription('User is not in any allied groups.');
                    }

                    interaction.reply({ embeds: [embed] });
                } else {
                    console.error('Unexpected API response for user ID:', userIdResponse.data);
                    interaction.reply('An unexpected error occurred while fetching user ID.');
                }
            } else {
                console.error('Unexpected API response:', response.data);
                interaction.reply('An unexpected error occurred while fetching allied groups.');
            }
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while fetching allied groups.');
        }
    }
};
