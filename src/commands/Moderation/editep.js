const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
let { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = require('../../Schemas/ep');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-ep-config')
    .setDescription(`Edit EP Configuration'`),
    async execute (interaction) {
        var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });
        var values = [];
                    await data.forEach(async value => {
                        if (!value.Name) return;
                        else {
                           
                            values.push(Sheetid = value.Sheetid,Range =  value.Range, Weeklyoffset = value.Weeklyoffset, Totaloffset = value.Totaloffset);
                        }
                    });
        if (!interaction.guild) return await interaction.reply({ content: `⚠️ Please report this bug within a guild`, ephemeral: true });

        const modal = new ModalBuilder()
        .setTitle(`Edit EP Configuration`)
        .setCustomId('editepconfig')

        const sheetids = new TextInputBuilder()
        .setCustomId('sheetid')
        .setRequired(true)
        .setPlaceholder('The sheetid of the EP spreadsheet')
        .setLabel(`Example Sheet ID: 1CxNXlCdH0hNl-Vz9r`)
        .setStyle(TextInputStyle.Short);

        const ranges = new TextInputBuilder()
        .setCustomId('range')
        .setRequired(true)
        .setPlaceholder('The range of the EP spreadsheet')
        .setLabel(`Example Range: A1:D1000`)
        .setStyle(TextInputStyle.Short);
       
        const weeklyoffsets = new TextInputBuilder()
        .setCustomId('weeklyoffset')
        .setRequired(true)
        .setPlaceholder('The weekly offset for the EP spreadsheet')
        .setLabel(`Example Weekly Offset: 2`)
        .setStyle(TextInputStyle.Short);

        const totaloffsets = new TextInputBuilder()
        .setCustomId('totaloffset')
        .setRequired(true)
        .setPlaceholder('The total offset for the EP spreadsheet')
        .setLabel(`Example Total Offset: 3`)
        .setStyle(TextInputStyle.Short);

        const one = new ActionRowBuilder().addComponents(sheetids);
        const two = new ActionRowBuilder().addComponents(ranges);
        const three= new ActionRowBuilder().addComponents(weeklyoffsets);
        const four = new ActionRowBuilder().addComponents(totaloffsets);

        modal.addComponents(one, two, three, four);
        await interaction.showModal(modal);
        
    }
}