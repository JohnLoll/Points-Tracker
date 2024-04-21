const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    owner: true,
    data: new SlashCommandBuilder()
    .setName('server-list')
    .setDescription('Get a list of all the servers the bot is in'),
    async execute (interaction, client) {

        await interaction.deferReply({ ephemeral: true });

        async function sendMessage (message, key) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            if (key) {
                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://sourceb.in/${key}`)
                    .setLabel(`🔗 Server List`)
                );

                await interaction.editReply({ embeds: [embed], components: [button] });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }

        }

        var content = `${client.user.username}'s Server List:\n\n`;

        var guilds = await client.guilds.fetch();
        await guilds.forEach(async guild => {
            content += `Server: ${guild.name}, ID: ${guild.id}\n`;
        });

        content += `If your bot is in more than 200+ guilds, you will only see ~200 of them within this list`;

        var listBin = await fetch('https://sourceb.in/api/bins', {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({ 
                files: [
                    {
                        content: content,
                    },
                ],
            }),
        });

        if (listBin.ok) {
            var { key } = await listBin.json();
            await sendMessage(`🌍 **My Server List:**\n\nI am currently in \`${client.guilds.cache.size}\` servers-- I have compiled this list into a sourcebin below consisting of the server names and IDs`, key);
        } else {
            await sendMessage(`⚠️ Failed to load server list`);
        }

    }
}