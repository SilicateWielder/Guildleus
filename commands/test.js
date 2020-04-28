exports.properties = {
	"devOnly": true,
	"helpShort": 'Provides the current latency of the bot',
	"helpLong": 'Provides the current latancy of the bot, which is the time it takes for the bot to see and respond to a message'
}

exports.init = function() {
	return 0;
}

exports.run = async function(command, data) {
	let message = data.message;
	let args = command.args;
	
	if(args[0] == 'create')
		{
		function sample (message = data.message) {
			message.channel.send("babump");
		}

		let endTime = new DateSignature();
		let process = processManager.create(data, 15, endTime, sample);
		
		if(typeof process == 'object')
		{
			message.channel.send("Created new process with ID: " + process.id);
		} else {
			message.channel.send("ERROR: " + process);
		}
	} else if (args[0] == 'delete' && args[1] != undefined) {
		processManager.remove(args[1]);
	}
}

exports.queries = [
	'ping',
	'latency',
];