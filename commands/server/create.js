const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const emoji = '<:blue_arrow:964977636084416535>'
module.exports = async (client, message, args) => {
    if (!userData.get(message.author.id)) {
        message.reply(":x: You dont have an account created. type `!user new` to create one");
        return;
    }

    if(!args[1] || args[1]?.toLowerCase() === 'list'){  
        
        const panelButton = new Discord.MessageButton()
        .setStyle('LINK')
        .setURL('https://panel.luxxy.host')
        .setLabel("Panel")
        
        const row = new Discord.MessageActionRow()
        .addComponents([panelButton])
        
        const noTypeListed = new Discord.MessageEmbed() 
        .setColor('#36393f')
        .setTitle('Types of servers you can create:')
        .addField(`${emoji} __**Discord Bots**__: `, `> NodeJS \n > Python \n > Java \n > AIO (all in one) \n > Golang \n > Ruby \n > Dotnet`, true)
        .addField(`${emoji} __**Databases**__:`, `> MongoDB \n > Redis`, true)
        .addField(`${emoji} __**Web**__:`, `> Nginx`, true)
        .addField(`${emoji} __**Other**__:`, `> CodeServer \n > Gitea \n > Haste \n > Sharex \n > Share`, true)
        .setFooter("Example: !server create NodeJS Testing Server")

        message.channel.send({
            content: `> :x: What type of server you want me to create?`,
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
        ServerData = require(`../../server_creation/${args[1]?.toLowerCase()}.js`)(userData.get(message.author.id).consoleID, srvname ? srvname : args[1])
    }catch(err){
        message.reply(`:x: I could no find any server type with the name: \`${args[1]}\`\nType \`!server create list\` for more info`)
        return
    }

    let msg = await message.reply(`✅ Attemping to create you a server, please wait. . .`)

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
        
        msg.edit({
            content: null,
            embeds:[
                new Discord.MessageEmbed()
                .setColor(`GREEN`)
                .setTitle(`✅ Server Created Successfully`)
                .setDescription(`
                > **Status:** \`${response.statusText}\`
                > **User ID:** \`${userData.get(message.author.id).consoleID}\`
                > **Server Name:** \`${srvname ? srvname : args[1]}\`
                > **Server Type:** \`${args[1].toLowerCase()}\`
                `)
            ]
        })

        serverCount.add(message.author.id + '.used', 1)
            
    }).catch(error => {
        if (error == "Error: Request failed with status code 400") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setColor('RED')
                    .addField(`❌ Server creation failed`, `The node had ran out of allocations/ports!`)
                ]
            })
        }else if (error == "Error: Request failed with status code 504") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setColor('RED')
                    .addField(`❌ Server creation failed`, `The node is currently offline or having issues`)
                ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setColor('RED')
                    .addField(`❌ Server creation failed`, `Uh oh, This shouldn\'t happen, Try again in a minute or two.`)
                    ]
            })
        }else if (error == "Error: Request failed with status code 429") {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setColor('RED')
                    .addField(`❌ Server creation failed`, `Uh oh, This shouldn\'t happen, Try again in a minute or two.`)
                    ]
            })
        }else {
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setColor('RED')
                    .addField(`❌ Server creation failed`, `${error}.`)
                ]
            })
        }
    })
    
}