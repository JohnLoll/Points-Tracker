const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const notes = require('../../Schemas/releasenotes');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('release-notes')
    .setDescription('Release notes')
    .addSubcommand(command => command.setName('publish').setDescription('Add new release notes (developers only)').addStringOption(option => option.setName('updated-notes').setDescription('The notes to publish').setRequired(true)))
    .addSubcommand(command => command.setName('view').setDescription('View the most recent release notes')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await notes.find();

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function updateNotes(update, version) {
            await notes.create({
                Updates: update,
                Date: Date.now(),
                Developer: interaction.user.username,
                Version: version
            });

            await sendMessage(`🌍 I have updated your release notes`);
        }

        switch (sub) {
            case 'publish':
                if (interaction.user.id !== '735141652506607716') {
                    await sendMessage(`⚠️ Sorry! Looks like only developers can use this!`);
                } else {
                    const update = options.getString('updated-notes');
                    if (data.length > 0) {
                        await notes.deleteMany();

                        var version = 0;
                        await data.forEach(async value => {
                            version += value.Version + 0.1;
                        });

                        version = Math.round(version * 10) / 10;

                        await updateNotes(update, version);
                    } else {
                        await updateNotes(update, 1.0);
                    }
                }
            break;
            case 'view':
                if (data.length == 0) {
                    await sendMessage(`⚠️ There is no public release notes yet...`);
                } else {
                    var string = ``;
                    await data.forEach(async value => {
                        string += `\`${value.Version}\` \n\n**Update Information:**\n\`\`\`${value.Updates}\`\`\`\n\n**Updating Developer:** ${value.Developer}\n**Update Date:** <t:${Math.floor(value.Date / 1000)}:R>`;
                    });

                    await sendMessage(`🌍 **Release Notes** ${string}`);
                }
        }

    }
}