// ~>Library
// ~A Scott Smereka

/* Fox
 * Framework for simplifying node server development
 * and taking a server into production.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
var config = require("./config.js"),       // Configuration for fox servers.
    date,         // Handle dates in javascript.
    //debug,        // Display additional logs when enabled.
    fox,		  // Stores instance of the fox library.
    loading,	  // Loading, configuring, and staring a server.
    log = require("./Utility/log.js"),          // Handles logging.
    messaging,    // 
    model,        // 
    send;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new cryptography library object.
 */
function Fox() {
	console.log("Fox Constructor called.");

	//config = require("./config.js");
	date = require("./date.js");
	loading = require("./loading.js");
	//log = require("./log.js");
	messaging = require("./messaging.js");
	model = require("./model.js");
	send = require("./send.js");

	// Public API
	this.crypto = new cryptographyFile(config);
	this.authentication = new authorizationFile(config);
	this.log = new log(config);
	this.start = loading.start;
	this.stop = loading.stop;
	this.handleMessages = messaging.handle;
	this.logging = this.log;
	this.model = model;
	this.send = send;
	this.date = date;

	fox = this;
};

var getInstance = function() {
	if(fox === undefined) {
		console.log("Returning new instance of fox.");
		return new Fox();
	} else {
		console.log("Returning current instance of fox.");
		return fox;
	}
}


/**
 * Module dependencies.
 */
//var authentication = require("./Authentication"),
/*var	config = require("./config.js"),
	date = require("./date.js"),
	//hash = require("./hash.js"),
	loading = require("./loading.js"),
	log = require("./log.js"),
	messaging = require("./messaging.js"),
	model = require("./model.js"),
	send = require("./send.js"); */

var cryptographyLibrary,
	authorizationLibrary,
	cryptographyFile = require("./Authentication/cryptography.js"),
	authorizationFile = require("./Authentication/authorization.js");



var getInstance = function() {
	if(fox === undefined) {
		console.log("Returning new instance of fox.");
		return new Fox();
	} else {
		console.log("Returning current instance of fox.");
		return fox;
	}
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */



/*function(config, next) {
	return loading.start(config, next);
}; 

Fox.prototype.stop = function(config, next) {
	return loading.stop(config, next);
};

Fox.prototype.handleMessages = function(server, next) {
	return messaging.handle(server, next);
}; */

//Fox.prototype.crypto = {};
//Fox.prototype.authentication = {};

//Fox.prototype.authentication = authorizationLibrary;//new require("./Authentication/authorization.js")();  //authentication.roleBasedAuthorization;

//Fox.prototype.crypto = cryptographyLibrary;//new require("./Authentication/cryptography.js")(); //authentication.cryptography;
//Fox.prototype.logging = log;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Export singleton of Fox to anyone who "requires" it.
exports = module.exports = getInstance();

// Reveal the public API.
exports.Fox = Fox;