const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-template')
    .setDescription('Create a template for this guild')
    .addStringOption(option => option.setName('name').setDescription('The name of the template').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('The description of the template').setRequired(true)),
    async execute (interaction) {

        const { options } = interaction;
        const name = options.getString('name');
        const description = options.getString('description');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You dont have perms to use this command`, ephemeral: true });

        const template = await axios.post(`https://discord.com/api/v10/guilds/${interaction.guild.id}/templates`,
            {
                name: name,
                description: description,
            },
            {
              headers: {
                'Authorization': `Bot ${process.env.token}`,
                'Content-Type': 'application/json'
              }
            }
        ).catch(err => {});

        if (!template) return await interaction.reply({ content: `There is already an existing template!`, ephemeral: true });

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('Sync Template 🔃')
            .setCustomId('templateButton')
        );

        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(`👉 Here is your template! https://discord.new/${template.data.code}`)

        const msg = await interaction.reply({ embeds: [embed], components: [button], ephemeral: true });

        const collector = msg.createMessageComponentCollector({ ComponentType: ComponentType.Button });
        collector.on('collect', async i => {
            if (i.customId === 'templateButton') {
                const sync = await axios.put(`https://discord.com/api/v10/guilds/${interaction.guild.id}/templates/${template.data.code}`, {
                        
                }, {
                    headers: {
                        'Authorization': `Bot ${process.env.token}`,
                    }
                }).catch(err => {});

                embed.setDescription(`👉 Here is your synced template! https://discord.new/${sync.data.code}`)

                await msg.edit({ embeds: [embed], components: [button] });
                await i.reply({ content: `☝️ Your template is synced, the new link is above`, ephemeral: true });
            } else {
                return;
            }
        });

        setTimeout(async () => {
            collector.on('end', async collected => {});
            await msg.edit({ embeds: [embed], components: [] }).catch(err => {});
        }, 300000);

    }
}