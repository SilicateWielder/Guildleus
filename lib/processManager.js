
const processTableHeaders = ['task Id', 'name', 'issuing cmd', 'issuer ID'];
let processTable = [];
let processListing = []; // version of the process listing used only to display active processes.
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
     , columnWidth: [10, 12, 12, 10] /*in chars*/
	 , scrollbar: { bg: 'blue' }}
);

frames.tasks.focus();
	 
frames.tasks.setData(
{ 
	headers: processTableHeaders,
	data: []
	}
);
	  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process issuer, adds a new process to the process list.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.create = function(source) {
	if(arguments.length < 3 || typeof arguments[0] != 'string' || typeof arguments[1] != 'number')
	{
		return displayManager.log('error',`Unable to create new process, missing/invalid input`);
	}
	
	let newProcess = {
		'id' : 0, // Process ID
		'priority' : 1, // Priority value
		'name' : "UNSPECIFIED",
		'issuer': 'someCommand', // Command that issued this process.
		'serverid': 'someServerId', // The ID of server where this process was started.
		'endCondition': 'perma', // the end condition, number signifies number of runs, datesig signifies an ending date/time, and peram means the event will run permanently.
		'scheduleCondition': '1200', // Set to a timeframe(seconds), datesignature object, or event name to execute the event
		'dataBundle': {} // The databundle for this process, store any needed information here.
	};
	
	////////////////////////////////////////////////////////////
	// Determine process ID.
	////////////////////////////////////////////////////////////
	if(availableSlots.length == 0)
	{
		newProcess.id = Object.keys(processTable).length;	
	} else {
		newProcess.id = availableSlots.shift(); // Remove the first available slot and set the new processes' id to that value.		
	}
	
	displayManager.log('main', `Created new process ID '${newProcess.id}'`);
	
	////////////////////////////////////////////////////////////
	// Add process
	////////////////////////////////////////////////////////////
	processTable[newProcess.id] = newProcess;
	processListing[newProcess.id] = [newProcess.id, newProcess.name, newProcess.issuer, newProcess.serverid];
	
	frames.tasks.setData(
		{
			headers: processTableHeaders,
			data: processListing
		}
	);
	
	return newProcess;
}