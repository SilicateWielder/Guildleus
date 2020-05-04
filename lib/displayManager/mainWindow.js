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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define the status codes for this logging window.
exports.main.statCodes = [];
exports.main.statCodes[0] = [false, "      INFO ".bgWhite.black + ''];
exports.main.statCodes[1] = [false, "   WARNING ".bgYellow.black + ''];
exports.main.statCodes[2] = [false, "     ERROR ".bgRed.underline + ''];
exports.main.statCodes[3] = [false, " PROCESS 1 ".bgWhite.black + ''];
exports.main.statCodes[4] = [false, " PROCESS 2 ".bgWhite.black + '    '];
exports.main.statCodes[5] = [false, " PROCESS 3 ".bgWhite.black + '        '];
exports.main.statCodes[6] = [false, " PROCESS 4 ".bgWhite.black + '            ']; // Placeholder.
exports.main.statCodes[7] = [false, " PROCESS 5 ".bgWhite.black + '                ']; // Placeholder.
exports.main.statCodes[8] = [false, " PROCESS 6 ".bgWhite.black + '                    ']; // Placeholder.
exports.main.statCodes[9] = [false, "    SERVER ".bgWhite.black + '']; // Contemplating.
exports.main.statCodes[10] = [false, "     USER ".bgWhite.black + '']; // Contemplating.

exports.main.log("Start of Log.");