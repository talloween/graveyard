const { makeEmbed } = require(`${__basedir}/utilities/generalFunctions.js`);  

const { info } = require(`${__basedir}/configs/colors.json`);

module.exports = {
    name: "guildMemberAdd",
    execute(graveyard) {
        graveyard.on("guildMemberAdd", async guildMember => {
            //
            //! Welcome message
            //

            //* find the welcome channel and message in the serverConfig file
            const welcomeChannelInConfig = await graveyard.serverConfig.get(guildMember.guild.id).welcome_channel[1];
            const welcomeChannel = await graveyard.channels.cache.get(welcomeChannelInConfig);

            const welcomeMessage = await graveyard.serverConfig.get(guildMember.guild.id).welcome_message[1];
            const welcomeImageURL = await graveyard.serverConfig.get(guildMember.guild.id).welcome_image[1];

            //* if theyre both set, send the welcome message
            if (welcomeMessage !== null && welcomeChannel !== null) {
                await welcomeChannel.send({ content: `${guildMember}`, embeds: [await makeEmbed(graveyard, welcomeMessage, null, info, welcomeImageURL)]});
            }
        });
    }
};