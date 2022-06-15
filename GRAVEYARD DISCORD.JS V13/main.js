// Set the base directory to remove relative paths.
global.__basedir = __dirname;

// Set the time the bot started for calculating uptime.
global.startTimestamp = new Date();

const fs = require("node:fs");

const { Client, Intents, Collection } = require("discord.js");
const { token } = require(`${__basedir}/configs/graveyard_config.json`);
const graveyard = new Client({ intents: 
    [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ], allowedMentions: { parse: ["users", "roles"] }
});

//
//! Functions that are required in this file
//

const { sendError } = require(`${__basedir}/utilities/sendError.js`);

const { getCommandCategories } = require(`${__basedir}/utilities/commandFunctions.js`);

//
//! Collections
//  

graveyard.serverConfig = new Collection();
graveyard.commands = new Collection();
graveyard.backgroundProcesses = new Collection();
graveyard.currency = new Collection();
graveyard.achievements = new Collection();

//
//! Currency system methods
//

//
//! Commands
//

// Load commands from the command_list folder
const categoryFolders = getCommandCategories();
for (const category of categoryFolders) {
    const commandFiles = fs.readdirSync(`${__basedir}/commands/${category}`)
        .filter(commandFile => commandFile.endsWith(".js"));

    for (const commandFile of commandFiles) {
        const command = require(`${__basedir}/commands/${category}/${commandFile}`);
        command.category = category;
        graveyard.commands.set(command.data.name, command);
    }
}

//
//! Achievements
//


//
//! Server configuration
//

const defaultServerConfig = require(`${__basedir}/configs/default_server_config.json`);
const { saveServerConfig } = require(`${__basedir}/utilities/configFunctions.js`);

let serverConfigJSON;
try {
    serverConfigJSON = require(`${__basedir}/server_config.json`);
} catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
        serverConfigJSON = {};
    }
}
for (const guildId in serverConfigJSON) {
    graveyard.serverConfig.set(guildId, serverConfigJSON[guildId]);
}

async function addNewGuildServerConfigs() {
    // add new guilds to the server_config.json file
    const guilds = await graveyard.guilds.fetch();

    guilds.each(guild => {
        if (graveyard.serverConfig.get(guild.id) === undefined) {
            // JSON.parse JSON.stringify makes a deep copy, which is needed to fix a bug where editing one config edits multiple configs because they are the same object
            graveyard.serverConfig.set(guild.id, JSON.parse(JSON.stringify(defaultServerConfig))); 
        }
    });
    // save it to the server_config.json file
    await saveServerConfig(graveyard.serverConfig);
}

//
//! Login to discord and update server configurations
//

graveyard.login(token);

graveyard.on("guildCreate", async () => { await addNewGuildServerConfigs(); });

graveyard.once("ready", async () => {
    await addNewGuildServerConfigs();

    console.log(`Initiated new bot instance at ${new Date().toUTCString()}`);
});

//
//! Background tasks
//

//* add all processfiles to the collection
const processFiles = fs.readdirSync(`${__basedir}/events`).filter(processFile => processFile.endsWith(".js"));

for (const processFile of processFiles) {
    const backgroundProcess = require(`${__basedir}/events/${processFile}`);
    graveyard.backgroundProcesses.set(backgroundProcess.name, backgroundProcess);
}

//* start each background process once
graveyard.backgroundProcesses.forEach(backgroundProcess => {
    backgroundProcess.execute(graveyard);
});

//
//! Error handling
//

// (i know its advanced, but try your best to understand)
process.on("unhandledRejection", sendError);


//
//! Command execution
//

graveyard.on("interactionCreate", async interaction => {
    //* make sure the interaction is a command, because this only handles commands
    if (!interaction.isCommand()) return;


});