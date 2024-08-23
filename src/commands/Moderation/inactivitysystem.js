const { SlashCommandBuilder } = require('discord.js');
const Cooldown = require('../../Schemas/cooldownSchema'); // Path to your schema

module.exports = {
    companyhicom: true,
    data: new SlashCommandBuilder()
        .setName('inactivity')
        .setDescription('Manage inactivity notices and cooldowns.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('apply')
                .setDescription('Apply an inactivity notice to a user.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to apply the inactivity notice to.')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('duration')
                        .setDescription('Duration of the inactivity notice (e.g., "2 weeks", "3.5 days", "15 minutes")')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('bypass')
                .setDescription('Bypass inactivity notice and give the user cooldown.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to bypass the timer for')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('bypasscooldown')
                .setDescription('Bypass cooldown and clear user cooldown data.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to bypass the cooldown for')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('check')
                .setDescription('Check how long until the inactivity role is removed.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to check the inactivity role for.')
                        .setRequired(true))),
       
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const guild = interaction.guild;

        // Role IDs
        const inactivityRoleId = '1027684343495262208';
        const cooldownRoleId = '896777084721041419';

        if (subcommand === 'bypass') {
            // Bypass the timer
            const member = guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: 'User not found in the guild.', ephemeral: true });

            // Remove the inactivity role and add the cooldown role
            if (member.roles.cache.has(cooldownRoleId)) {
                await member.roles.remove(cooldownRoleId);
            }
            await member.roles.add(inactivityRoleId);

            // Remove any existing cooldown entry for this user
            await Cooldown.findOneAndDelete({ User: user.id, Guild: guild.id });

            return interaction.reply({ content: `Bypassed the timer. ${user.tag} has been given a inactivity notice cooldown.`, ephemeral: true });
        } else if (subcommand === 'apply') {
            // Original setcooldown logic
            const durationStr = interaction.options.getString('duration');
            const duration = parseDuration(durationStr);
            if (!duration) {
                return interaction.reply({ content: 'Invalid duration format. Please specify it as "X minutes", "X days", or "X weeks".', ephemeral: true });
            }

            // Get the member object
            const member = guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: 'User not found in the guild.', ephemeral: true });

            const currentTime = new Date();
            const endTime = new Date(currentTime.getTime() + duration); // Duration in milliseconds
            const inactivityEndTime = new Date(endTime.getTime() + 2 * 7 * 24 * 60 * 60 * 1000); // Two weeks after cooldown period

            if (member.roles.cache.has(inactivityRoleId)) {
                // Remove old cooldown entry
                await Cooldown.findOneAndDelete({ User: user.id, Guild: guild.id });

                // Remove old roles
                await member.roles.remove(inactivityRoleId);
                await member.roles.add(cooldownRoleId);

                // Save new cooldown in the database
                const newCooldownEntry = new Cooldown({
                    Guild: guild.id,
                    User: user.id,
                    EndTime: endTime,
                    InactivityEndTime: inactivityEndTime,
                });
                await newCooldownEntry.save();

                interaction.reply({ content: `I gave ${user.tag} an inactivity notice that will last ${durationStr}.`, ephemeral: true });

                // Schedule removal of the cooldown role and addition of inactivity role
                setTimeout(async () => {
                    const updatedMember = guild.members.cache.get(user.id);
                    if (updatedMember) {
                        await updatedMember.roles.remove(cooldownRoleId);
                        await updatedMember.roles.add(inactivityRoleId);

                        // Schedule removal of inactivity role
                        setTimeout(async () => {
                            const finalMember = guild.members.cache.get(user.id);
                            if (finalMember) {
                                await finalMember.roles.remove(inactivityRoleId);
                            }
                            await Cooldown.findOneAndDelete({ User: user.id, Guild: guild.id });
                        }, inactivityEndTime - new Date());
                    }
                }, endTime - new Date());
            } else {
                // If the user is not on inactivity notice, apply as usual
                await member.roles.add(cooldownRoleId);

                // Save the cooldown in the database
                const newCooldownEntry = new Cooldown({
                    Guild: guild.id,
                    User: user.id,
                    EndTime: endTime,
                    InactivityEndTime: inactivityEndTime,
                });
                await newCooldownEntry.save();

                interaction.reply({ content: `I gave ${user.tag} an inactivity notice that will last ${durationStr}.`, ephemeral: true });

                // Schedule removal of the cooldown role and addition of inactivity role
                setTimeout(async () => {
                    const updatedMember = guild.members.cache.get(user.id);
                    if (updatedMember) {
                        await updatedMember.roles.remove(cooldownRoleId);
                        await updatedMember.roles.add(inactivityRoleId);

                        // Schedule removal of inactivity role
                        setTimeout(async () => {
                            const finalMember = guild.members.cache.get(user.id);
                            if (finalMember) {
                                await finalMember.roles.remove(inactivityRoleId);
                            }
                            await Cooldown.findOneAndDelete({ User: user.id, Guild: guild.id });
                        }, inactivityEndTime - new Date());
                    }
                }, endTime - new Date());
            }
        } else if (subcommand === 'bypasscooldown') {
            const member = await guild.members.fetch(user.id);
            if (!member) {
                console.log(`User ${user.id} not found in the guild.`);
                return interaction.reply({ content: 'User not found in the guild.', ephemeral: true });
            }

            if (member.roles.cache.has(inactivityRoleId)) {
                try {
                    await member.roles.remove(inactivityRoleId);
                    console.log(`Inactivity Notice Cooldown role successfully removed for ${user.tag}`);
                } catch (error) {
                    console.error(`Error removing cooldown role for ${user.tag}:`, error);
                    return interaction.reply({ content: 'Failed to remove the cooldown role.', ephemeral: true });
                }
            } else {
                console.log(`${user.tag} does not have the cooldown role.`);
                return interaction.reply({ content: `${user.tag} does not have the inactivity notice cooldown role.`, ephemeral: true });
            }

            try {
                await Cooldown.findOneAndDelete({ User: user.id, Guild: guild.id });
                console.log(`Cooldown data removed for ${user.tag}`);
            } catch (error) {
                console.error(`Error removing cooldown data for ${user.tag}:`, error);
                return interaction.reply({ content: 'Failed to remove the user\'s inactivity notice data.', ephemeral: true });
            }

            return interaction.reply({ content: `Bypassed cooldown for ${user.tag}.`, ephemeral: true });
        } else if (subcommand === 'check') {
            const member = guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: 'User not found in the guild.', ephemeral: true });
        
            try {
                const cooldownData = await Cooldown.findOne({ User: user.id, Guild: guild.id });
                if (!cooldownData) return interaction.reply({ content: 'No cooldown data found for this user.', ephemeral: true });
        
                const now = new Date();
                let timeLeft, roleType;
        
                if (member.roles.cache.has(cooldownRoleId)) {
                    // User has the cooldown role
                    timeLeft = cooldownData.EndTime - now;
                    roleType = 'inactivity notice';
        
                    if (timeLeft > 0) {
                        const durationStr = formatDuration(timeLeft);
                        return interaction.reply({ content: `${user.tag} has ${durationStr} left until the ${roleType} is removed.`, ephemeral: true });
                    } else {
                        return interaction.reply({ content: `${user.tag}'s ${roleType} should have already been removed. Please check manually.`, ephemeral: true });
                    }
                } else if (member.roles.cache.has(inactivityRoleId)) {
                    // User has the inactivity role
                    timeLeft = cooldownData.InactivityEndTime - now;
                    roleType = 'inactivity notice cooldown';
        
                    if (timeLeft > 0) {
                        const durationStr = formatDuration(timeLeft);
                        return interaction.reply({ content: `${user.tag} has ${durationStr} left until the ${roleType} is removed.`, ephemeral: true });
                    } else {
                        return interaction.reply({ content: `${user.tag}'s ${roleType} should have already been removed. Please check manually.`, ephemeral: true });
                    }
                } else {
                    // User has neither role
                    return interaction.reply({ content: `${user.tag} does not have the cooldown or inactivity role.`, ephemeral: true });
                }
            } catch (error) {
                console.error('Error fetching cooldown data:', error);
                return interaction.reply({ content: 'Failed to retrieve cooldown data.', ephemeral: true });
            }
        }
        
        
    }
};

function parseDuration(durationStr) {
    const regex = /^(\d+(?:\.\d+)?)\s*(minutes?|hours?|days?|weeks?)$/i;
    const match = durationStr.match(regex);
    if (!match) return null;

    const amount = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('minute')) {
        return amount * 60 * 1000; // Convert minutes to milliseconds
    } else if (unit.startsWith('hour')) {
        return amount * 60 * 60 * 1000; // Convert hours to milliseconds
    } else if (unit.startsWith('day')) {
        return amount * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    } else if (unit.startsWith('week')) {
        return amount * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
    }
    return null;
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}
