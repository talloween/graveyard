const developmentConfig = require(`${__basedir}/development_config.json`);
const { MessageEmbed } = require('discord.js');
 
module.exports = {
	name: "makemoney",
	execute (client) {
        client.on("messageCreate", message => {
            if (message.author.bot && !testing) return;
            if (message.author.bot && testing && message.author.id !== developmentConfig.testing_bot_discord_user_id) return;

            // Choose random amount of money to give to the user.
            function randomMoneyAmount() {
                return Math.floor(Math.random() * 300)
            }

            let moneyAmount = randomMoneyAmount()

            // Make a fancy embed to show to the user.
            const embed = new MessageEmbed()
            .setTitle(`You got lucky!`)
            .setDescription(`+${moneyAmount}💰`)
            .setColor("ORANGE")

            // Here it does math, and there is a 1% the if statement is true, if it's true, send the embed and then give the user their hard earned money!
            if(Math.random() < 0.01) {
                message.reply({ embeds: [embed]});
                message.client.currency.add(message.author.id, moneyAmount);
                return;
            }

            // Give the user 1 coin per message.
            message.client.currency.add(message.author.id, 1);
            
            
        });
	}		
};
