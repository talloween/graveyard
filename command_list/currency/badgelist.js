const { getUserItems } = require(`${__basedir}/functions`);
const { MessageEmbed } = require("discord.js");
const { paginateEmbeds } = require(`${__basedir}/functions`);
const { Users } = require(`${__basedir}/db_objects`);

module.exports = {
    name: "badgelist",
    description: "See what badges you currently own!",

    usage: [

    ],
    async execute(message) {

        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        
        const targetUser = message.author;

        const userInDb = await Users.findOne({ where: { user_id: targetUser.id } });

        const items = await getUserItems(targetUser.id);

        let embed;

        const embeds = [];

        function makeEmbed() {
            return new MessageEmbed().setTitle(`${userInDb.badge || " "}${targetUser.username}'s badges`).setColor(randomColor);
        }
 
        if (items.length === 0) {
            message.channel.send(`${userInDb.badge || " "}${targetUser.username} has no badges!`);
            return;
        }

        for (const i in items) {
            const item = items[i];

            if (i % 10 === 0) {
                embed = makeEmbed();
                embeds.push(embed);  
            }

            if (item.item.isBadge) {
                embed.addField(`${item.item.item_emoji}${item.item.name}`, `Badge Name: ${item.item.name}`);
            }
            
            
        }

        paginateEmbeds(message.channel, message.author, embeds);
    }
};