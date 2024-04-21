const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, Image } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('canvas')
    .setDescription('Canvas testing'),
    async execute (interaction) {

        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const image = new Image();
        image.src = 'https://imgs.search.brave.com/co9gUcCJE35mlixlEUwh_laqAryZavYCGp0cm4Q3k0k/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9kaXNj/b3Zlcnkuc25kaW1n/LmNvbS9jb250ZW50/L2RhbS9pbWFnZXMv/ZGlzY292ZXJ5L2Vk/aXRvcmlhbC9zaG93/cy9zL3NoYXJrLXdl/ZWstLzIwMjIvc2hv/d3MvZ3JlYXQtd2hp/dGUtc2VyaWFsLWtp/bGwtLWZhdGFsLWNo/cmlzdG1hcy8zODE2/MF8wMjYuanBnLnJl/bmQuaGd0dmNvbS40/MDYuNDA2LnN1ZmZp/eC8xNjU4NDM3MjI4/MDU1LmpwZWc';

        image.onload = async function() {

            ctx.drawImage(image, 650, 300, 600, 600);

            ctx.fillStyle = 'black';
            ctx.font = '100px Impact';
            ctx.fillText('This is a shark', 700, 700);

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'image.png'});

            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setImage('attachment://image.png');

            await interaction.reply({ embeds: [embed], files: [attachment] });
        };

        image.onerror = function() {
            console.log('failed to load image');
        };
    }
}