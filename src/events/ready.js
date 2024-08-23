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



        client.user.setActivity({
            name: "For CHC Violations!",
            type: ActivityType.Watching
        });
        client.user.setStatus('online');
        

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

