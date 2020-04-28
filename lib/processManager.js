
const processTableHeaders = ['Task Id', 'Name', 'Issuing cmd', 'Issuer ID', 'Run Cond', 'End Cond'];
let processTable = [];
let processListing = []; // version of the process table used only to display active processes.
let availableSlots = []; // If a process is terminated, store the key of that open slot here.

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
     , columnWidth: [10, 12, 12, 15, 10, 10] /*in chars*/
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
// Process issuer, adds a new process to the process queue.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.create = function(dataBundle, runCondition, endCondition) {
	let inputsInvalid = false;
	let sid = dataBundle.message.guild.id;
	let issuer = dataBundle.cmdName;
	
	if(issuer == undefined || sid == undefined || arguments[1] == undefined || arguments[2] == undefined || arguments[3] == undefined)
	{
		inputsInvalid = true;		
	}
	
	// This feels more elegant, dunno if it really is though....
	let runString = '';
	let endString = '';
	
	switch (runCondition.constructor)
	{
		case String:
			runString = 'Event' + runCondition;
			break;
		
		case Number:
			runString = 'Interval';
			break;
		
		case DateSignature:
		    runString = runCondition.iso;
			break;
		
		default:
			inputsInvalid = true;
			break;
	}
	
	switch (endCondition.constructor)
	{
		case String:
			if (runCondition != 'perm')
			{
				inputsInvalid = true;
			}
			break;
		
		case Number:
			break;
		
		case DateSignature:
			break;
		
		default:
			inputsInvalid = true;
			break;
	}

	if(inputsInvalid)
	{
		return displayManager.log('error',`Unable to create new process, missing/invalid input`);
	}
	
	let newProcess = {
		'id' : 0, // Process ID
		'priority' : 1, // Priority value
		'name' : arguments[4] || "UNSPECIFIED",
		'issuer': issuer, // Command that issued this process.
		'serverid': sid, // The ID of server where this process was started.
		'endCondition': endCondition, // the end condition, number signifies number of runs, datesig signifies an ending date/time, and perm means the event will run permanently.
		'runCondition': runCondition, // Set to a timeframe(seconds), datesignature object, or event name to execute the event
		'task': arguments[3],
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
	processListing[newProcess.id] = [newProcess.id, newProcess.name, newProcess.issuer, newProcess.serverid, runString, endString];
	
	frames.tasks.setData(
		{
			headers: processTableHeaders,
			data: processListing
		}
	);
	
	screen.render();
	return newProcess;
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process deleter, removes a process from the process queue.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.delete = function(pid) {
	if(processTable[pid] != undefined || processTable[pid] != {})
	{
		processTable[pid] = {};
		processListing[pid] = [pid, '[TERMINATED]', '', '']
		
		availableSlots.push(pid);
	}
	
	screen.render();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main loop, checks and runs all tasks in the process list.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.run = function() {
	
}