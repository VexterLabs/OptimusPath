const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author
    if(!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            used: 0,
            have: 3
        })
    }

    message.channel.send({
        embeds:[
            new Discord.EmbedBuilder()
            .setTitle(`${success} ${user.username}'s Server Count`)
            .setColor(0x677bf9)
            .setDescription(`**${user.username}** have used \`${serverCount.get(user.id).used}/${serverCount.get(user.id).have}\` servers`)
        ]
    })
}