const contrib = require('blessed-contrib');

exports.main = contrib.log({
	left: 0,
	top: 0,
	parent: exports.mainWindow,
	
	width: '100%-2',
	height: '100%-2',

	mouse: true,
    input: true,
    vi: true,
    scrollable: true,
	
	style: {
		fg: 'white',
		bg: 'black'
	},

    scrollbar:
    {
      bg: 'blue'
    }
});

exports.main.log("Start of Log.");