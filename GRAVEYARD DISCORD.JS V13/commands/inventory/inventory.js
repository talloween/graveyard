const { SlashCommandBuilder } = require("@discordjs/builders");
const { makeEmbed } = require("../../utilities/generalFunctions");

const { userInventory, currencyShop } = require(`${__basedir}/db_objects.js`);

const { gravestone } = require(`${__basedir}/configs/emojis.json`);

const { EmbedButtonManager } = require(`${__basedir}/utilities/generalClasses.js`);

const paginator = new EmbedButtonManager;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("View your inventory"),

    async execute(interaction) {
        await interaction.reply({ content: "Opening your inventory..." });

        // get the users items
        const userItems = await userInventory.getItems(interaction.user.id);

        // complain if the user doesn't have any items.
        if (userItems.length < 1) {
            return interaction.channel.send("Doesn't seem like you have any items. Sorry!");
        }

        // declare array where we will store our embeds
        const inventoryEmbeds = [];
        
        // declare inventory embed
        let inventoryEmbed = await makeEmbed(interaction.client, `${interaction.user.username}'s inventory`, null, "BLUE", null);

        for (let i = 0; i < userItems.length; ++i) {
            if (i % 10 === 0) {
                //make new embed
                inventoryEmbed = await makeEmbed(interaction.client, `${interaction.user.username}'s inventory`, null, "BLUE", null);

                //push the embed into the embeds array
                inventoryEmbeds.push(inventoryEmbed);
            }

            const item = await currencyShop.findOne({
                where: {
                    itemId: userItems[i].itemId
                }
            });

            // we don't delete the item from the users inventory if they sell all of it to reduce disk writing wear and tear.
            if (item.amount < 1) continue;

            // here we check the properties of the item in the inventory, and in the shop
            // if certain criteria are met, we add special "flags" to the item to be displayed in the embed, eg. "item is not available" 
            const embedFieldTitle = `${item.itemName}: ${item.itemDescription}`;
            let embedFieldDescription = "";

            embedFieldDescription += `\nOwned: ${userItems[i].amount}`;
            embedFieldDescription += `\nCategory: ${item.itemCategory}`;
            embedFieldDescription += `\nCost: ${item.itemCost}${gravestone}`;
        
            if (item.isAvailableToBuy === false) embedFieldDescription += "\n⚠️NOT PURCHASEABLE⚠️";
            if (item.itemCategory === "developer") embedFieldDescription += /*i have no idea why vscode flags these as invisible*/"\n⚠️DEVELOPER ITEM⚠️";
            
            inventoryEmbed.addField(embedFieldTitle, embedFieldDescription);
        }

        //loop through the inventoryembeds array and remove any embeds that don't have any fields
        for (let i = 0; i < inventoryEmbeds.length; ++i) {
            if (inventoryEmbeds[i].fields.length === 0) {
                inventoryEmbeds.splice(inventoryEmbeds[i], 1);
            }
        }

        const message = await interaction.channel.send({ embeds: [inventoryEmbeds[0]] });

        const buttons = [
            {
                buttonType: "next",
                buttonText: "Next",
                buttonStyle: "PRIMARY"
            },
            {
                buttonType: "previous",
                buttonText: "Back",
                buttonStyle: "PRIMARY"
            },
            {
                buttonType: "start",
                buttonText: "Start",
                buttonStyle: "SECONDARY"
            },
            {
                buttonType: "end",
                buttonText: "End",
                buttonStyle: "SECONDARY"
            }
        ];

        // adds the buttons to an array with messageComponentrows
        await paginator.addButtons(buttons);

        // adds all of the messageComponentRows to the message.
        await paginator.pushButtons(message, interaction.channel);

        // wait for the user to press a button
        await paginator.collectButtonPresses(interaction.channel, interaction.user.id, /*provide a time limit in seconds*/60, inventoryEmbeds, message);
    },
};
