// ~A Scott Smereka

/* Nodemon
 * Handles tasks involiving running the server using nodemon.
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


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,        // Flag to show debug logs.
    fox,                  // Reference to fox instance.
    log,                  // Reference to fox log instance.
    nodemon,              // Reference to nodemon module.
    trace = false;        // Flag to show trace logs.

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Nodemon = function(_fox) {
  // Load nodemon module.  According to their docs you
  // should only require nodemon once.  Not sure if they 
  // know what they are talking about since require ensures
  // you only load a module once.
  nodemon = require('nodemon');

  updateFoxReference(_fox);
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

/**
 * Update this instance's reference to the fox object.
 */
var updateFoxReference = function(_fox, next) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  if( ! _fox) {
    next(new Error("Node Controller Module: Cannot update fox with an invalid fox object."));
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
 * Default configuration for nodemon to run.
 */
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

var isInstalled = function(next) {
  npmListProcess = fox.worker.execute("npm", ["list", "nodemon", "-g"], { cwd: '.' }, false, function(err, code, npmlist, stderr) {
    next(err, (npmlist.indexOf("nodemon") !== -1));
  });
}

var install = function(next) {
  isInstalled(function(err, isInstalled) {
    if(err) {
      next(err);
    } else if(isInstalled) {
      next();
    } else {
      log.info("Installing nodemon...");
      fox.worker.execute("npm", ["install", "nodemon", "-g"], { cwd: '.' }, false, function(err, code, output, stderr) {
        log.success("Nodemon install complete.");
        next(err);
      });
    }
  });
}

/**
 * Start the server using nodemon.  This will deamonize the 
 * process and perform automatic restarts when files change.
 */
/*var start = function(config, next, onStdoutFn) {
  var nodemonConfig = defaultNodemonConfig,
      onStdOutput,
      isNextCalled = false,
      out = "";

  console.log("Starting nodemon...");

  // If next is not defined, create a method to print errors.
  // Otherwise create a method to call next after the server
  // has started successfully.
  if( ! next) {
    next = function(err) { if(err) { log.error(err["message"] || err); } };;
  } else {
    install(function(err) {
      if(err) {
        console.log("ERRORRR");
        return next(err);
      }

      console.log("Set stdoutput");
      // Create a method to listen for when the server has actually started.
      onStdOutput = function(data) {
        console.log("Stdout");
        console.log(data);
        out += data;
        if( ! isNextCalled) {
          // If the server is listening, return our results.
          if(data && data.toString().indexOf("Listening on port") != -1) {
            console.log("In1")
            if(out.length > 0) {
              console.log("in2")
              next(undefined, out.substring(0, out.length-1));
            } else {
              console.log("in3")
              next();
            }
            isNextCalled = true;
          }
        }
      };
    });
  }

  // Check if we found the server
  if(config["serverPath"] === undefined) {
    return next(new Error("Cannot find server to start."));
  }

  // Add non-default changes to the nodemon configuration object.
  nodemonConfig["script"] = config["serverPath"];
  nodemonConfig["watch"] = [ config["serverPath"], path.resolve(fox.config["serverPath"], "../configs") ];
  nodemonConfig["env"] = {  "NODE_ENV": config.environment  };

  console.log(onStdOutput);

  // If we have a method predefined for standard output, 
  // then turn off redirection of stdout.
  if(onStdOutput) {
    console.log("nodemonconfig");
    nodemonConfig["stdout"] = false;
  }

  // Start the server using nodemon.
  nodemon(nodemonConfig);

  // Use our custom stdout method.
  if(onStdOutput) {
    console.log("onStdOutput");
    nodemon.on('stdout', onStdOutput);
  } else {
    console.log("FUCKKKKK")
  }

  // Listen for nodemon events.
  //nodemon.on('start', function() { console.log("Start")});
  //nodemon.on('quit', function() {console.log("Quit")});
  //nodemon.on('restart', function(files) { console.log("Restart")});
  //nodemon.on('log', function(log) {});
} */

/**
 * Start the server using nodemon.  This will deamonize the 
 * process and perform automatic restarts when files change.
 */
var start = function(config, next, showAllLogs) {
  var nodemonConfig = defaultNodemonConfig,
      waitForStart = (showAllLogs) ? false : true,
      isNextCalled = false,
      out = "";

  // If next is not defined, create a log method.  Do not wait 
  // for the server to finish starting to return these errors.
  if( ! next) {
    next = function(err) { if(err) { log.error(err["message"] || err); } };
    waitForStart = false;
  }

  // Check if we found the server
  if(config["serverPath"] === undefined) {
    return next(new Error("Cannot find server to start."));
  }

  // Add non-default changes to the nodemon configuration object.
  nodemonConfig["script"] = config["serverPath"];
  nodemonConfig["watch"] = [ config["serverPath"], path.resolve(fox.config["serverPath"], "../configs") ];
  nodemonConfig["env"] = {  "NODE_ENV": config.environment  };

  // If we will have a method predefined for standard output, 
  // then turn off redirection of stdout.
  if(waitForStart) {
    nodemonConfig["stdout"] = false;
  }

  install(function(err) {
    if(err) {
      return next(err);
    }

    // Create a method to listen for when the server has actually started.
    var onStdOutput = function(data) {
      if(data && data.length > 0) {
        console.log(data.toString().substring(0,data.length-1));
      } else {
        console.log(data + "");
      }
      if( ! isNextCalled) {
        out += data;
        // If the server is listening, return our results.
        if(data && data.toString().indexOf("Listening on port") != -1) {
          if(out.length > 0) {
            next(undefined, out.substring(0, out.length-1));
          } else {
            next();
          }
          isNextCalled = true;
        }
      }
    };

    // Start the server using nodemon.
    nodemon(nodemonConfig);

    if(waitForStart) {
      // Use our custom stdout method.
      nodemon.on('stdout', onStdOutput);
    }

    // Listen for nodemon events.
    //nodemon.on('start', function() { console.log("Start")});
    //nodemon.on('quit', function() {console.log("Quit")});
    //nodemon.on('restart', function(files) { console.log("Restart")});
    //nodemon.on('log', function(log) { console.log(log)});
  });
}

/**
 * Restart the nodemon server.
 */
var restart = function(next) {
  nodemon.restart();
}

/**
 * Stop the nodemon server.
 */
var stop = function(next) {
  nodemon.emit("quit");
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Nodemon.prototype.isInstalled = isInstalled;
Nodemon.prototype.install = install;
Nodemon.prototype.start = start;
Nodemon.prototype.stop = stop;
Nodemon.prototype.restart = restart;
Nodemon.prototype.updateFoxReference = updateFoxReference;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Nodemon;

// Reveal the public API.
exports = Nodemon;