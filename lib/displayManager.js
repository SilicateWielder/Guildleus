const blessed = require('blessed');
const contrib = require('blessed-contrib');
const colors = require('colors');

const statList = {
	'Version': '0',
	'Mode': "normal",
	'Users': 0,
	'Channels': 0,
	'Guilds': 0
};

let currentPanel = 'main';

// Create a screen object.
global.screen = blessed.screen({
  smartCSR: true
});
screen.title = 'Guildleus Control Panel';

console.log(JSON.stringify(blessed));

// Load in external frames/windows.
let windowMain = require('./displayManager/mainWindow.js');
let windowDb = require('./displayManager/dbWindow.js');
let windowCmd = require('./displayManager/cmdWindow.js');

// Create the top control menu.
global.navbar = blessed.listbar({
    top: 0,
    right: 0,
    width: "100%",
	height: 'shrink',
    tags: true,
    keys: true,
    mouse: true,
	autoCommandKeys: true,
    items: [
        "Main",
        "Database",
        "Command History"
    ],
    style: {
		bg: "blue",
		
        selected: {
            bg: "magenta"
        },
		
		item: {
			bg: "blue"
		}
    }
});
screen.append(navbar);

let info = blessed.box({
	bottom:0,
	left: 0,
	
	width: 20,
	height: '100%-1',
	
	label: 'Status',

	border:
	{
		type: 'line'
	}
});
screen.append(info);

let mainBody = blessed.box({
	top:1,
	right: 0,
	
	width: '100%-20',
	height: '50%',
	
	label: 'Current Title',

	border:
	{
		type: 'line'
	},

});
screen.append(mainBody);

let errorBody = contrib.log({
	bottom: 0,
	right: 0,
	
	width: '100%-20',
	height: '50%-1',
	
	label: 'Error Log',

	//mouse: true,
    input: true,
    vi: true,
    scrollable: true,
	
	border:
	{
		type: 'line'
	},

    scrollbar:
    {
      bg: 'blue'
    }
});
errorBody.statCodes = [];
errorBody.statCodes[0] = "     ERROR ".bgWhite.black;
errorBody.statCodes[1] = "     DEBUG ".bgBlue.white;

screen.append(errorBody);

// Create a container for all of our useful frames.
global.frames = {};
frames.error = errorBody;
frames.main = windowMain.main;
frames.db = windowDb.main;
frames.cmd = windowCmd.main;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Used to switch the body panel between views.
function switchPane (key) {
	let keys = Object.keys(frames);
	
	if(key - 1 < keys.length && frames[keys[key]] != undefined)
	{
		mainBody.remove(currentPanel);
		
		// Get the new panel and append it to the body.
		mainBody.append(frames[keys[key]]);
		currentPanel = key;
		
		frames[keys[key]].focus();
		screen.enableMouse(frames[keys[key]]);
		
		screen.render();	
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Quit on Escape, q, or Control-C.
screen.key(['C-c'], function(ch, key) {
  return process.exit(0);
});

// Manual inputs to switch panes.
screen.key(['1', '2', '3', '4', '5', '6', '7', '8', '9'], function(ch, key) {
	switchPane(key.ch);
});

mainBody.append(frames.main);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Render the screen.
async function draw()
{
  screen.render();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Updates a metric within the status panel.
exports.updateStatus = function(status, value)
{
	let keys = Object.keys(statList);
	
	if(statList[status] != undefined)
	{
		statList[status] = value;
	}

	for(let i = 0; i < keys.length; i++)
	{
		let entryId = keys[i];
		let val = statList[entryId];

		let entry = entryId + ': ' + val;
		info.setLine(i, entry);
  }
  
  screen.render();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.log = function(type, text, code = 0)
{	
	if(frames[type] == undefined)
	{
		errorBody.log(`ERROR: '${type}' is an invalid display frame.`);
	} else {
		let prefix = colors.bgGray("UNKOWN ");
		let selectedFrame = frames[type];
		
		// If a code is defined for that frame, set the prefix to it.
		if(selectedFrame.statCodes != undefined && selectedFrame.statCodes[code] != undefined)
		{
			prefix = selectedFrame.statCodes[code];
		}
		
		frames[type].log(prefix + text);
		screen.render();
	}
	
	return text;
};

exports.updateStatus();
draw();
