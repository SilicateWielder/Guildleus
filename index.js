//Version declaration.
const ver = "0.3 ALPHA";

/* Define the defaults for our configuration files.
We do this so that, if a guildleus bot, or the core is downloaded and run for the first time
the user would be able to configure the bot with minimal hassle.

the key is the path of the file, and the value is the default for  that configuration file
*/
let defaultConfigs = {};
defaultConfigs['./config.properties'] = `# Complete all of the property files in the directory and then come back and set this to true.
# The bot will not work unless this is filled out.
complete = false

# Set this to false if you're running for a release build.
devmode = true

# Prefix that the bot responds to, this can be a string.
prefix = ~

# Name of the bot
name = SomeBot`;


defaultConfigs['./tokens.properties'] = `# Login token to use with release versions
mainToken = 1234567890SomeTokenHereABCDEFGHJKLMNOPQRSTUVWXYZ

# Login token to use with testing versions
devToken = 1234567890SomeTokenHereABCDEFGHJKLMNOPQRSTUVWXYZ`;

defaultConfigs['./bot.properties'] = `# Add your own properties fields to this file.`;

// Core Dependencies
const Discord = require('discord.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Aditional dependencies
const configLoader = require('./lib/configloader.js');
	// Now, we can pause loading out config files to trigger the configuration loader to run.
	global.config = configLoader.loadAll(defaultConfigs);
	config.version = ver;
	Object.freeze(global.config);

global.dateSignature = require('./lib/util/datesig.js').main;

const displayManager = require('./lib/displayManager.js');
global.displayManager = displayManager;

global.commandManager = require('./lib/commandManager.js');
global.processManager = require('./lib/processManager.js'); // Testing.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Determine which login token to use.
let loginToken = "";
if(config.devmode)
{
	loginToken = config.devToken;
} else {
	loginToken = config.mainToken;
}
Object.freeze(loginToken);

// Create the client.
const client = new Discord.Client();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let primed = false;

client.on('ready', () => {
	displayManager.updateStatus('Version', config.version);
	
	let modeStatus = "NORMAL";
	if(config.devmode)
	{
		modeStatus = "TESTING";
	}
	displayManager.updateStatus('Mode', modeStatus);
	
	
	displayManager.updateStatus('Users', client.users.cache.size);
	displayManager.updateStatus('Channels', client.channels.cache.size);
	displayManager.updateStatus('Guilds', client.guilds.cache.size);
	
	// Begin loading commands.
	commandManager.load(config.commandPath);
	commandManager.init();
	
	primed = true;
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Client event handler code.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('message', msg => {
	if(primed && !msg.author.bot)
	{
		commandManager.execute(client, msg);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

displayManager.log('main',`Using token ${loginToken}`);
client.login(loginToken);