// Core Dependencies
const Discord = require('discord.js');
const fs = require('fs');

// Aditional dependencies
const configLoader = require('./lib/configloader.js');
const displayManager = require('./lib/displayManager.js');

let windows = displayManager.windows;

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
prfix = ~

# Name of the bot
name = SomeBot`;


defaultConfigs['./tokens.properties'] = `# Login token to use with release versions
mainToken = 1234567890SomeTokenHereABCDEFGHJKLMNOPQRSTUVWXYZ

# Login token to use with testing versions
devToken = 1234567890SomeTokenHereABCDEFGHJKLMNOPQRSTUVWXYZ`;

// Now, we can trigger the configuration loader to run, 
global.config = configLoader.loadAll(defaultConfigs);
Object.freeze(global.config);

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

client.on('ready', () => {
  //console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

displayManager.log('main',`Using token ${loginToken}`);
client.login(loginToken);