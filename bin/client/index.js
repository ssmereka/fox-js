// ~A Scott Smereka

/* Client
 * Create and manage client instances using this 
 * modules methods and the fox configuration object.
 */


/* ************************************************** *
 * ******************** Node.js Core Modules
 * ************************************************** */

/***
 * Path
 * @stability 3 - Stable
 * @description Handles tranforming file paths.
 * @website http://nodejs.org/api/path.html
 */
var path = require('path');

/***
 * FS
 * @stability 3 - Stable
 * @description access the file system
 * @website http://nodejs.org/api/fs.html
 */
var fs = require('fs');


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

// Local variables
var config,               // Reference to fox server config.
    debug = false,        // Flag to show debug logs.
    fox,                  // Reference to current fox instance.
    log,                  // Reference to fox log object.
    trace = false;        // Flag to show trace logs.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor to create the server object and load 
 * any other local modules that are required to manage
 * the server instance(s).
 */
var Client = function(_fox) {
  updateFoxReference(_fox);
}

/**
 * Setup the module based on the config object.
 */
var handleConfig = function(_config) {
  if(_config) {
    config = _config;
    if(config["system"]) {
      debug = (config.system["debug"]) ? config.system["debug"] : debug;
      trace = (config.system["trace"]) ? config.system["trace"] : trace;
    }
  }
}

/**
 * Update this instances reference to the fox object.  Also update
 * any other modules initalized by this module.
 */
var updateFoxReference = function(_fox, next) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  if( ! _fox) {
    next(new Error("Client Module: Cannot update fox with an invalid fox object."));
  }

  fox = _fox;
  log = fox.log;

  handleConfig(fox["config"]);
  
  next();
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Bower configuration object to be placed in a .bowerrc
 * file before running bower commands via CLI.
 */
var bowerConfig = {
  "directory": "libs"
};

/**
 * Install the client portion of the server including 
 * its dependencies. 
 */
var install = function(_config, next) {
  // TODO: Install bower using module API, aka require("bower").commands.install();

  fs.writeFileSync(path.normalize(_config.clientPath + "/.bowerrc"), JSON.stringify(bowerConfig), {});
  fox.worker.execute("bower", ["install"], { cwd: _config.clientPath }, false, function(err, code, stdout, stderr) {
    return next();
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Client.prototype.install = install;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Client;

// Reveal the public API.
exports = Client;