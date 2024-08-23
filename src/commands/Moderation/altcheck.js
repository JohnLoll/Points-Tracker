
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const NodeCache = require('node-cache'); // Use a cache system

const inventoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // Cache for 1 hour

// Exponential backoff for rate-limited retries
const checkInventoryVisibility = async (userId) => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const maxRetries = 20;
    let attempt = 0;
    let delayTime = 5000; // Start with a 5-second delay

    const cachedInventory = inventoryCache.get(userId); // Check if we already have the result cached
    if (cachedInventory !== undefined) {
        return cachedInventory;
    }

    while (attempt < maxRetries) {
        try {
            const response = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/can-view-inventory`);
            const canView = response.data.canView;
            inventoryCache.set(userId, canView); // Cache the result
            return canView;
        } catch (error) {
            if (error.response && error.response.status === 429) { // Rate limit error
                console.log(`Rate limit exceeded. Retrying in ${delayTime / 1000} seconds... Attempt ${attempt + 1}`);
                await delay(delayTime); // Exponential backoff
                delayTime *= 2; // Double the delay each time
                attempt++;
            } else {
                console.error(`Error checking inventory visibility for userId ${userId}:`, error.response ? error.response.data : error.message);
                throw new Error('Error checking inventory visibility');
            }
        }
    }

    throw new Error('Max retries reached while checking inventory visibility');
};

// Fetch inventory details with improved retry and rate limit handling
const fetchInventory = async (assetTypeId, userId) => {
    let totalCount = 0;
    let nextPageCursor = null;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const makeRequest = async (url, params) => {
        try {
            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Rate limit exceeded. Retrying...');
                await delay(5000); // Wait for 5 seconds before retrying
                return makeRequest(url, params); 
            } else {
                throw error;
            }
        }
    };

    const badgeCreators = {};
    let robloxAccessoryCount = 0;

    do {
        const response = await makeRequest('https://www.roblox.com/users/inventory/list-json', {
            userId,
            assetTypeId,
            cursor: nextPageCursor
        });

        const items = response.Data?.Items || [];

        if (assetTypeId === 34) { // Gamepasses
            const filteredItems = items.filter(item => item.Creator && item.Creator.Id !== userId);
            totalCount += filteredItems.length;
        } else if (assetTypeId === 21) { // Badges
            items.forEach(item => {
                const creatorId = item.Creator?.Id;
                if (creatorId) {
                    if (!badgeCreators[creatorId]) {
                        badgeCreators[creatorId] = 0;
                    }
                    badgeCreators[creatorId]++;
                    if (badgeCreators[creatorId] <= 30) {
                        totalCount++;
                    }
                }
            });
        } else {
            items.forEach(item => {
                if (item.Creator?.Id === 1) { // Roblox-made items have Creator.Id of 1
                    robloxAccessoryCount++;
                } else {
                    totalCount++;
                }
            });
        }

        nextPageCursor = response.Data?.nextPageCursor || null;
    } while (nextPageCursor);

    if (assetTypeId === 8 && robloxAccessoryCount > 5) {
        totalCount += 5; // Cap Roblox accessories at 5
    } else {
        totalCount += robloxAccessoryCount;
    }

    return totalCount;
};



const calculateExpectedValues = (accountAge) => {
    return {
        expectedClothing: accountAge > 2000 ? Math.min(80 + Math.floor(accountAge / 30), 300) : Math.min(50 + Math.floor(accountAge / 50), 200),
        expectedAccessories: accountAge > 2000 ? Math.min(70 + Math.floor(accountAge / 15), 1500) : Math.min(40 + Math.floor(accountAge / 25), 500),
        expectedGamePasses: accountAge > 2000 ? Math.min(50 + Math.floor(accountAge / 30), 600) : Math.min(30 + Math.floor(accountAge / 50), 500),
        expectedBadges: accountAge > 2000 ? Math.min(350 + Math.floor(accountAge / 20), 5000) : Math.min(200 + Math.floor(accountAge / 25), 3000),
        expectedGroups: accountAge > 2000 ? Math.min(40 + Math.floor(accountAge / 70), 250) : Math.min(20 + Math.floor(accountAge / 100), 200)
    };
};


const assessAccount = (accountDetails, metrics) => {
    const { accountAge, clothingCount, accessoryCount, gamepassCount, badgeCount, groupCount } = metrics;
    const { expectedClothing, expectedAccessories, expectedGamePasses, expectedBadges, expectedGroups } = calculateExpectedValues(accountAge);

    let score = 0;

    // Adjusted penalty factors for more sensitive detection
    const ageFactor = accountAge > 2000 ? 0.10 : 0.20;

    // Increased penalties for lower counts
    if (clothingCount < expectedClothing * 0.30) score += 4; // Increase sensitivity
    else if (clothingCount < expectedClothing * 0.50) score += 3;

    if (accessoryCount < expectedAccessories * 0.30) score += 3; 
    else if (accessoryCount < expectedAccessories * 0.50) score += 2;

    if (gamepassCount < expectedGamePasses * 0.30) score += 3; 
    else if (gamepassCount < expectedGamePasses * 0.50) score += 2;

    if (badgeCount < expectedBadges * ageFactor) score += 4; // Increase sensitivity
    else if (badgeCount < expectedBadges * 0.60) score += 3;

    if (groupCount < expectedGroups * ageFactor) score += 3; 
    else if (groupCount < expectedGroups * 0.60) score += 2;

    // Adjusted special handling for high counts
    if (clothingCount > expectedClothing * 1.5) score -= 2;
    if (accessoryCount > expectedAccessories * 1.5) score -= 1;
    if (gamepassCount > expectedGamePasses * 1.5) score -= 2;
    if (badgeCount > expectedBadges * 1.5) score -= 3;
    if (groupCount > expectedGroups * 1.5) score -= 1;

    return score;
};

















const categorizeAlt = (score) => {
    if (score >= 10) return 'High';
    if (score >= 6) return 'Medium';
    return 'Low';
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('detect_alt')
        .setDescription('Detects if a Roblox user might be an alternate account.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Roblox username to check')
                .setRequired(true)
        ),
    async execute(interaction) {
        const ownerid = '721500712973893654';
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== ownerid) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('⚠️ Permission Denied')
                .setDescription('You do not have the necessary permissions to use this command.')
                .setTimestamp()
                .setFooter({ text: 'Points Tracker' });
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await interaction.deferReply();
        


        //const exemptedUserIds = ['292878532', '149898784', '296840366', '591649086'];
            const username = interaction.options.getString('username');
        
        try {
            const userIdResponse = await axios.post('https://users.roblox.com/v1/usernames/users', { usernames: [username] });
            const userId = userIdResponse.data.data[0]?.id?.toString(); 
        
            if (!userId) {
                return interaction.editReply(`User ${username} not found on Roblox.`);
            }
        
            //console.log(`Checking userId: ${userId}`);
        /*
            if (exemptedUserIds.includes(userId)) {
                //console.log(`User ${userId} is exempt`);
                const exemptEmbed = new EmbedBuilder()
                    .setColor('#00ff00') // Green
                    .setTitle('User Exempt')
                    .setDescription('This user is exempt from the alternate account detection.')
                    .setTimestamp()
                    .setFooter({ text: 'Points Tracker' });
                return await interaction.editReply({ embeds: [exemptEmbed] });
            }*/
            const canViewInventory = await checkInventoryVisibility(userId);
            if (!canViewInventory) {
                const privateEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('Inventory Private')
                    .setDescription('The inventory of this user is set to private. I cannot fetch the users inventory details.')
                    .setTimestamp()
                    .setFooter({ text: 'Points Tracker' });
                return await interaction.editReply({ embeds: [privateEmbed] });
            }
            const accountResponse = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
            const accountDetails = accountResponse.data;
            const accountCreatedDate = new Date(accountDetails.created);
            const accountAge = Math.floor((Date.now() - accountCreatedDate) / (1000 * 60 * 60 * 24));

            const [shirtCount, pantsCount, accessoryCount, gamepassCount, badgeCount, groupResponse] = await Promise.all([
                fetchInventory(11, userId), // Fetch Shirts
                fetchInventory(12, userId), // Fetch Pants
                fetchInventory(8, userId),  // Fetch Accessories
                fetchInventory(34, userId), // Fetch Gamepasses
                fetchInventory(21, userId), // Fetch Badges
                axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`) // Fetch Group membership
            ]);
            
            const clothingCount = shirtCount + pantsCount; // Sum shirts and pants to get total clothing count

            const groupCount = groupResponse.data.data.length;

            const [friendsResponse, followingResponse] = await Promise.all([
                axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
                axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`)
            ]);

            const friendsCount = friendsResponse.data.count;
            const followingCount = followingResponse.data.count;

            const metrics = {
                accountAge,
                clothingCount,
                accessoryCount,
                gamepassCount,
                badgeCount,
                groupCount 
            };

            const score = assessAccount(accountDetails, metrics);
            const altCategory = categorizeAlt(score);

            let embedColor;
            if (altCategory === 'High') {
                embedColor = '#FF0000'; // Red
            } else if (altCategory === 'Medium') {
                embedColor = '#FFA500'; // Orange
            } else {
                embedColor = '#00FF00'; // Green
            }

           const embed = new EmbedBuilder()
    .setTitle(`User Analysis: ${username}`)
    .addFields(
        { name: 'Account Age', value: `${accountAge} days`, inline: true },
        { name: 'Clothing Count', value: `${clothingCount}`, inline: true },
        { name: 'Accessories Count', value: `${accessoryCount}`, inline: true },
        { name: 'Game Passes Count', value: `${gamepassCount}`, inline: true },
        { name: 'Badges Count', value: `${badgeCount}`, inline: true },
        { name: 'Groups Count', value: `${groupCount}`, inline: true }, 
        { name: 'Friends List Count', value: `${friendsCount}`, inline: true },
        { name: 'Following List Count', value: `${followingCount}`, inline: true },
        { name: 'Alt Account Likelihood', value: `${altCategory}`, inline: true },
        { name: 'Roblox Profile', value: `[View Profile](https://www.roblox.com/users/${userId}/profile)`, inline: false } // Add profile link here
    )
    .setColor(embedColor)
    .setFooter({ text: 'detect_alt | Points Tracker' });

          
        

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error processing your request. Please try again later.');
        }
    }
};