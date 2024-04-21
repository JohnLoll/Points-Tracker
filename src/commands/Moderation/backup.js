const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Embed, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const backup = require('../../Schemas/backup');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('backup system')
    .addSubcommand(command => command.setName('create').setDescription('Create a backup of the server'))
    .addSubcommand(command => command.setName('update').setDescription('Update the servers backup'))
    .addSubcommand(command => command.setName('remove').setDescription('Remove the servers backup'))
    .addSubcommand(command => command.setName('apply').setDescription('Apply the current server backup'))
    .addSubcommand(command => command.setName('log').setDescription('log your backup')),
    async execute (interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `👉 You dont have permissions to use this command!`, ephemeral: true });

        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await backup.findOne({ Guild: interaction.guild.id });

        async function sendMessage(content) {
            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setDescription(content);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        switch (sub) {
            case 'create':
                if (data) return await interaction.reply({ content: `You already have an existing backup!`, ephemeral: true });

                const channels = await interaction.guild.channels.fetch();

                const channelMap = channels.map(channel => {
                    if (channel.type !== ChannelType.GuildCategory) {
                        return { name: channel.name, parent: channel.parent.name, type: channel.type }
                    } else {
                        return { name: channel.name, parent: false, type: channel.type }
                    }
                });

                const roles = await interaction.guild.roles.fetch();

                const roleMap = roles.map(role => {
                    return { name: role.name, color: role.color, permissions: role.permissions.bitfield.toString() + 'n' }
                });

                await backup.create({
                    Guild: interaction.guild.id,
                    Channels: channelMap,
                    Roles: roleMap
                });

                await sendMessage(`👉 Created your server backup!`);
            
            break;
            case 'remove':
                if (!data) return interaction.reply({ content: `No Backups found for this Server`, ephemeral: true });
                await backup.deleteOne({ Guild: interaction.guild.id });
                await sendMessage(`✨ Deleted your backup data!`);
        

            break;
            case 'log':
                console.log(data)
            
            break;
            case 'update':
            
            break;
            case 'apply':

                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('backupConfirm')
                    .setLabel('CONFIRM')
                    .setStyle(ButtonStyle.Danger)
                );

                const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle(`CONFIRM YOUR BACKUP!`)
                .setDescription(`THIS WILL DELETE EVERY CHANNEL AND ROLE, AND REPLACE IT WITH THE PREVIOUSLY SAVED BACKUP.  CLICK THE CONFIRM BUTTON TO PROCEED, OTHERWISE DO NOTHING.`)
                .setTimestamp()

                await interaction.reply({ embeds: [embed], components: [button], ephemeral: true });
        }
    }
}