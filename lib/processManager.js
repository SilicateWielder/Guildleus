let processTable = [];
let availableSlots = []; // If a process is terminated, store that open slot here.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process issuer, adds a new process to the process list.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.createProcess = function(source) {
	let newProcess = {
		'pid' : 0, // Process ID
		'source': 'someCommand', // Command that issued this process.
		'server': 'someServerId', // The ID of server where this process was started.
		'endDate': 'perma', // Usually a date
		'scheduledTime': '1200', // Time that the process runs it's command, if applicable, processes also end at this time
		'dataBundle': {} // The databundle for this process, store any needed information here.
	};
	
	let processId = 0;
	if(availableSlots.length == 0)
	{
		processId = Object.keys(processTable).length;	
	} else {
		processId = availableSlots.shift(); // Remove the first available slot and set the new processes' id to that value.		
	}
	
	displayManager.log('main', `Created new process ID '${processId}'`);
	
	processTable[processId] = newProcess;
}