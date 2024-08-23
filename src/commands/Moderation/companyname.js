const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const {cepModel} = require('../../Schemas/company');
module.exports = {
    companyhicom: true,
    data: new SlashCommandBuilder()
    .setName('companyname')
    .setDescription('Different Companys name in the server')
    .addSubcommand(command => command.setName('add').setDescription('Add a company to the database.').addStringOption(option => option.setName('name').setDescription('The name of the company to add.').setRequired(true).addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
    { name: 'Dusk Company', value: 'Dusk Company' },
    { name: 'Trooper', value: 'Trooper' },
    { name: 'Storm Company', value: 'Storm Company' },
    { name: 'Initiate', value: 'Initiate'},))
    .addStringOption(option => option.setName('sheetid').setDescription('The companys spreedsheet id.').setRequired(true))
    .addStringOption(option => option.setName('ceprange').setDescription('The range for the cep spreedsheet.').setRequired(true))
    .addStringOption(option => option.setName('eprange').setDescription('The range for the ep spreedsheet.').setRequired(true))
    .addStringOption(option => option.setName('trooperrange').setDescription('The companys range for normal members.').setRequired(true))
    .addStringOption(option => option.setName('trooperstart').setDescription('The start value for normal members.').setRequired(true))
    .addStringOption(option => option.setName('officerstart').setDescription('The start value for staff members.').setRequired(true))
    .addStringOption(option => option.setName('weeklycolumoffset').setDescription('The Colum offset for weekly.').setRequired(true))
    .addStringOption(option => option.setName('totalcolumoffset').setDescription('The Colum offset for total.').setRequired(true))
    .addIntegerOption(option => option.setName('cepquota').setDescription('The companys cep quota.').setRequired(true))
    .addIntegerOption(option => option.setName('epquota').setDescription('The companys ep quota.').setRequired(true))
    .addIntegerOption(option => option.setName('weeklyoffset').setDescription('The offset for the weekly cep.').setRequired(true))
    .addIntegerOption(option => option.setName('totaloffset').setDescription('The offset for the total cep.').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a company from the database').addStringOption(option => option.setName('name').setDescription('The company to remove').setRequired(true).addChoices({ name: 'Speed Demon', value: '"Speed Demon" Company' },
        { name: 'Dusk Company', value: 'Dusk Company' },
        { name: 'Trooper', value: 'Trooper' },
        { name: 'Storm Company', value: 'Storm Company' },
        { name: 'Initiate', value: 'Initiate'},)))
    .addSubcommand(command => command.setName('check').setDescription('Check the company name(s)')),
   
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        var data = await cepModel.find({ Guild: interaction.guild.id});

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function checkData (add) {
            var check;
            var name = options.getString('name');
            var sheetid = options.getString('sheetid');
            var ceprange = options.getString('ceprange');
            var eprange = options.getString('eprange');
            var Trooperrange = options.getString('trooperrange');
            var Trooperstart = options.getString('trooperstart');
            var officerstart = options.getString('officerstart');
            var weeklycolumoffset = options.getString('weeklycolumoffset');
            var totalcolumoffset = options.getString('totalcolumoffset');
            var cepquota = options.getInteger('cepquota');
            var epquota = options.getInteger('epquota');
            var weeklyoffset = options.getInteger('weeklyoffset');
            var totaloffset = options.getInteger('totaloffset');


            await data.forEach(async value => {
                if (value.Name == name) return check = true;
                
            });

            return check;
        }
     
        

        switch (sub) {
            case 'add':
                var check = await checkData(true);
                var name = options.getString('name');
                var sheetid = options.getString('sheetid');
                var ceprange = options.getString('ceprange');
                var eprange = options.getString('eprange');
                var trooperrange = options.getString('trooperrange');
                var trooperstart = options.getString('trooperstart');
                var officerstart = options.getString('officerstart');
                var weeklycolumoffset = options.getString('weeklycolumoffset');
                var totalcolumoffset = options.getString('totalcolumoffset');
                var cepquota = options.getInteger('cepquota');
                var epquota = options.getInteger('epquota');
                var weeklyoffset = options.getInteger('weeklyoffset');
                var totaloffset = options.getInteger('totaloffset');
                if (check) {
                    return await sendMessage(`⚠️ Looks like that is already a companys name!`);
                } else {
                    await cepModel.create({
                        Guild: interaction.guild.id,
                        Name: name,
                        Sheetid: sheetid,
                        Ceprange: ceprange,
                        Eprange: eprange,
                        Trooperrange: trooperrange,
                        Trooperstart: trooperstart,
                        Officerstart: officerstart,
                        Weeklycolumoffset: weeklycolumoffset,
                        Totalcolumoffset: totalcolumoffset,
                        Cepquota: cepquota,
                        Epquota: epquota,
                        Weeklyoffset: weeklyoffset,
                        Totaloffset: totaloffset,
                    });

                    return await sendMessage(`🌍 I have added ${name} as a company!`);
                }
            break;
            case 'remove':
            var name = options.getString('name');
            
            // Find the configuration based on the provided name
            var data = await cepModel.findOne({ Guild: interaction.guild.id, Name: name });
        
            if (!data) {
                // If the configuration is not found, return a message indicating so
                return await sendMessage(`⚠️ Looks like there is no configuration with the name "${name}" in the database, so I can't remove it!`);
            } else {
                // If the configuration is found, remove it from the database
                await cepModel.deleteOne({ Guild: interaction.guild.id, Name: name });
                return await sendMessage(`The "${name}" configuration has been successfully removed from the database!`);
            }
        break;
            case 'check':
                var values = [];
                await data.forEach(async value => {
                    if (!value.Name) return;
                    else {
                       
                        values.push(`${value.Name}\n**Sheetid:** ${value.Sheetid}\n**Ep Range:** ${value.Eprange}\n**Trooper Start:** ${value.Trooperstart}\n **Officer Start:** ${value.Officerstart}\n**Weekly Colum Offset:** ${value.Weeklycolumoffset} \n**Total Colum Offset:** ${value.Totalcolumoffset}\n **Trooper Range:** ${value.Trooperrange}\n**Cep Range:** ${value.Ceprange}\n**Cep Quota:** ${value.Cepquota}\n**Ep Quota:** ${value.Epquota}\n**Weekly Offset:** ${value.Weeklyoffset}\n**Total Offset:** ${value.Totaloffset}\n`);
                    }
                });

                if (values.length > 0) {
                    await sendMessage(`🌍 **Company names**\n\n${values.join('\n')}`);
                } else {
                    await sendMessage(`⚠️ Looks like there are no companys here!`);
                }
        }
        
    }
}