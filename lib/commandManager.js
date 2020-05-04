const fs = require('fs');
const discord = require('discord.js');

let commandTable = {}; // Local command repo.
let commandRef = {}; // Local reference table.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Default command properties, if something isn't set this is the referenced default.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const defaultProperties = {
	"requirements": ['message'],
	"category": "general",
	"helpShort": "A shiny new command!",
	"helpLong": "A shiny new command! I wonder what it does?",
	"devOnly": false,
	"ownerOnly": false,
	"adminOnly": false,
	"synonyms": [],
	"stringable": true,
	"listed": true
}

const defaultPropertyKeys = Object.keys(defaultProperties);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Primary command formatter.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function formatCommand (command) {
	let trimmed = command;
	
	if(command.substr(0, 1) == ' ')
	{
		trimmed = command.substr(1);
	}
	
	const args = trimmed.trim().split(/ +/g); // Arguments.
	const key = args.shift().toLowerCase(); // Command.
	
	return {"key": key, "args": args, "full": trimmed.trim()};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Primary command loader.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.load = function(path)
{
	let commands = {};
	
	// Create a new command directory if none exists.
	if(!fs.existsSync(path)) {
		displayManager.log('main', 'Creating new command directory at \'' + path + '\'', 1);
		
		fs.mkdirSync(path);
	} 

	// Get the filelist.
	let fileList = fs.readdirSync(path);
	
	if(fileList.length == 0)
	{
		// Give a warning if there was no directory available.
		displayManager.log('main', 'Command directory at \'' + path + '\' is empty, no commands are available.', 1);
	} else {
		
		// Normal command loading procedure
		
		global.displayManager.log("main", `${"Loading ".yellow + fileList.length + " commands from directory ".yellow} '${path}'${"...".yellow}`, 3);
		for(let i = 0; i < fileList.length; i++) {
			let fileRaw = fileList[i];
			let file = fileRaw.split(".");
			
			commands[file[0]] = require('./../commands/' + fileRaw);
			let current = commands[file[0]];
			let properties = current.properties;
			
			displayManager.log("main", `	${"...Loaded command".yellow} '${file[0]}' ${"with".yellow} ${Object.keys(properties).length} ${'properties.'.yellow}`, 4);
		}
		
		global.displayManager.log("main", "...Loading complete.".yellow, 3);
	}
	
	////////////////////////////////////////////////////////////
	// Set command properties.
	////////////////////////////////////////////////////////////
	
	let keys = Object.keys(commands);
	
	displayManager.log('main', " ");
	displayManager.log('main', "Beginning command properties check...".yellow, 3);
	for(let c = 0; c < keys.length; c++) {
		
		let currentCommand = commands[keys[c]].properties;
		let unsetProperties = 0;
		let unknownProperties = 0;
		
		//////////////////////////////
		// Count uknown properties.
		//////////////////////////////
		
		let currentCommandKeys = Object.keys(currentCommand);
		for(let p = 0; p < currentCommandKeys.length; p++) {
			
			let currentPropertyName = currentCommandKeys[p];
			
			if(defaultProperties[currentPropertyName] == undefined)	{
				
				unknownProperties++;
			}
		}
		
		//////////////////////////////
		// Count and set missing properties.
		//////////////////////////////
		
		for(let p = 0; p < defaultPropertyKeys.length; p++) {
			
			let currentPropertyName = defaultPropertyKeys[p];
			
			if(currentCommand[currentPropertyName] == undefined) {
				
				commands[keys[c]][currentPropertyName] = defaultProperties[currentPropertyName];
				unsetProperties++;
			}
		}
		
		displayManager.log('main', `Set ${unsetProperties} properties in '${keys[c]}', found ${unknownProperties} unknown properties.`, 4);
	}
	displayManager.log('main', "...Command properties check complete.".yellow, 3);
	
	////////////////////////////////////////////////////////////
	// Generate lookup tables.
	////////////////////////////////////////////////////////////
	
	displayManager.log('main', " ");
	displayManager.log('main', "Beginning command lookup reference generation...".yellow, 3);
	for(let c = 0; c < keys.length; c++) {
		
		commandRef[keys[c]] = keys[c];
		let synonyms = commands[keys[c]].properties.synonyms;
		
		if(synonyms != undefined)
		{
			for(let s = 0; s < synonyms.length; s++)
			{
				if(commandRef[synonyms[s]] == undefined)
				{
					commandRef[synonyms[s]] = keys[c];
					displayManager.log('main', `Adding key '${synonyms[s]}' for command '${keys[c]}'...`, 4);
				} else {
					displayManager.log('main', `key '${synonyms[s]}' already exists, skipping...`, 4);
				}
			}
		}
	}
	displayManager.log('main', "...Command lookup reference generated.".yellow, 3);
	
	commandTable = commands;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Primary command initializer.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.init = function()
{
	displayManager.log('main', " ", 0);
	displayManager.log('main', "Beginning command initialization...".yellow, 3);
	
	let commandKeys = Object.keys(commandTable);
	// Unable to define cid using let, for some reason....
	
	for (let commandId = 0; commandId <  commandKeys.length; commandId++)
	{
		let key = commandKeys[commandId];
		
		if(commandTable[key].init != undefined)
		{
			displayManager.log('main', `Initializing '${key}'...`, 3);
			commandTable[key].init();
		}
	}
	
	displayManager.log('main', "...Finished command initialization".yellow, 3);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Primary command executer.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.execute = function(client, message)
{
	let prefixLength = config.prefix.length;
	let messageStart = message.content.substr(0, prefixLength);
	let messageContent = message.content.substr(prefixLength);
	
	if(messageStart == config.prefix)
	{
		let queue = ("" + messageContent).split(config.prefix);
		
		for(let c = 0; c < queue.length; c++)
		{
			let command = formatCommand(queue[c]);
			
			if(commandRef[command.key] != undefined) {
				
				let newKey = commandRef[command.key];
				let requirements = commandTable[newKey].properties.requirements;
				
				displayManager.log('cmd', `processing command '${command.full}'`);
				
				let sample = {
					'client': client,
					'message': message,
					'discord': discord
				};
				
				let dataBundle = {
					'cmdName': command.key,
				};
				for(let r = 0; r < requirements.length; r++)
				{
					let field = requirements[r];
					
					if (sample[field] != undefined)
					{
						dataBundle[field] = sample[field];
					}
				}
				
				commandTable[newKey].run(command, dataBundle);
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Retrieves a list of all commands without exposing their functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getCommands = function()
{
	let queue = Array.from(arguments);
	if(queue = [])
	{
		queue = Object.keys(commandTable);
	}
	
	let output = {};
	
	for(let c = 0; c < queue.length; c++)
	{
		output[queue[c]] = commandTable[queue[c]].properties;
	}
	
	return (output);
}