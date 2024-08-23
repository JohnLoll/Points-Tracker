const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { google } = require('googleapis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ocstats')
        .setDescription('Classified.'),

    async execute(interaction) {
        const ownerid = '721500712973893654';
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== ownerid) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('?? Permission Denied')
                .setDescription('You do not have the necessary permissions to use this command.')
                .setTimestamp()
                .setFooter({ text: `ocstats | Points Tracker` });
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await interaction.deferReply();

            const channelId = '943983420290256966';
            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) {
                return await interaction.editReply('Invalid channel. Please select a valid channel.');
            }

            // Calculate the start of the current week (Sunday)
            const today = new Date();
            const dayOfWeek = today.getDay();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek);

            console.log(`Fetching messages from: ${startOfWeek} to ${today}`);

            async function fetchMessages(channel, limit = 100) {
                let messages = [];
                let lastMessageId = null;
                let fetchComplete = false;

                while (!fetchComplete) {
                    const options = { limit };
                    if (lastMessageId) {
                        options.before = lastMessageId;
                    }

                    const fetchedMessages = await channel.messages.fetch(options).catch(err => {
                        console.error('Error fetching messages:', err);
                        interaction.editReply('An error occurred while fetching messages from the channel.');
                        return [];
                    });

                    if (!fetchedMessages.size) {
                        fetchComplete = true;
                    } else {
                        messages = messages.concat(Array.from(fetchedMessages.values()));
                        lastMessageId = fetchedMessages.last().id;

                        if (fetchedMessages.last().createdAt < startOfWeek) {
                            fetchComplete = true;
                        }
                    }
                }

                const textMessages = messages.filter(message =>
                    message.createdAt >= startOfWeek &&
                    message.attachments.every(att => !att.contentType || !att.contentType.startsWith('image'))
                );

                console.log(`Fetched ${textMessages.length} text messages from the current week.`);

                return textMessages;
            }

            const allMessages = await fetchMessages(channel);
            const messagesThisWeek = allMessages.filter(message =>
                message.createdAt >= startOfWeek &&
                !message.attachments.some(att => att.contentType && att.contentType.startsWith('image'))
            );

            console.log(`Filtered to ${messagesThisWeek.length} messages within the current week excluding images.`);

            const messageCounts = {};
            messagesThisWeek.forEach(message => {
                const userId = message.author.id;
                if (!messageCounts[userId]) {
                    messageCounts[userId] = 0;
                }
                messageCounts[userId]++;
            });

            const sortedUsers = Object.keys(messageCounts).sort((a, b) => messageCounts[b] - messageCounts[a]);

            const pageSize = 10;
            const embeds = [];
            let currentPage = 0;

            const auth = new google.auth.GoogleAuth({
                keyFile: 'credentials.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            const sheets = google.sheets({ version: 'v4', auth });

            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: '1frHOfiDvuHSBC-v98iWUAJqpRJPiKyK4Y2YkuwE0xmE',
                range: 'C5:G32',
            });

            const values = res.data.values;

            function getNicknameWithoutTimezone(nickname) {
                return nickname.replace(/\s*\[.*\]\s*$/, '');
            }

            while (currentPage * pageSize < sortedUsers.length) {
                const embed = new EmbedBuilder()
                    .setTitle(`Top Users by Company Events`)
                    .setDescription(`Top Company Events (Page ${currentPage + 1})`);

                for (let i = currentPage * pageSize; i < Math.min((currentPage + 1) * pageSize, sortedUsers.length); i++) {
                    const userId = sortedUsers[i];
                    const user = await interaction.guild.members.fetch(userId).catch(() => null);
                    let weeklyEp = 0;

                    if (user) {
                        const officerNickname = getNicknameWithoutTimezone(user.displayName);

                        if (values) {
                            let found = false;
                            for (let rIndex = 0; rIndex < values.length; rIndex++) {
                                const row = values[rIndex];
                                for (let cIndex = 0; cIndex < row.length; cIndex++) {
                                    const currentNickname = row[cIndex];
                                    if (currentNickname) {
                                        const cleanedCurrentNickname = currentNickname.trim();
                                        const officerNicknameLower = officerNickname.trim().toLowerCase();

                                        if (cleanedCurrentNickname.toLowerCase() === officerNicknameLower) {
                                            weeklyEp = parseInt(row[cIndex + 3]);
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                                if (found) break;
                            }
                        }

                        embed.addFields({
                            name: `#${i + 1} - ${officerNickname}`,
                            value: `${messageCounts[userId]} Weekly Events | ${weeklyEp} Weekly OP`,
                            inline: false
                        });
                    }
                }

                embeds.push(embed);
                currentPage++;
            }

            const initialEmbed = embeds[0];
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.editReply({ embeds: [initialEmbed], components: [row] });

            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 180000 });

            let currentIndex = 0;

            collector.on('collect', async i => {
                try {
                    if (i.customId === 'previous') {
                        currentIndex = (currentIndex - 1 + embeds.length) % embeds.length;
                    } else if (i.customId === 'next') {
                        currentIndex = (currentIndex + 1) % embeds.length;
                    }

                    await i.update({ embeds: [embeds[currentIndex]], components: [row] });
                } catch (error) {
                    console.error('Error handling pagination:', error);
                    await interaction.editReply('Failed to handle pagination.');
                }
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });

        } catch (error) {
            console.error('Error fetching messages:', error);
            await interaction.editReply('Failed to fetch messages. Please try again later.');
        }
    },
};