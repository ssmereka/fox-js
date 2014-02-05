// ~>Library
// ~A Scott Smereka

/* Fox
 * Framework for simplifying node server development
 * and taking a server into production.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
var Authorization = require("./Authentication/authorization.js"), //
	Config  	  = require("./Config/config.js"),           		      // Configuration for fox servers.
    Cryptography  = require("./Authentication/cryptography.js"),  //
    DateLibrary	  = require("./Utility/date.js"),     			  // Handle dates in javascript.
    Load    	  = require("./Server/load.js"),	  			  // Loading, configuring, and staring a server.
    Log     	  = require("./Utility/log.js"),      			  // Handles logging.
    Message 	  = require("./Server/message.js"),   			  // 
    Model   	  = require("./Server/model.js"),     			  // 
    Send    	  = require("./Server/send.js"),				  //
    fox; 													      // Stores instance of the fox library.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new cryptography library object.
 */
function Fox() {
	this.config = Config;

	this.log 			= new Log(this);
	this.authentication = new Authorization(this);
	this.crypto 	    = new Cryptography(this);
	this.date 			= new DateLibrary(this);
	this.message 		= new Message(this);
	this.model 			= new Model(this);
	this.send 			= new Send(this);
	this.load 			= new Load(this);

	this.start 			= this.load.start;
	this.stop 			= this.load.stop;

	//this.handleMessages = messaging.handle;
	fox = this;
};

var getInstance = function() {
	if(fox === undefined) {
		//console.log("Returning new instance of fox.");
		return new Fox();
	} else {
		//console.log("Returning current instance of fox.");
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