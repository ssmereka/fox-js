// ~A Scott Smereka

/* Template
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
var Template = function(_fox) {
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
 */
var add = function(_config, repo, next) {
  fox.worker.execute("git", ["clone", repo], { cwd: _config.foxTemplatePath }, true, function(err, code, stdout, stderr) {
    return next();
  });
}

/**
 */
var remove = function(_config, folderName, next) {
  var template = path.normalize(_config.foxTemplatePath + folderName);
  if(fs.existsSync(template)) {
    fs.rmdir(path.normalize(_config.foxTemplatePath + folderName), next);
  }
}

var list = function(_config, next) {
  return [
    {
      name: "mean",
      description: "A template based on the MEAN (Mongo DB, Express, Angular.js, and Node.js) stack.",
      repo: "",
      installed: true
    }
  ];
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Template.prototype.add = add;
Template.prototype.remove = remove;
Template.prototype.list = remove;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Template;

// Reveal the public API.
exports = Template;