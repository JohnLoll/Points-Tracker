const { EmbedBuilder } = require('@discordjs/builders');




const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List of commands'),
  async execute(interaction) {
   
      var embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username
        })
        .setTitle("Command List")
        .setColor(0x00fff6)
        .setDescription(
          "**/help** - Views all the possible commands.\n" +
          "**/userinfo [user]** - Views users company, their EP and CEP (if not filled in, it views your CEP and EP).\n" +
          "**/ping** - Get the current bot-to-discord ping.\n" +
          "**/epboard** - Views the event point leaderboard.\n" +
          //"**/cepboard** - Views your company event point leaderboard.\n" +
          "**/update {user(s)}** Used to update a user's role based on EP.\n"
          )
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL()
        });
        var embed2 = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username
        })
        .setTitle("Officer Commands")
        .setColor(0x00fff6)
        .setDescription(
          "**/ep {Action} {user(s)} {amount}** Adds or Removes EP to/from the user(s).\n" +
          "**/resetep** Resets the weekly ep in the spreadsheet back to zero.\n" +
          //"**/resetCep** Resets the weekly Cep in the spreadsheet back to zero.\n" +
          //"**/cep {Action} {user(s)} {amount}** Adds or Removes CEP to/from the user(s).\n" +
          "**/move {user(s)}** Moves a user to a different company on the EP sheet.\n"+
          "**/user {company} {action} {user} {usernickname}** Add's a user to the EP sheet for the spesific company. Optional usernickname option for removing someone.\n"+
          "**/discharge {company} {user} {usernickname}** Remove's a user from the EP sheet for the spesified company. Optional usernickname option if the user has already left the discord.\n"+
          "**/tmove {user(s)}** Moves a user from Initiate to Trooper in CEP sheet.\n"
          )
          .setFooter({ text: `help | Points Tracker` }) // Set your bot's name here
       await interaction.reply({ embeds: [embed, embed2] });
       
      return;
    }
  

}; 




