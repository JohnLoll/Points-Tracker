const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const request = require('node-superfetch');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutualfriends')
        .setDescription('Find mutual friends between two Roblox users')
        .addStringOption(option => 
            option.setName('userid1')
                .setDescription('The first user\'s Roblox ID')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('userid2')
                .setDescription('The second user\'s Roblox ID')
                .setRequired(true)),
        
    async execute(interaction) {
        await interaction.deferReply();

        const userId1 = interaction.options.getString('userid1');
        const userId2 = interaction.options.getString('userid2');

        if (userId1 === userId2) {
            return interaction.editReply({ content: 'You cannot use the same ID for both users.', ephemeral: true });
        }

        try {
            const person1Name = await getUsername(userId1);
            const person2Name = await getUsername(userId2);

            const person1Friends = await getFriends(userId1);
            const person2Friends = await getFriends(userId2);

            const mutualFriends = person1Friends.data.filter(friend1 =>
                person2Friends.data.some(friend2 => friend2.name === friend1.name)
            );

            const mutualFriendsList = mutualFriends.map((friend, index) => {
                return `**${index + 1}.** ${friend.name} (Account Date: ${moment(new Date(friend.created)).format('MM/DD/YYYY')})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Mutual Friends')
                .setDescription(`Mutual friends between **${person1Name}** and **${person2Name}**`)
                .setColor(0x00fff6)
                .addFields(
                    { name: 'Total Mutual Friends', value: `${mutualFriends.length}`, inline: true },
                    { name: 'Mutual Friends List', value: mutualFriendsList || 'No mutual friends found.', inline: false }
                )
                .setFooter({ text: `friendchecker | Points Tracker` }) // Set your bot's name here

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while retrieving mutual friends. Please try again later.', ephemeral: true });
        }
    }
};

async function getFriends(id) {
    try {
        const { body } = await request.get(`https://friends.roblox.com/v1/users/${id}/friends`);
        return body;
    } catch (e) {
        handleError(e);
    }
}

async function getUsername(id) {
    try {
        const { body } = await request.get(`https://users.roblox.com/v1/users/${id}`);
        return body.name;
    } catch (e) {
        handleError(e);
    }
}

function handleError(e) {
    if (e.message.toLowerCase().includes('404')) {
        throw new Error('Invalid user ID.');
    } else if (e.message.toLowerCase().includes('400')) {
        throw new Error('One of the users is either banned or invalid.');
    } else {
        throw e;
    }
}
