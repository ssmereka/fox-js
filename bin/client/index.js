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
var install = function(_config, next, silent) {
  // TODO: Install bower using module API, aka require("bower").commands.install();

  // Check if the libs are alreayd installed.
  if(fs.existsSync(path.normalize(_config["clientFolderPath"] + "/libs"))) {
    return next();
  }

  if( ! silent) {
    fox.log.info("Installing Client Dependencies...");
  }

  // Check if bower is installed.
  installBower(function(err) {
    if(err) {
      return next(err);
    }

    // Create the bower config, if it doesn't exist.
    var bowerConfigPath = path.normalize(_config.clientFolderPath + "/.bowerrc");
    if( ! fs.existsSync(bowerConfigPath)) {
      fs.writeFileSync(path.normalize(_config.clientFolderPath + "/.bowerrc"), JSON.stringify(bowerConfig), {});
    }

    // Install the libs using bower.
    fox.worker.execute("bower", ["install"], { cwd: _config.clientFolderPath }, false, function(err, code, stdout, stderr) {
      return next();
    });
  })
}

var isBowerInstalledAsync = function(next) {
  npmListProcess = fox.worker.execute("npm", ["list", "bower", "-g"], { cwd: '.' }, false, function(err, code, npmlist, stderr) {
    next(err, (npmlist.indexOf("bower") !== -1));
  });
}

/**
 * Install bower globally if it has not been already.
 */
var installBower = function(next) {
  isBowerInstalledAsync(function(err, isInstalled) {
    if(err) {
      next(err);
    } else if(isInstalled) {
      next();
    } else {
      log.info("Installing bower...");
      fox.worker.execute("npm", ["install", "bower", "-g"], { cwd: '.' }, false, function(err, code, output, stderr) {
        log.success("Bower install complete.");
        next(err);
      });
    }
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