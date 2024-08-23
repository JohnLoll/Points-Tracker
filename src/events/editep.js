const { EmbedBuilder, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle,  PermissionsBitField } = require('discord.js');
const Discord = require('discord.js');
const {epModel} = require('../Schemas/ep');
let {logchannelModel, Channel} = require('../Schemas/logchannel');
const ownerid = '721500712973893654'
module.exports = {
    name: Events.InteractionCreate,
    async execute (interaction, client) {
/* Name: String,
    Guild: String,
    Sheetid: String,
    Range: String,
    Weeklyoffset: Number,
    Totaloffset: Number,*/
    
        if (!interaction.guild) return;
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'editepconfig') {
            const sheetid = interaction.fields.getTextInputValue('sheetid');
            const range = interaction.fields.getTextInputValue('range');
            const weeklyoffset = interaction.fields.getTextInputValue('weeklyoffset');
            const totaloffset = interaction.fields.getTextInputValue('totaloffset');

            var existingConfig = await epModel.findOne({ Guild: interaction.guild.id, Name: 'EP' });

            if (!existingConfig) {
                return await sendMessage(`⚠️ There is no existing EP configuration for this server! Please create one first using the \`/epconfig\` command!`);
            } else {
                // Update the existing configuration with the new values
                existingConfig.Sheetid = sheetid;
                existingConfig.Range = range;
                existingConfig.Weeklyoffset = weeklyoffset;
                existingConfig.Totaloffset = totaloffset;
                await existingConfig.save();
            }

            var logdata = await logchannelModel.find({ Guild: interaction.guild.id });
            var values = [];
                        await logdata.forEach(async value => {
                            if (!value.Channel) return;
                            else {
                               
                                values.push( Channel = value.Channel);
                            }
                        });

                        const id = interaction.user.id;
                        const iconURL = interaction.guild.iconURL({ dynamic: true });
                        const guildname = interaction.guild.name;
                        
                        const embed = new EmbedBuilder()
                            .setColor("Blurple")
                            .setTitle(`EP Configuration Updated!`)
                            .addFields(
                                { name: "Command Issuer", value: `<@${id}>`},
                                { name: "New Range", value: `${range}`},
                                { name: "New Sheetid", value: `${sheetid}`},
                                { name: `New Weekly offset`, value: `${weeklyoffset}`},
                                { name: `New Total offset`, value: ` ${totaloffset}`}
                            )
                            .setTimestamp()
                            .setFooter({ text: guildname, iconURL: iconURL });
    // Send the log message to the log channel
    const guild = interaction.guild;
     const logChannel = guild.channels.cache.get(Channel);
    if (logChannel instanceof Discord.TextChannel) { 
      await logChannel.send({ embeds: [embed] }).catch(err => {});
    }
           

            

        
            await interaction.reply({ content: `✅ The EP Config has successfully been updated!`, ephemeral: true });
        }



    }
}