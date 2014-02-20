// ~> Library
// ~A Scott Smereka

/* Authentication
 * Library for authorizing requests and performing 
 * tasks related to security.
 */

/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var Cryptography = require("./cryptography.js");
var Authorization = require("./authorization.js");
var AccessToken = require("./accessToken.js");

var config,
	  debug = false,
	  fox;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Authentication = function (_fox) {
  // Check for a fox module.
  if( ! _fox) {
  	return console.log("Authentication Module:  Failed to load, missing fox module parameter.");
  }

  // Check fox module dependencies. 
  if(! _fox["log"] || ! _fox["send"]) {
  	return console.log("Authentication Module:  Failed to load, missing log and sender modules.");
  }

  // Setup the authentication module.
  fox = _fox;
  handleConfigObject(fox.config);

  // Load sub modules in the correct order.
  this.accessToken = new AccessToken(fox);
  this.authorization = new Authorization(fox, this);
  this.cryptography = new Cryptography(fox, this);
}

/**
 * Configure the authentication module from the 
 * fox configuration object, if available.
 */
function handleConfigObject(config) {
	if( ! config) {
		return;
	}
	debug = (config["systemDebug"]) ? config["systemDebug"] : debug;
}


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

exports = module.exports = Authentication;
exports = Authentication;