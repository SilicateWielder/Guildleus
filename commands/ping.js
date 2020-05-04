exports.properties = {
	"requirements": ['message'],
	"synonyms": ['latency'],
	"helpShort": 'Provides the current latency of the bot',
	"helpLong": 'Provides the current latancy of the bot, which is the time it takes for the bot to see and respond to a message'
}

let responses = [
	'It\'s not like I gave you that ping becuase I like you B-baka!',
	'Nice!',
	'What in the fuck?',
	'O_O',
	'Bruh.',
	'Those are rookie numbers!',
	'Maybe get faster internet.',
	'Damn.'
];

exports.init = function() {
	return 0;
}

exports.run = async function(command, data) {
	let message = data.message;
	let args = command.args;
	
	let suffix = "";
	if(args[0] == 'passive')
	{
		let roll = Math.floor(Math.random() * responses.length);
		
		suffix = responses[roll]
	}
	
	// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
	// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
	
	const m = await message.channel.send("Ping?");
	m.edit(`Pong! Latency is ${m.createdTimestamp - data.message.createdTimestamp}ms. ${suffix}`);
}

exports.queries = [
	'ping',
	'latency',
];