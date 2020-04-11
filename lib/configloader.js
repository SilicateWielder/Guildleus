const reader = require('properties-reader');
const fs = require('fs');

// Loads a single configuration file.
exports.loadSingle = function(path) {
	let exists = false;
	
	if(fs.existsSync(path)) {
		exists = true;
	}
	
	let props = reader(path).getAllProperties();

	return (props);
}

// Loads a complete configuration
exports.loadAll = function(defaultConfigs)
{
	let completeConfig = {};
	for(let currentPath in defaultConfigs)
	{
		
		// Generate a blank configuration file if none exists.
		if(!fs.existsSync(currentPath))
		{
			fs.writeFile(currentPath, defaultConfigs[currentPath], (err) => {
				if(err) {
					throw err;
				}
			});
		}
		
		// Get new set of settings and merge it with the main configuration array.
		let newConfig = exports.loadSingle(currentPath);
		completeConfig = Object.assign({}, completeConfig, newConfig);
	}
	
	// Convert all true/false lines to booleans
	for(let val in completeConfig)
	{
		if(completeConfig[val] == 'true')
		{
			completeConfig[val] = true;
		}
		
		if(completeConfig[val] == 'false')
		{
			completeConfig[val] = false;
		}
	}
	
	// Check if the config was filled.
	if(completeConfig['complete'] != true)
	{
		console.log("ERROR: Please fill out the generated .properties files and change the value for 'filled' to true");
	}
	
	return (completeConfig);
}