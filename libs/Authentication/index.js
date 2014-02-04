/**
 * Global variables for the module.
 */
//config,               // Configuration object for the server.
var    debug = true,                // Boolean flag for debugging the Authentication module.
    db,                   // Connected database object for the server.
    isInitalized = false, // Boolean flag for whether or not this module has been iniatlized.
    log,                  // Log module.
    sanitize,             // Sanitize objects and variables.
    sender;               // Handle sending messages to the user(s).

//var authorization = require("./authorization.js");
//var cryptography = require("./cryptography.js");

//console.log(authorization);
/*var AuthenticationLibrary = {
  roleBasedAuthorization: authorization,
  cryptography: cryptography
};*/

var config = {};
var authorization = require("./authorization.js");
var cryptography = require("./cryptography.js");



//var Authentication = exports;

var Authentication = function () {
  
}

//Authentication.prototype.hash = hash;

//Authentication.roleBasedAuthorization = new authorization(config); //new require("./authorization.js")(config);
//Authentication.cryptography = new cryptography(config);

module.exports = Authentication;


