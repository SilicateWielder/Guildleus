const blessed = require('blessed');
const contrib = require('blessed-contrib');

const statTypes = ['Version', 'Mode', 'Users', 'Channels', 'Guilds'];
const statList = {'Version': '0', 'Mode': "normal", 'Users': 0, 'Channels': 0 , 'Guilds': 0};

// Create a screen object.
let screen = blessed.screen({
  smartCSR: true
});


screen.title = 'GuildMeister+ Control Panel';

// Create the control panel's main window.

let leftBody = blessed.box(
  {
    top: 0,
    left: 0,
    width: '20%',
    height: '100%-3',
    content: 'Hello {bold}world{/bold}!',
    tags: true,

    border: {
      type: 'line'
    },
  }
)

let info = blessed.box(
  {
    parent: leftBody,
    top:0,
    left: 0,
    height: '50%-1',
    label: 'Status',

    border:
    {
      type: 'line'
    }
  }
);

let commandsList = blessed.box(
  {
    parent: leftBody,
    bottom:0,
    left: 0,
    height: '50%-1',
    label: 'Commands',

    border:
    {
      type: 'line'
    }
  }
);

let rightBody = blessed.box(
  {
    top: 0,
    right: 0,
    width: '80%',
    height: '100%-3',
    content: 'Hello {bold}world{/bold}!',
    tags: true,

    border: {
      type: 'line'
    },
  }
);

global.SQLog = contrib.log(
  {
    parent: rightBody,
    top:0,
    left: 0,
    height: '50%-1',
    label: 'Database Events',
    mouse: true,
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
  }
)

global.ErrLog = contrib.log(
  {
    parent: rightBody,
    bottom: 0,
    left: 0,
    height: '50%-1',
    label: 'Errors',
    mouse: true,
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
  }
)

let footer = blessed.box(
  {
    bottom: 0,
    left: 0,
    width: '100%',
    height: '0%+3',
    content: 'Stuff.',
    tags: true,

    border:
    {
      type: 'line'
    }
  }
)

global.updateStatus = function(status, value)
{
  if(statList[status] != undefined)
  {
    let index = statList[status];

    statList[status] = value;
  }

  for(i = 0; i < statTypes.length; i++)
  {
    let entryId = statTypes[i];
    let val = statList[entryId];

    let entry = entryId + ': ' + val;
    info.setLine(i, entry);
  }
}

// Append our box to the screen.
screen.append(leftBody);
screen.append(rightBody);
screen.append(footer);

// If our box is clicked, change the content.
info.on('click', function(data) {
  info.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
info.focus();

// Render the screen.
async function draw()
{
  screen.render();
}

global.updateStatus();
draw();
