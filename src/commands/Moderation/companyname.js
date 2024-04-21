const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const {cepModel} = require('../../Schemas/company');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('companyname')
    .setDescription('Differnt Companys name in the server')
    .addSubcommand(command => command.setName('add').setDescription('Add a company to the database.').addStringOption(option => option.setName('name').setDescription('The name of the company to add.').setRequired(true))
    .addStringOption(option => option.setName('sheetid').setDescription('The companys spreedsheet id.').setRequired(true))
    .addStringOption(option => option.setName('ceprange').setDescription('The range for the cep spreedsheet.').setRequired(true))
    .addStringOption(option => option.setName('eprange').setDescription('The range for the ep spreedsheet.').setRequired(true))
    .addIntegerOption(option => option.setName('cepquota').setDescription('The companys cep quota.').setRequired(true))
    .addIntegerOption(option => option.setName('epquota').setDescription('The companys ep quota.').setRequired(true))
    .addIntegerOption(option => option.setName('weeklyoffset').setDescription('The offset for the weekly cep.').setRequired(true))
    .addIntegerOption(option => option.setName('totaloffset').setDescription('The offset for the total cep.').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a company from the database').addStringOption(option => option.setName('name').setDescription('The company to remove').setRequired(true)))
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
            var cepquota = options.getInteger('cepquota');
            var epquota = options.getInteger('epquota');
            var weeklyoffset = options.getInteger('weeklyoffset');
            var totaloffset = options.getInteger('totaloffset');


            await data.forEach(async value => {
                if (value.Name == name) return check = true;
                
            });

            return check;
        }
      
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await sendMessage(`⚠️ You dont have perms to use this!`);

        switch (sub) {
            case 'add':
                var check = await checkData(true);
                var name = options.getString('name');
                var sheetid = options.getString('sheetid');
                var ceprange = options.getString('ceprange');
                var eprange = options.getString('eprange');
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
                       
                        values.push(`**Company:** ${value.Name}\n**Sheetid:** ${value.Sheetid}\n**Ep Range:** ${value.Eprange}\n**Cep Range:** ${value.Ceprange}\n**Cep Quota:** ${value.Cepquota}\n**Ep Quota:** ${value.Epquota}\n**Weekly Offset:** ${value.Weeklyoffset}\n**Total Offset:** ${value.Totaloffset}`);
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