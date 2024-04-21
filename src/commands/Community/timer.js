const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Start a timer')
    .addNumberOption(option => option.setName('timer-number').setDescription('The timer number in SECONDS').setRequired(true)),
    async execute (interaction) {

        const { options } = interaction;
        const num = options.getNumber('timer-number');

        async function sendMessage (message, edit) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message)
            .setFooter({ text: `⚠️ This timer may be ~1-2 seconds off as api calls have to be made to update messages`});

            if (edit) {
                await interaction.editReply({ embeds: [embed] }).catch(err => {});
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        var current = 0;
        await sendMessage(`🌍 \`${num - current}\` seconds remain out of your ${num} second timer.`);

        var done;
        if (done) return;
        setInterval(async () => {
            current++;
            if (current >= num) {
                await sendMessage(`👍 **Your Timer Is Done!**`, true);
                done = true;
            } else {
                await sendMessage(`🌍 \`${num - current}\` seconds remain out of your ${num} second timer.`, true);
            }
        }, 1000);

    }
}