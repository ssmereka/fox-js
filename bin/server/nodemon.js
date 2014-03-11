// ~> Bin
// ~A Scott Smereka

/* Nodemon
 * Handles tasks involiving running the server using nodemon.
 */


/* ************************************************** *
 * ******************** Node Libraries
 * ************************************************** */

/***
 * Path
 * @description Handles tranforming file paths.
 * @website http://nodejs.org/api/path.html
 */
var path = require('path');


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,
    fox,
    log,
    nodemon,
    trace = false;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Nodemon = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  // Load nodemon module.  According to their docs you
  // should only require nodemon once.
  nodemon = require('nodemon');

  // Configure message instance.
  handleConfig(fox["config"]);
}

/**
 * Setup the module based on the config object.
 */
var handleConfig = function(config) {
  if(config) {
    if(config["system"]) {
      debug = (config.system["debug"]) ? config.system["debug"] : debug;
      trace = (config.system["trace"]) ? config.system["trace"] : trace;
    }
  }
}

/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

var defaultNodemonConfig = {
    // Restart command.
    "restartable":"rs",

    // Ignore these files when watching for changes.
    "ignore": [
      ".git",
      "node_modules/**/node_modules"
    ],

    // Turn off verbose log messages.
    "verbose": false,

    // Not sure.. but default settings.
    "ext": "js json",

    // Hook up the standard input to the processes' stdin.
    stdin: true,
    // Hook up the standard output to the processes' stdout.
    stdout: true
}

/**
 * Start the server using nodemon.  This will deamonize the 
 * process and perform automatic restarts when files change.
 */
var start = function(config, next, onStdoutFn) {
  var onStdOutput,
      isNextCalled = false,
      out = "";

  // If next is not defined, create a method to print errors.
  // Otherwise create a method to call next after the server
  // has started successfully.
  if( ! next) {
    next = function(err) { if(err) { log.error(err); } };;
  } else {
    onStdOutput = function(data) {
      out += data;
      if( ! isNextCalled) {
        if(data && data.toString().indexOf("Listening on port") != -1) {
          if(out.length > 0) {
            next(undefined, out.substring(0, out.length-1));
          } else {
            next();
          }
          isNextCalled = true;
        }
      }
      //str = data.toString();
      //str = (str) ? str.substring(0, str.length-1) : "";
    };
  }

  var nodemonConfig = defaultNodemonConfig;

  nodemonConfig["script"] = config["serverPath"];
  nodemonConfig["watch"] = [ config["serverPath"], path.resolve(fox.config["serverPath"], "../configs") ];
  nodemonConfig["env"] = {  "NODE_ENV": config.environment  };

  if(onStdOutput) {
    nodemonConfig["stdout"] = false;
  }

  // Start the server using nodemon.
  nodemon(nodemonConfig);

  // Setup 
  if(onStdOutput) {
    nodemon.on('stdout', onStdOutput);
  }

  // Listen for events.
  //nodemon.on('start', function() { console.log("Start")});
  //nodemon.on('quit', function() {console.log("Quit")});
  //nodemon.on('restart', function(files) { console.log("Restart")});
  //nodemon.on('log', function(log) {});
}


var restart = function(next) {
  nodemon.restart();
}

var stop = function(next) {
  //nodemon.stop();
  nodemon.emit("quit");
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Nodemon.prototype.start = start;
Nodemon.prototype.stop = stop;
Nodemon.prototype.restart = restart;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Nodemon;

// Reveal the public API.
exports = Nodemon;