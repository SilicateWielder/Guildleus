let processTable = [];
let availableSlots = []; // If a process is terminated, store that open slot here.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create new terminal elements.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const contrib = require('blessed-contrib');

navbar.appendItem("Tasks");

frames.tasks = contrib.table(
     { keys: true
     , fg: 'white'
     , selectedFg: 'wh4ite'
     , selectedBg: 'blue'
     , interactive: true
     , width: '100%-2'
     , height: '100%-2'
     , columnSpacing: 10 //in chars
     , columnWidth: [16, 12, 12] /*in chars*/ });
	 
	frames.tasks.setData(
		{ 
			headers: ['task ID', 'issuing cmd', 'issuer ID'],
			data: [ [1, 2, 3], [4, 5, 6] ]
		}
	)
	  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process issuer, adds a new process to the process list.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.createProcess = function(source) {
	let newProcess = {
		'pid' : 0, // Process ID
		'source': 'someCommand', // Command that issued this process.
		'server': 'someServerId', // The ID of server where this process was started.
		'endCondition': 'perma', // the end condition, number signifies number of runs, datesig signifies an ending date/time, and peram means the event will run permanently.
		'scheduleCondition': '1200', // Set to a timeframe(seconds) datesignature object, or event name to execute the event
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