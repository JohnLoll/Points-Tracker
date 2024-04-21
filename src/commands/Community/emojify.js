const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('emojify')
    .setDescription('Change text to emojis')
    .addStringOption(option => option.setName('text').setDescription('The text to convert').setRequired(true).setMaxLength(2000).setMinLength(1))
    .addStringOption(option => option.setName('hidden').setDescription('Hide this message?').addChoices({ name: 'Hidden', value: 'true' }, { name: 'Not Hidden', value: 'false' }).setRequired(false)),
    async execute (interaction) {

        const { options } = interaction;
        const text = options.getString('text');
        var hidden = options.getString('hidden') || false;

        if (hidden == 'true') hidden = true;
        else if (hidden == 'false') hidden = false;

        var emojiText = text
        .toLowerCase()
        .split('')
        .map((letter) => {
            const regex = /^[A-Za-z]+$/;
            if (letter == ' ') return ' ';


            if (regex.test(letter)) {
                return `:regional_indicator_${letter}:`
            } else {
                return letter;
            }
        })
        .join('');

        if (emojiText.length >= 2000) emojiText = 'I cant emojify this text-- it is to long!';

        await interaction.reply({ content: emojiText, ephemeral: hidden });

    }
}