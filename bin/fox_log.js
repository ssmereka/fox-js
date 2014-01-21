/* Fox Log
 * Handle the display of logs and information across 
 * one or more transports.  Such as console, files, 
 * databases, etc.
 */

/***
 * Winston 
 * @description A multi-transport async logging library for node.js.
 * @repo https://github.com/flatiron/winston
 */
var winston = require('winston');

// Define a custom log levels and colors.
var logLevels = {
	levels: {
		success: 0,
		ok: 1,
		info: 2, 
		debug: 3, 
		warn: 4, 
		error: 5
	},
	colors: {
		success: 'green',
		ok: 'green',
		info: 'cyan', 
		debug: 'magenta', 
		warn: 'yellow', 
		error: 'red'
	}
};

// Create a customer logger and hook it up to the console transport.
var logger = new(winston.Logger)({
	level: 'info',
	levels: logLevels.levels,
	colors: logLevels.colors,
	transports: [ new winston.transports.Console({ 
		colorize: true,
		level: 'info',
		json: false,
		silent: false,
		timestamp: false
	}) ]
});


module.exports = logger;