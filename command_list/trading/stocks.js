const { MessageEmbed } = require("discord.js");
const { Stocks } = require(`${__basedir}/db_objects`);
const { paginateEmbeds } = require(`${__basedir}/utilities`);

const { gravestone } = require(`${__basedir}/emojis.json`);

module.exports = {
    name: ["stocks"],
    description: "Displays the stock market!",
    
    usage: [
    ],

    async execute (message) {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        
        const embeds = [];

        const stocks = await Stocks.findAll();

        function makeEmbed() {
            return new MessageEmbed().setTitle("Stocks!").setColor(randomColor);
        }

        let embed;
        
        for (const i in stocks) {
            const stock = stocks[i];

            if (i % 10 === 0) {
                embed = makeEmbed();
                embeds.push(embed);  
            }
            
            if (stock.currentPrice < 1) {
                embed.addField(`${stock.name}`, "STOCK NOT AVAILABLE: Share price less than 1.");
            }

            else {
                embed.addField(`${stock.name} (${stock.displayName})`, `Yesterday's price: ${stock.oldPrice}${gravestone}, Current price: ${stock.currentPrice}${gravestone}, Amount of shares bought: ${stock.amountBought}, Average change rate: ${stock.averageChange}%`);
            }
        }

        paginateEmbeds(message.channel, message.author, embeds);
    }
};
