const { EmbedBuilder } = require("discord.js");
const { post } = require("node-superfetch");

module.exports = {
    name: "eval",
    category: "Owner",
    description: "Eval Code",
    run: async (client, message, args) => {
        if (message.author.id === "517107022399799331") {
            
            const embed = new EmbedBuilder()
                .addFields({ name: "Input", value: "```js\n" + args.join(" ") + "```"});
    
            try {
                const code = args.join(" ");
                if (!code) return message.channel.send("Please include the code.");
                let evaled;
    
                if (code.includes(`SECRET`) || code.includes(`TOKEN`) || code.includes("process.env")) {
                    evaled = "No, shut up, what will you do it with the token?";
                } else {
                    evaled = await eval(code);
                }
    
                if (typeof evaled !== "string") evaled = await require("util").inspect(evaled, { depth: 0 });
    
                let output = clean(evaled);
                if (output.length > 1024) {
                   
                    const { body } = await post("https://hastebin.com/documents").send(output);
                    embed.addField("Output", `https://hastebin.com/${body.key}.js`).setColor(0xFF0000);
                  
                } else {
                    embed.addFields({ name: "Output", value: "```js\n" + output + "```" }).setColor(0xFF0000);
                }
    
                message.channel.send({embeds: [embed]});
    
            } catch (error) {
                let err = clean(error);
                if (err.length > 1024) {
                   
                    const { body } = await post("https://hastebin.com/documents").send(err);
                    embed.addFields({ name: "Output", value: `https://hastebin.com/${body.key}.js`}).setColor(0xFF0000);
                } else {
                    embed.addFields({ name: "Output", value: "```js\n" + err + "```"}).setColor(0xFF0000);
                }
    
                message.channel.send({embeds: [embed]});
            }
        } else {
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("You are not the owner of this bot.")
                        .setColor(0xFF0000)
                        .setFooter("sus", client.user.displayAvatarURL({
                            format: "png",
                            dynamic: true,
                            size: 1024
                        }))
                ]
            })
        }
    }
}
function clean(string) {
    if (typeof text === "string") {
        return string.replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
    } else {
        return string;
    }
                            }