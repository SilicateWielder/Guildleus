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
	
	// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
	// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
	
	const m = await message.channel.send("Ping?");
	m.edit(`Pong! Latency is ${m.createdTimestamp - data.message.createdTimestamp}ms.`);
}

exports.queries = [
	'ping',
	'latency',
];