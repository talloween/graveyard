const { addNewGuildServerConfigs } = require("../utilities/configFunctions");

const { info } = require("../configs/colors.json");
const { devServerInviteLink, websiteLink } = require("../configs/development_config.json");

const { makeEmbed } = require("../utilities/generalFunctions");

const { log } = require("../utilities/botLogFunctions");

module.exports = {
    name: "guildCreate",
    execute(graveyard) {
        graveyard.on("guildCreate", async guild => {
            //* log that we joined a guild
            await log(`Joined guild: {NAME: {${guild.name}} ID: {${guild.id}}}`);
            
            //  
            //! Create database entries 
            //

            // Decided to remove this because its unnecessary. 
            //Missing database entries are automatically created whenever you call the "get(database table)Guild()" function from db_objects.js

            //
            //! Add new guild server configs
            //

            //* loops through every guild in the cache of the bot, then makes a config template for it
            await addNewGuildServerConfigs(graveyard);

            //
            //! Try to send a thank you for adding me message
            //
            
            const fields = [
                {
                    name: "Set up configuration!",
                    value:  "Set up configuration for your Discord server with our dashboard on our website!"
                }, 
                {
                    name: "Make sure I've got the permissions I need!",
                    value: "If you want me to be able to moderate members, delete messages and so forth, make sure to give me permissions to do so!"
                },
                {
                    name: "Check out our website and Discord server for more information.",
                    value: `${devServerInviteLink}, ${websiteLink}`
                }
            ];

            const channels = await guild.channels.cache.filter(channel => channel.type == "GUILD_TEXT");
            channels.first().send({ embeds: [await makeEmbed(graveyard, "Thank you for adding me!", fields, info)] });
        });
    }
};