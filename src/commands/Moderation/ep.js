const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const {epModel} = require('../../Schemas/ep');
const ownerid = '721500712973893654'
module.exports = {

    data: new SlashCommandBuilder()
    .setName('epsheet')
    .setDescription('Ep sheet configuration.')
    .addSubcommand(command => command.setName('add').setDescription('Add the EP sheet config to the database.')
    .addStringOption(option => option.setName('sheetid').setDescription('EP spreedsheet id.').setRequired(true))
    .addStringOption(option => option.setName('range').setDescription('The range for the EP spreedsheet.').setRequired(true))
    .addIntegerOption(option => option.setName('weeklyoffset').setDescription('The offset for the weekly cepModel.').setRequired(true))
    .addIntegerOption(option => option.setName('totaloffset').setDescription('The offset for the total cepModel.').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove the Ep sheet config from the database'))
    .addSubcommand(command => command.setName('check').setDescription('Check the EP config.')),
    
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await epModel.find({ Guild: interaction.guild.id, Name: 'EP' });

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function checkData (add) {
            var check;
            var name = 'EP';
            var sheetid = options.getString('sheetid');
            var range = options.getString('range');
            var weeklyoffset = options.getInteger('weeklyoffset');
            var totaloffset = options.getInteger('totaloffset');


            await data.forEach(async value => {
                if (value.Sheetid == sheetid) return check = true;
                if (value.Range == range) return check = true;
                if (value.Weeklyoffset == weeklyoffset) return check = true;
                if (value.Totaloffset == totaloffset) return check = true;
            });

            return check;
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== ownerid) {
            return await interaction.reply({ content: `⚠️ You don't have perms to use this!`, ephemeral: true });
        }

        switch (sub) {
            case 'add':
                var check = await checkData(true);
                var name = 'EP';
                var sheetid = options.getString('sheetid');
                var range = options.getString('range');
                var weeklyoffset = options.getInteger('weeklyoffset');
                var totaloffset = options.getInteger('totaloffset');
                if (check) {
                    return await sendMessage(`⚠️ Looks like that is already a companys name!`);
                } else {
                    await epModel.create({
                        Guild: interaction.guild.id,
                        Name: name,
                        Sheetid: sheetid,
                        Range: range,
                        Weeklyoffset: weeklyoffset,
                        Totaloffset: totaloffset,
                    });

                    return await sendMessage(`🌍 I have added the ${name} config to the database!`);
                }
            break;
            case 'remove':
                var name = 'EP'; // Assuming 'EP' is the name of the configuration you want to remove
            
                // Find the configuration based on the provided name
                var data = await epModel.findOne({ Guild: interaction.guild.id, Name: name });
            
                if (!data) {
                    // If the configuration is not found, return a message indicating so
                    return await sendMessage(`⚠️ Looks like there is no configuration with the name "${name}" in the database, so I can't remove it!`);
                } else {
                    // If the configuration is found, remove it from the database
                    await epModel.deleteOne({ Guild: interaction.guild.id, Name: name });
                    return await sendMessage(`The "${name}" configuration has been successfully removed from the database!`);
                }
            break;
            
            case 'check':
                var values = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                       
                        values.push(`**Sheetid:** ${value.Sheetid}\n**Range:** ${value.Range}\n**Weekly Offset:** ${value.Weeklyoffset}\n**Total Offset:** ${value.Totaloffset}`);
                    }
                });

                if (values.length > 0) {
                    await sendMessage(`🌍 **EP Config**\n\n${values.join('\n')}`);
                } else {
                    await sendMessage(`⚠️ Looks like there is no EP configuration in the database!`);
                }
        }
        
    }
}