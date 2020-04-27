exports.properties = {
	"devOnly": true,
	"helpShort": 'Provides the current latency of the bot',
	"helpLong": 'Provides the current latancy of the bot, which is the time it takes for the bot to see and respond to a message'
}

exports.init = function() {
	return 0;
}

exports.run = async function(client, data) {
	let message = data.message;
	
	let process = processManager.create();
	
	if(typeof process == 'object')
	{
		message.channel.send("Created new process with ID: " + process.id);
	} else {
		message.channel.send("ERROR: " + process);
	}
}

exports.queries = [
	'ping',
	'latency',
];