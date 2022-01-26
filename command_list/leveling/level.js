const { MessageEmbed } = require("discord.js");
const { Users } = require("../../db_objects");

module.exports = {
    name: "level",
    description: "See your, or someone else's level!",
    usage: [],
    async execute(message) {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const user = message.mentions.users.first() || message.author;
        
        if (user.bot) {return message.channel.send("Bots can't be ranked!");}

        const userInDb = await Users.findOne({
            where: {user_id: user.id}
        });

        const embed = new MessageEmbed()
            .setAuthor({ name: `${user.username} is level ${userInDb.level || "0"}!`, iconURL: user.avatarURL() })
            .setDescription(`${userInDb.exp || "0"}/${userInDb.reqexp || "1000"} EXP`)
            .setColor(randomColor);

        message.channel.send({embeds: [embed]});
    }
};