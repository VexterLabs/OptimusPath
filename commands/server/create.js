const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const emoji = '<:blue_arrow:964977636084416535>'
module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id })
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one`);
        return;
    }

    if(!args[1] || args[1]?.toLowerCase() === 'list'){  
        
        const panelButton = new Discord.ButtonBuilder()
        .setStyle('Link')
        .setURL('https://panel.luxxy.host')
        .setLabel("Panel")
        
        const row = new Discord.ActionRowBuilder()
        .addComponents([panelButton])
        
        const noTypeListed = new Discord.EmbedBuilder() 
        .setColor(0x36393f)
        .setTitle('Types of servers you can create:')
        .addFields({ name: `${emoji} __**Discord Bots**__: `, value: `> NodeJS \n > Python \n > AIO (all in one) \n > Golang \n > Ruby \n > Dotnet \n > RedBot`, inline: true })
        .addFields({ name: `${emoji} __**Databases**__:`, value: `> MongoDB \n > Redis`, inline: true })
        .addFields({ name: `${emoji} __**Web**__:`, value: `> Nginx \n > Uptime-Kuma`, inline: true })
        .addFields({ name: `${emoji} __**Other**__:`, value: `> CodeServer \n > Gitea \n > Haste \n > Sharex \n > Share`, inline: true })
        .setFooter({ text: `Example: ${config.bot.prefix}server create discord nodejs` })

        message.channel.send({
            content: `> ${error} What type of server you want me to create?`,
            embeds: [noTypeListed],
            components: [row]
        })
        return 
    }

    if(!serverCount.get(message.author.id)) {
        serverCount.set(message.author.id, {
            used: 0,
            have: 3
        })
    }else if(serverCount.get(message.author.id).used >= serverCount.get(message.author.id).have) return message.reply(`:x: You already used your all server slots. For more info run: !server count`)

    let ServerData
    let srvname = args.slice(2).join(' ')

    try{
        ServerData = require(`../../server_creation/${args[1]?.toLowerCase()}.js`)(userDB.consoleID, srvname ? srvname : args[1], config.pterodactyl.depolymentlocations)
    }catch(err){
        console.log(err)
        message.reply(`${error} I could no find any server type with the name: \`${args[1]}\`\nType \`!server create list\` for more info`)
        return
    }

    let msg = await message.reply(`${success} Attemping to create you a server, please wait. . .`)

    axios({
        url: config.pterodactyl.host + "/api/application/servers",
        method: 'POST',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
        data: ServerData,
    }).then(response => {

        console.log(`[${new Date().toLocaleString()}] [${message.guild.name}] [${message.author.tag}] Created server: ${response.data.attributes.name}`)

        const serverButton = new Discord.ButtonBuilder()
        .setStyle('Link')
        .setURL(`${config.pterodactyl.host}/server/${response.data.attributes.identifier}`)
        if (response.data.attributes.name.length < 25) {
            serverButton.setLabel(`[${response.data.attributes.name}] Server Link`)
        } else {
            serverButton.setLabel(`Server Link`)
        }

        const row2 = new Discord.ActionRowBuilder()
        .addComponents([serverButton])
        
        msg.edit({
            content: null,
            embeds:[
                new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Green)
                .setTitle(`${success} Server Created Successfully`)
                .setDescription(`
                > **Status:** \`${response.statusText}\`
                > **User ID:** \`${userDB.consoleID}\`
                > **Server ID:** \`${response.data.attributes.identifier}\`
                > **Server Name:** \`${srvname ? srvname : args[1]}\`
                > **Server Type:** \`${args[1].toLowerCase()}\`
                `)
            ],
            components: [row2]
        })

        const logchannel = client.channels.cache.get(config.logs.createlog)
        if (!logchannel) {
            console.log(`[${new Date().toLocaleString()}] [ERROR] [LOGS] Could not find the logs channel.`)
            return;
        }
        
        logchannel.send({ embeds: [ new Discord.EmbedBuilder().addFields({ name: `Server Created`, value: `**User ID:** \`${userDB.consoleID}\`\n**Server Name:** \`${srvname ? srvname : args[1]}\`\n**Server Type:** \`${args[1].toLowerCase()}\``}).addFields({ name: `Server ID`, value: `\`${response.data.attributes.uuid}\``}).setColor(Discord.Colors.Red).addFields({ name: `Server Status`, value: `\`${response.statusText}\``}).setFooter({ text: `User ID: ${userDB.consoleID}`}).setTimestamp() ] })
        serverCount.add(message.author.id + '.used', 1)
            
    }).catch(error => {
        if (error == "Error: Request failed with status code 400") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addField({ name: `${error} Server creation failed`, value: `The node had ran out of allocations/ports!`})
                ]
            })
        }else if (error == "Error: Request failed with status code 504") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addFields({ name: `${error} Server creation failed`, value: `The node is currently offline or having issues`})
                ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addFields({ name: `${error} Server creation failed`, value: `Uh oh, This shouldn\'t happen, Try again in a minute or two.`})
                    ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addFields({ name: `${error} Server creation failed`, value: `Uh oh, This shouldn\'t happen, Try again in a minute or two.`})
                    ]
            })
        }else {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addFields({ name: `${error} Server creation failed`, value: `${error}.`})
                ]
            })
        }
    })
    
}