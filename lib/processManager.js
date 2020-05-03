
const processTableHeaders = ['Task Id', 'Name', 'Issuing cmd', 'Issuer ID', 'Run Cond', 'End Cond'];
let processTable = [];
let processListing = []; // version of the process table used only to display active processes.
let availableSlots = []; // If a process is terminated, store the key of that open slot here.
let aliasTable = {}; // alis table for processes.
let callstack = [];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create new terminal elements.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const contrib = require('blessed-contrib');
const task = require('./util/task.js').main;

navbar.appendItem("Tasks");

frames.tasks = contrib.table(
     { keys: true
     , fg: 'white'
     , selectedFg: 'white'
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
// Miscellanious Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Default Error handling. /////////////////////////////////

function processErrorHandler () {
	let message = arguments[0].split('\n');
	
	for( let l = 0; l < message.length; l++ )
	{
		displayManager.log('error', message[l]);
	}
};

// Process grabber. ////////////////////////////////////////

function getProcessId(pid, dataBundle) 
{
	if(parseInt(pid).toString() == pid)
	{
		if(processTable[pid] != undefined)
		{
			return (pid);
		} else {
			displayManager.log('error', 'event with ID ' + pid + ' does not exist.');
		}
	} 
	
	////////////////////////////////////////////////////////////
	// String PID handler.
	////////////////////////////////////////////////////////////
	
	else
	{
		let similarTasks = aliasTable[pid];
		
		if(similarTasks == undefined)
		{
			displayManager.log('error', 'No events with name: "' + pid + '" exist.');
			return;
		}
		
		if(similarTasks != undefined)
		{
			for(candidate = 0; candidate < similarTasks.length; candidate++)
			{
				let pid = similarTasks[candidate];
				let task = processTable[pid];
				
				if(task.channel == dataBundle.message.channel.id)
				{
					return (pid);
				}
			}
		}
	}
	
	return (undefined);
};
	  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process issuer, adds a new process to the process queue.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.create = function(dataBundle, runCondition, endCondition) {
	let inputsInvalid = false;
	let sid = dataBundle.message.channel.id;
	let issuer = dataBundle.cmdName;
	
	if(issuer == undefined || sid == undefined || arguments[1] == undefined || arguments[2] == undefined || arguments[3] == undefined)
	{
		inputsInvalid = true;		
	}
	
	////////////////////////////////////////////////////////////
	// This feels more elegant, dunno if it really is though....
	////////////////////////////////////////////////////////////
	
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
		    runString = 'DateSig';
			break;
		
		default:
			inputsInvalid = true;
			break;
	}
	
	////////////////////////////////////////////////////////////
	
	switch (endCondition.constructor)
	{
		case String:
			if (runCondition != 'perm')
			{
				inputsInvalid = true;
			} else {
				endString = 'None';
			}
			break;
		
		case Number:
			endString = 'Timeframe';
			break;
		
		case DateSignature:
		    endString = 'DateSig';
			break;
		
		default:
			inputsInvalid = true;
			break;
	}

	let retrievedName = 'UNSPECIFIED';
	let retrievedBundle = {};
	
	// Handling for BOTH optional inputs. //////////////////////
	if(arguments[4] != undefined && arguments[4].costructor == String)
	{
		retrievedName = arguments[4];
	} else if (arguments[4] != undefined && arguments[4].constructor == Object) {
		retrievedBundle = arguments[4];
	} else if (arguments[4] != undefined) {
		inputsInvalid = true;
	}
	
	if(arguments[5] != undefined && arguments[5].constructor == String)
	{
		retrievedName = arguments[5];
	} else if (arguments[5] != undefined && arguments[5].constructor == Object) {
		retrievedBundle = arguments[5];
	} else if (arguments[5] != undefined) {
		inputsInvalid = true;
	}
	
	////////////////////////////////////////////////////////////

	if(inputsInvalid)
	{
		return displayManager.log('error',`Unable to create new process, missing/invalid input`);
	}
	
	let newProcess = {
		'id' : 0, // Process ID
		'priority' : 1, // Priority value
		'triggered': false,
		'name' : retrievedName || "UNSPECIFIED",
		'issuer': issuer, // Command that issued this process.
		'channel': sid, // The ID of server where this process was started.
		'endCondition': endCondition, // the end condition, number signifies number of runs, datesig signifies an ending date/time, and perm means the event will run permanently.
		'runCondition': runCondition, // Set to a timeframe(seconds), datesignature object, or event name to execute the event
		'task': arguments[3],
		'dataBundle': retrievedBundle // The databundle for this process, store any needed information here.
	};
	
	
	// Add an alias for easy lookup.
	if(aliasTable[newProcess.name] == undefined)
	{
		aliasTable[newProcess.runCondition] = [];
	}
	aliasTable[newProcess.runCondition].push(newProcess.id);
	
	////////////////////////////////////////////////////////////
		
	if(runCondition.prototype == String)
	{
		newProcess.triggered = false;
	}
	
	////////////////////////////////////////////////////////////
	
	if (runCondition.constructor == Number)
	{
		newProcess.timer = runCondition;
		displayManager.log('main', 'Created timer event of span ' + runCondition + 'seconds', 1);
	}
	
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
	processListing[newProcess.id] = [newProcess.id, newProcess.name, newProcess.issuer, newProcess.channel, runString, endString];
	
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

exports.remove = function(pid) {
	if(processTable[pid] != undefined || processTable[pid] != {})
	{
		processTable[pid] = undefined;
		processListing[pid] = [pid, '[TERMINATED]', '', '']
		
		availableSlots.push(pid);
	}
	
	screen.render();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// event triggerererererer...er Triggers an event/process
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.trigger = function(dataBundle, pid) {
	if(arguments[0].message.id != undefined && arguments[1].constructor != String)
	{
		displayManager.log('error', 'invalid entry.', 0);
		return;
	}
	
	let realPid = getProcessId(pid, dataBundle);
	
	if(realPid != undefined)
	{
		processTable[realPid].triggered = true;
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process metadata getter/setter.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.GetMetaData = function (pid, dataBundle, metaName)
{
	let realPid = getProcessId(pid, dataBundle);
	
	if(realPid != undefined)
	{
		return (processTable[realPid].dataBundle);
	}
};

exports.SetMetaData = function (pid, dataBundle, metaName, metaValue)
{
	let realPid = getProcessId(pid, dataBundle);
	
	if(realPid != undefined && processTable[realPid][metaName] != undefined)
	{
		processTable[realPid][metaName] = metaValue;
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main loop, checks and runs all tasks in the process list.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processManagementLoop() {
	displayManager.log('error', `Tasks: ${Object.keys(processTable).length}`, 1);
	
	for(let task = 0; task < processTable.length; task++)
	{
		let currentProcess = processTable[task];
		
		if (currentProcess != {} && currentProcess != undefined) {
			let runTask = false;
			
			////////////////////////////////////////////////////////////
			// interval trigger handler.
			// tasks are triggered via their event, if an event is sent then the trigger is automatically en
			////////////////////////////////////////////////////////////
			if(currentProcess.timer != undefined)
			{
				if(currentProcess.timer > 0) {
					currentProcess.timer -= 1;
				} else {
					currentProcess.timer = currentProcess.runCondition;
					currentProcess.triggered = true;
				}
			}
			
			////////////////////////////////////////////////////////////
			
			if (currentProcess.triggered)
			{
				try {
					currentProcess.task(currentProcess.dataBundle);
				} catch (err) {
					processErrorHandler(new Error(err).stack);
				}
				
				currentProcess.triggered = false;
			}
			
			////////////////////////////////////////////////////////////
			
			if(runTask)
			{
				try {
					curentProcess.task();
				} catch (err) {
					processErrorHandler(new Error(err).stack);
				}
			}
		}
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create a cron job for the main Proccess Management Loop (PML).
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

new task('*/1 * * * * *', () => {
	try {
		processManagementLoop();
	} catch (err) {
		processErrorHandler("PML: " + new Error(err).stack);
	}
});



