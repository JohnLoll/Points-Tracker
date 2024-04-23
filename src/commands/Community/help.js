const { EmbedBuilder } = require('@discordjs/builders');
const { isOfficer } = require('../../index'); // Adjust the path accordingly
const { REST, Routes } = require('discord.js');
const rest = new REST({version: '10'}).setToken(process.env.TOKEN);
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List of commands'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
   
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
          "**/cepboard** - Views your company event point leaderboard.\n" +
          "**/update {user(s)}** Used to update a user's role based on EP.\n"+
          "\n" +
          "**OFFICER ONLY**\n" +
          "**/ep {Action} {user(s)} {amount}** Adds or Removes EP to/from the user(s).\n" +
          "**/resetep** Resets the weekly ep in the spreadsheet back to zero.\n" +
          "**/resetCep** Resets the weekly Cep in the spreadsheet back to zero.\n" +
          "**/cep {Action} {user(s)} {amount}** Adds or Removes CEP to/from the user(s).\n" +
          "**/move {user(s)}** Moves a user to a different company on the EP sheet.\n"+
          "**/user {company} {action} {type} {user} {usernickname}** Add's a user to the EP or CEP sheet for the spesific company. Optional usernickname option for removing someone.\n"+
          "**/discharge {company} {user} {usernickname}** Remove's a user from the EP and CEP sheet for the spesified company. Optional usernickname option if the user has already left the discord.\n"
          )
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL()
        });
       await interaction.editReply({ embeds: [embed] });
      return;
    }
  
}; 
