const { SlashCommandBuilder } = require("discord.js");
const { cepModel } = require('../../Schemas/company');
const { epModel } = require('../../Schemas/ep'); // Corrected import
const { google } = require('googleapis');
const { EmbedBuilder } = require('discord.js'); // Corrected import

module.exports = {
    companyhicom: true,
    data: new SlashCommandBuilder()
        .setName('quotacheck')
        .setDescription('Check the quota for everyone in a company.')
        .addStringOption(option =>
            option.setName('company')
                .setDescription('The company of which you want to check the quota of.')
                .setRequired(true)
                .addChoices(
                    { name: 'Speed Demon', value: '"Speed Demon" Company' },
                    { name: 'Dusk Company', value: 'Dusk Company' },
                    { name: 'Trooper', value: 'Trooper' },
                    { name: 'Storm Company', value: 'Storm Company' },
                    { name: 'Initiate', value: 'Initiate' }
                )),
    async execute(interaction) {
        const company = interaction.options.getString('company');
        
        // Fetch CEP data from your company schema
        const data = await cepModel.find({ Guild: interaction.guild.id, Name: company });
        
        if (!data || data.length === 0) {
            return interaction.reply('No data found for the specified company.');
        }
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json', // Use your credentials file
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });
        
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch EP data to get Sheetid
        const epData = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
        if (!epData || epData.length === 0) {
            return interaction.reply('No EP data found.');
        }

        let userInformation = new Map();

        // Process each user in the CEP data
        for (const value of data) {
            const { Eprange, Weeklyoffset, Totaloffset, Epquota } = value;
            let Sheetid;

            for (const ep of epData) {
                if (ep.Name) {
                    Sheetid = ep.Sheetid;
                    break;
                }
            }

            const cepRes = await sheets.spreadsheets.values.get({
                spreadsheetId: Sheetid,
                range: Eprange,
            });

            const cepValues = cepRes.data.values || [];

            if (!cepValues) {
                return interaction.reply('No data found in CEP sheet.');
            }

            // Process each row in CEP values
            // Process each row in CEP values
for (let rIndex = 0; rIndex < cepValues.length; rIndex++) {
  const currentNickname = cepValues[rIndex][0]?.trim().toLowerCase();

  if (!currentNickname) continue;

  // Calculate CEP values
  let totalCeps = parseInt(cepValues[rIndex][Totaloffset]);
  let weeklyCeps = parseInt(cepValues[rIndex][Weeklyoffset]);

  // Check if totalCeps is a valid number
  if (isNaN(totalCeps)) {
      totalCeps = 'N/A';
  }

  // Check if weeklyCeps is a valid number
  if (isNaN(weeklyCeps)) {
      weeklyCeps = 'N/A';
  }

  const passedCEPQuota = !isNaN(weeklyCeps) && !isNaN(Epquota) && weeklyCeps >= Epquota;

  const embedColor = passedCEPQuota ? 0x00ff00 : 0xff0000;
  const passFailMessage = passedCEPQuota ? 'PASSED' : 'FAILED';

  // Add user information to map
  userInformation.set(currentNickname, {
      username: currentNickname,
      totalCeps,
      weeklyCeps,
      passedCEPQuota,
      embedColor,
      passFailMessage,
  });
}
        }

        // Send embeds for each user
        userInformation.forEach(userInfo => {
            const fields = [
                { name: 'Username', value: userInfo.username || 'N/A' },
                { name: 'Company', value: company || 'N/A' },
                { name: 'Weekly EP', value: userInfo.weeklyCeps.toString() || 'N/A' },
                { name: 'Total EP', value: userInfo.totalCeps.toString() || 'N/A' },
                { name: 'Pass/Fail', value: userInfo.passFailMessage || 'N/A' },
            ];

            const embed = new EmbedBuilder()
                .setTitle('User Information')
                .setColor(userInfo.embedColor)
                .addFields(fields);

            interaction.channel.send({ embeds: [embed] })
                .catch(console.error); // Handle any sending errors
        });
    }
};
