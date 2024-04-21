const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timezone-converter')
    .setDescription('Get the time in a different region')
    .addStringOption(option => option.setName('timezone').setDescription('The timezone to convert to').setRequired(true).addChoices(
        {
            "name": "Samoa Standard Time",
            "value": "Pacific/Samoa"
        },
        {
            "name": "Hawaiian Standard Time",
            "value": "Pacific/Honolulu"
        },
        {
            "name": "Alaskan Standard Time",
            "value": "America/Anchorage"
        },
        {
            "name": "Pacific Standard Time",
            "value": "America/Los_Angeles"
        },
        {
            "name": "Mountain Standard Time",
            "value": "America/Denver"
        },
        {
            "name": "Mexico Standard Time 2",
            "value": "America/Chihuahua"
        },
        {
            "name": "U.S. Mountain Standard Time",
            "value": "America/Phoenix"
        },
        {
            "name": "Central Standard Time",
            "value": "America/Chicago"
        },
        {
            "name": "Canada Central Standard Time",
            "value": "America/Regina"
        },
        {
            "name": "Mexico Standard Time",
            "value": "America/Mexico_City"
        },
        {
            "name": "Central America Standard Time",
            "value": "America/Guatemala"
        },
        {
            "name": "Eastern Standard Time",
            "value": "America/New_York"
        },
        {
            "name": "U.S. Eastern Standard Time",
            "value": "America/Indiana/Indianapolis"
        },
        {
            "name": "S.A. Pacific Standard Time",
            "value": "America/Bogota"
        },
        {
            "name": "Atlantic Standard Time",
            "value": "America/Halifax"
        },
        {
            "name": "S.A. Western Standard Time",
            "value": "America/La_Paz"
        },
        {
            "name": "Pacific S.A. Standard Time",
            "value": "America/Santiago"
        },
        {
            "name": "Newfoundland and Labrador Standard Time",
            "value": "America/St_Johns"
        },
        {
            "name": "E. South America Standard Time",
            "value": "America/Sao_Paulo"
        },
        {
            "name": "S.A. Eastern Standard Time",
            "value": "America/Buenos_Aires"
        },
        {
            "name": "Greenland Standard Time",
            "value": "America/Godthab"
        },
        {
            "name": "Mid-Atlantic Standard Time",
            "value": "Atlantic/Reykjavik"
        },
        {
            "name": "Azores Standard Time",
            "value": "Atlantic/Azores"
        },
        {
            "name": "Cape Verde Standard Time",
            "value": "Atlantic/Cape_Verde"
        },
        {
            "name": "Greenwich Standard Time",
            "value": "Europe/London"
        }
    )),
    async execute (interaction) {

        await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const timezone = options.getString('timezone');

        const utcDate = new Date();
        const locale = 'en-US';

        const localDate = utcDate.toLocaleString(locale, {
            timeZone: timezone
        });

        const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setDescription(`🫧 ${timezone} ➡️ ${localDate}`);

        await interaction.editReply({ embeds: [embed] });
        
    }
}