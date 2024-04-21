const { ActivityType, EmbedBuilder } = require('discord.js');
const cowsay = require("cowsay");
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;

const bot = require('../Schemas/antibotSchema');

module.exports = {
    name: 'ready', 
    once: true,
    async execute(client) { 

        //anti bot
        setInterval(async () => {
            const data = await bot.find();

            await data.forEach(async guild => {
                const g = await client.guilds.cache.get(guild.Guild);
                var members = await g.members.fetch();

                await members.forEach(async member => {
                    if (member.user.bot && member.id !== client.user.id) return await member.kick({ reason: 'Anti Bot System' });
                    else return;
                });
            });
        }, 10000);

        //xmas cd
        const xmas = require('../Schemas/xmascountdown');
        setInterval(async () => {

            const guilds = await client.guilds.fetch();

            var toSend = [];
            await guilds.forEach(async guild => {
                const check = await xmas.findOne({ Guild: guild.id});
                if (check) {
                    return await toSend.push(check);
                }
            });

            if (!toSend) return;
            async function sendMessage(xmas, days, hours, minutes, seconds) {
                async function getChannel(value, embed) {
                    const guild = await client.guilds.cache.get(value.guild);
                    const channel = await guild.channels.cache.get(value.channel);
                    await channel.send({ embeds: [embed] });
                }

                await toSend.forEach(async value => {
                    if (!xmas) {
                        const embed = new EmbedBuilder()
                        .setTitle(`🧑‍🎄 There are ${days} days, ${hours} hours, ${minutes} minutes, & ${seconds} seconds until Christmas!`)
                        .setImage(`https://images-ext-2.discordapp.net/external/QEWycbV6hLT2CLh6vs-Zy5LjwpRNH_nC20lwVsSuDr0/https/media.tenor.com/B-gBpZJic6wAAAPo/christmas-is-coming-christmas.mp4`)
                        .setTimestamp();

                        await getChannel(value, embed);
                    } else {
                        const embed = new EmbedBuilder()
                        .setTitle(`🧑‍🎄 MERRY CHRISTMAS!`)
                        .setImage(`https://tenor.com/view/christmas-trees-decorated-christmas-tree-christmas-lights-christmas-merry-christmas-gif-15738095569942532062`)
                        .setTimestamp();

                        await getChannel(value, embed);
                    }
                });
            }

            const christmasDate = new Date("December 25, 2023 00:00:00").getTime();
            const now = new Date().getTime();
            const difference = christmasDate - now;

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (difference < 0) {
                await sendMessage(true);
            } else {
                await sendMessage(false, days, hours, minutes, seconds);
            }
        }, 1000);


        client.user.setActivity({
            name: "For CHC Violations!",
            type: ActivityType.Watching
        });
        client.user.setStatus('dnd');
        

        if (!mongoURL) return;

        await mongoose.connect(mongoURL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if (mongoose.connect) {
            console.log('I have connected to the database!');
        } else {
            console.log("I cannot connect to the database right now...");
        }

    },
};

