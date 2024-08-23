const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('role-info')
    .setDescription('Retrieve info about a given role')
    .addRoleOption(option => option.setName('role').setDescription("The role you want to get the info of").setRequired(true)),
    async execute(interaction, client) {
    
        const { options } = interaction;
        
        const role = options.getRole('role');
        
        const nullRoleEmbed = new EmbedBuilder()
        .setTitle("Well would you look at that, you've gone and done a silly...")
        .setDescription(`\`💡\` **•** The specified role does not exist.`)
        .setColor('Blue')
        .setImage("https://cdn.discordapp.com/attachments/1129094438669520956/1209631004399239199/puppy-scrunkly.gif?ex=65e79fa9&is=65d52aa9&hm=f11474b6c8b644e26624e1bea679301d7344ff527bb1bf33720dd5e6b8edab25&")
        .setTimestamp()
        if (!role || !role.id) return interaction.reply({ embeds: [nullRoleEmbed], ephemeral: true});
        
        const invalidEveryoneRoleEmbed = new EmbedBuilder()
        .setTitle("You tart, you can't get the info of the @everyone role...")
        .setDescription(`\`💡\` **•** ${role.name} role is not available. The role cannot be \`@everyone\`.`)
        .setColor('Blue')
        .setImage("https://cdn.discordapp.com/attachments/1129094438669520956/1209631004399239199/puppy-scrunkly.gif?ex=65e79fa9&is=65d52aa9&hm=f11474b6c8b644e26624e1bea679301d7344ff527bb1bf33720dd5e6b8edab25&")
        .setTimestamp()
        if (role.name === "@everyone") return interaction.reply({ embeds: [invalidEveryoneRoleEmbed], ephemeral: true});
        
        const invalidHereRoleEmbed = new EmbedBuilder()
        .setTitle("You absolute stinker, how would you get the info of the @here role silly...")
        .setDescription(`\`💡\` **•** ${role.name} role is not available. The role cannot be \`@here\`.`)
        .setColor('Blue')
        .setImage("https://cdn.discordapp.com/attachments/1129094438669520956/1209631004399239199/puppy-scrunkly.gif?ex=65e79fa9&is=65d52aa9&hm=f11474b6c8b644e26624e1bea679301d7344ff527bb1bf33720dd5e6b8edab25&")
        .setTimestamp()
        if (role.name === "@here") return interaction.reply({ embeds: [invalidHereRoleEmbed], ephemeral: true});
        
        const created = parseInt(role.createdTimestamp / 1000);
        const isMentionable = role.mentionable ? "true" : "false";
        const isManaged = role.managed ? "true" : "false";
        const isHigher = role.hoist ? "true" : "false";
        const position = role.position;
        const isBotRole = role.tags && role.tags.botId ? "true" : "false";
        
        const permissions = new PermissionsBitField(role.permissions.bitfield);
        const permissionNames = permissions.toArray().map(perm => {
            return perm.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
        }).join(', ');
        
        const roleEmbed = new EmbedBuilder()
        .setAuthor({ name: `@${role.name} | Role Information :)`})
        .setColor(role.color)
        .addFields(
            { name: "Name", value: `${role.name}` },
            { name: "Color", value: `${role.hexColor}` },
            { name: "Mention", value: `\`<@&${role.id}>\`` },
            { name: "Hoisted", value: `${isHigher}` },
            { name: "Position", value: `${position}` },
            { name: "Mentionable", value: `${isMentionable}` },
            { name: "Managed", value: `${isManaged}` },
            { name: "Bot-Role", value: `${isBotRole}` },
            { name: "Permissions", value: `${permissionNames}` },
            { name: "Created", value: `<t:${created}:R>` })
        .setFooter({ text: `Role ID: ${role.id} | Role Information :)`})
        .setThumbnail()
        
        await interaction.reply({ embeds: [roleEmbed], ephemeral: true });
    }
};
