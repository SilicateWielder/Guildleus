exports.properties = {
	"devOnly": true,
	"helpShort": 'A sample command to testing the process manager.',
	"helpLong": 'A sample command to testing the process manager. Allows for creating and deleting of processes'
}

exports.init = function() {
	return 0;
}

exports.run = async function(command, data) {
	let message = data.message;
	let args = command.args;
	
	let meta = {
		count: 0
	}
	
	if(args[0] == 'create')
		{
		function sample () {
			data.message.channel.send("babump " + arguments[0].count);
			arguments[0].count += 1;
		}

		let endTime = new DateSignature();
		let process = processManager.create(data, 'test', endTime, sample, meta);
		
		if(typeof process == 'object')
		{
			message.channel.send("Created new process with ID: " + process.id);
		} else {
			message.channel.send("ERROR: " + process);
		}
		
	} else if (args[0] == 'delete' && args[1] != undefined) {
		processManager.remove(args[1]);
		
	} else if (args[0] == 'trigger' && args[1] != undefined) {
		processManager.trigger(data, args[1]);
	}
}

exports.queries = [
	'ping',
	'latency',
];