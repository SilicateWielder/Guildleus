exports.properties = {
	"requirements": ['message'],
	"helpShort": 'Lists the available commands',
	"helpLong": 'Lists the available commands, use \'~help [command]\' for detailed help on a specific command.'
}

let page = [];
let cmds = {};
let keys = [];

exports.init = function() {
	displayManager.log('main', 'Building Help menu...', 4);
	
	cmds = commandManager.getCommands();
	keys = Object.keys(cmds);
	
	
	for(let c = 0; c < keys.length; c++)
	{
		displayManager.log('main', '...Adding entry for \'' + keys[c] + '\'', 5);
		
		page += ('`~' + keys[c] + '` - ' + cmds[keys[c]].helpShort + '\n'); 
	}
	
	displayManager.log('main', '...Help Menu generated.', 4);
}

exports.run = async function(command, data) {
	let message = data.message;
	
	message.channel.send(page);
}

exports.queries = [
	'help'
];