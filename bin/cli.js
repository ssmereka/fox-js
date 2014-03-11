// ~> Bin
// ~A Scott Smereka

/* Command Line Interface
 * Interact with fox using the command line.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var argv,
    config,
    debug = false,
    fox,
    log,
    trace = false,
    _;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Handles initalization of the message library.
 */
var Cli = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  // Load external modules.
  argv = require('optimist').argv;
  _ = require('lodash');

  // Configure message instance.
  handleConfig(fox["config"]);
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

//
var updateFoxInstance = function(_fox) {
  if(fox) {
    fox = _fox
  }
}



/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Print the fox script's usage.
 */
var printHelp = function() {
  log.info("Usage:  fox <command> <options>\n");
  log.info("Commands:");
  printColumns("new <name>", "Create a new server with a specified name.");
  printColumns("start", "Start the server.");
  printColumns("stop", "Stop the server.");
  printColumns("restart", "Restart the server.");
  printColumns("reload", "Restart the server with zero downtime.");
  printColumns("clear", "Stop the server and clear all logs and history.");
  printColumns("logs", "Show server logs\n");

  log.info("Options:")
  printColumns("-d", "Start in development environment mode.");
  printColumns("-i", "Initalize the server's database.");
  printColumns("-l", "Start in local environment mode.");
  printColumns("-n", "Start server using plain old node.js and local mode.");
  printColumns("-p", "Start in production environment mode.");
  printColumns("-v", "Enable verbose or debug mode.\n");

  log.info("Info:")
  printColumns("Author", getFoxAuthor());
  printColumns("Version", getFoxVersion());
}

/**
 * Print two strings in two different columns in a format much
 * like a word on the left and the definition on the right.
 */
function printColumns(left, right) {
  left = (!left) ? "" : left;
  right = (!right) ? "" : right;
  
  var n = 25 - left.length;
  log.info("  " + left + Array(n+1).join(" ") + right);
}

/**
 * Get this module's version from the package.json.
 */
var getFoxVersion = function() {
  return (fox.package["version"]) ? fox.package["version"] : "x.x.x";
}

/**
 * Get this module's author from the package.json.
 */
var getFoxAuthor = function() {
  return (fox.package["author"]) ? fox.package["author"] : "Scott Smereka";
}

/**
 * Set the default configuration object based on the 
 * user's CLI input.  Return that updated config object
 * in a callback method.
 */
var handleConfigCli = function(_config, next) {
  if( ! _config) {
    var err = new Error("Configuration object is not defined.");
  }

  next = (next) ? next : function(err) { if(err) { log.error(err); }};

  if(isCreateCommand()) {
    _config.setDefaultConfig(_config.consts.local, next);
    return;
  }

  // Environment Mode - set the current operating enviorment mode.
  if(argv.n || argv.node) {
    _config.setDefaultConfig(_config.consts.node, next);
  } else if(argv.l || argv.local) {
    _config.setDefaultConfig(_config.consts.local, next);
  } else if(argv.d || argv.dev || argv.development) {
    _config.setDefaultConfig(_config.consts.development, next);
  } else if(argv.p || argv.prod || argv.production) {
    _config.setDefaultConfig(_config.consts.production, next);
  } else {
    _config.setDefaultConfig(undefined, next);
  }
}


var handleCli = function(argv, _config, next) {
  var isCommandHandled = false;

  // Ensure a next callback parameter exists.
  next = (next) ? next : function(err) {
    if(err) {
      log.error(err);
    }
  };

  // Ensure a config parameter exists.
  _config = ( ! _config) ? fox["config"] : _config;

  // Enable Debug Mode
  if(isDebugFlagSet(argv)) {
    _config["debug"] = true;
  }

  // If no arguments, print help menu.
  if( ! argv._[0] ) {
    printHelp();
    return next();
  } 

  // Print help message.
  if(isPrintHelpFlagSet()) {
    printHelp();
    return next();
  }

  // Stop the server.
  if(isStopServerCommand()) {
    return fox.server.stop(_config, next);
  }

  // Restart the server.
  if(isRestartServerCommand()) {
    return fox.server.restart(_config, next);
  }

  // Create a new server.
  if(isCreateCommand()) {

    return fox.server.create(argv._[1], _config, next);
  }

  // Display stream of current server logs.
  if(isShowLogsCommand()) {
    return fox.server.logs(_config, next);
  }

  // Start the server.
  if(isStartServerCommand()) {
    if(isInitalizeFlagSet()) {
      fox.server.install(_config, function(err) {
        if(next) {
          next(err);
        }
      });
    } else {
      fox.server.start(_config);
      if(next) {
        return next();
      }
    }
  } else {
    // If we reached here, the command was not handled.
    log.error("Command contains invalid arguments.");
  }



/*
  if(isStartServerCommand()) {
    if(isInitalizeFlagSet(_config)) {
      fox.server.start(_config, function(err) {
        fox.server.install(_config, function(err) {
          if(next) {
            return next(err);
          }
        });
      });
    } else {
      fox.server.start(_config);
      if(next) {
        return next();
      }
    }
  } else {
    // If we reached here, the command was not handled.
    log.error("Command contains invalid arguments.");
  } */
}

/**
 * Returns true if the debug flag is set on the cli.
 */
var isDebugFlagSet = function() {
  return (argv.v || argv.verbose || argv.debug);
}

/**
 * Returns true if the help flag is set on the cli.
 */
var isPrintHelpFlagSet = function() {
  return ( (argv.h || argv.help) || (argv._[0] && (_.contains(['help', 'h'], argv._[0]))) );
}

/**
 * Returns true if the initalizae flag is set on the cli.
 */
var isInitalizeFlagSet = function() {
  return (argv.i !== undefined) ? argv.i : false;
}

/**
 * Returns true if the start server command is sent via the cli.
 */
var isStartServerCommand = function() {
  return (argv._[0] && _.contains(['start'], argv._[0]));
}

/**
 * Returns true if the stop server command is sent via the cli.
 */
var isStopServerCommand = function() {
  return (argv._[0] && _.contains(['stop'], argv._[0]));
}

/**
 * Returns true if the restart server command is sent via the cli.
 */
var isRestartServerCommand = function() {
  return (argv._[0] && _.contains(['restart'], argv._[0]));
}

/**
 * Returns true if the create server command is sent via the cli.
 */
var isCreateCommand = function() {
  return (argv._[0] && _.contains(['new'], argv._[0]));
}

/**
 * Returns true if the show logs command is sent via the cli.
 */
var isShowLogsCommand = function() {
  return (argv._[0] && _.contains(['log', 'logs'], argv._[0]));
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Cli.prototype.printHelp = printHelp;
Cli.prototype.handleCli = handleCli;
Cli.prototype.updateFoxInstance = updateFoxInstance;
Cli.prototype.handleConfigCli = handleConfigCli;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Cli;

// Reveal the public API.
exports = Cli;