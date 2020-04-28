1234// Quick and dirty cron wrapper, so I can use switch statements. :D

const cron = require('node-cron');

class task_object_type {
	constructor() {
		this.main = cron.schedule(arguments[0], arguments[1]);
	}
	
	start() {
		this.main.start();
	}
	
	stop() {
		this.main.stop();
	}
	
	destroy() {
		this.main.destroy();
	}
}

exports.main = task_object_type;