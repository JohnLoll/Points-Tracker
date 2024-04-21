const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Embed } = require('discord.js');
const block = require('../../Schemas/blockcmd');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('block-command')
    .setDescription('Block command')
    .addSubcommand(command => command.setName('set').setDescription('Block a command from being used in this server').addStringOption(option => option.setName('command').setDescription('The command to block').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Unblock a command').addStringOption(command => command.setName('command').setDescription('The command to unblock').setRequired(true)))
    .addSubcommand(command => command.setName('reset').setDescription('Reset the commands back to default'))
    .addSubcommand(command => command.setName('check').setDescription('Check the blocked commands')),
    async execute (interaction, client) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function compareCommand(command) {
            var command = options.getString('command');
            var botCommands = client.commands;

            var match;
            await botCommands.forEach(async value => {
                if (value.data.name.toLowerCase() == command.toLowerCase()) {
                    match = value.data.name;
                }
            });

            var data = await block.findOne({ Guild: interaction.guild.id, Command: match });
            if (data) return { cmd: 'Already Blocked', query: command, toRemove: match };
            else if (!match) return { cmd: '', query: command }
            else return { cmd: match, query: command };
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await sendMessage(`⚠️ You dont have perms to use this!`);

        switch (sub) {
            case 'set':
                var command = await compareCommand();
                if (command.cmd.length == 0) return await sendMessage(`🌍 Looks like \`${command.query}\` is not one of my commands!`);
                else {
                    if (command.cmd == 'Already Blocked') return await sendMessage(`🌍 Looks like \`${command.query}\` is already blocked!`);
                    if (command.cmd == 'block-command') return await sendMessage(`⚠️ You cant block that command!`);

                    await block.create({
                        Guild: interaction.guild.id,
                        Command: command.cmd
                    });

                    await sendMessage(`🌍 I have blocked ${command.cmd} *and its sub commands if it has any* from being used!`);
                }

            break;
            case 'remove': 
                var command = await compareCommand();
                if (command.cmd.length == 0) return await sendMessage(`🌍 Looks like \`${command.query}\` is not one of my commands!`);
                else {
                    if (command.cmd !== 'Already Blocked') return await sendMessage(`🌍 Looks like \`${command.query}\` is already blocked!`);

                    await block.deleteOne({ 
                        Guild: interaction.guild.id,
                        Command: command.toRemove
                    });

                    await sendMessage(`🌍 I have unblocked ${command.toRemove}! You can now use it here`);
                }
            
            break;
            case 'reset':
                await block.deleteMany({ Guild: interaction.guild.id });
                await sendMessage(`😉 I have reset the commands to default-- they are all useable now!`);

            break;
            case 'check':
                var data = await block.find({ Guild: interaction.guild.id});

                var names = [];
                await data.forEach(async value => {
                    names.push(value.Command);
                });

                if (names.length == 0) {
                    await sendMessage(`⚠️ Nothing is blocked here!`);
                } else {
                    await sendMessage(`🌍 **Commands Blocked**\n\n ${names.join('\n')}`);
                }
        }

    }
}