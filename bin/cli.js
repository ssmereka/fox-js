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
  // Load external modules.
  argv = require('optimist').argv;
  _ = require('lodash');

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

var printTemplateList = function(templates, next) {
  var repoLength = 0;
  for(var key in templates) {
    if(templates.hasOwnProperty(key)) {
      if(templates[key]["git"].length > repoLength) {
        repoLength = templates[key]["git"].length
      }
    }
  }

  printHeader("Template Name", "Installed", "Repo", repoLength);

  for(var key in templates) {
    if(templates.hasOwnProperty(key)) {
      printRow(templates[key].name, templates[key]["installed"].toString(), templates[key]["git"], repoLength);
    }
  }

  printFooter(repoLength)
  next();
}

/**
 * Print the fox script's usage.
 */
var printHelp = function() {
  log.info("Usage:  fox <command> <options>\n");
  log.info("Server Commands:");
  printColumns("clear", "Stop the server and clear all logs and history.");
  printColumns("logs", "Show server logs");
  printColumns("new <name>", "Create a new server with a specified name.");
  printColumns("start", "Start the server.");
  printColumns("stop", "Stop the server.");
  printColumns("restart", "Restart the server.");
  printColumns("reload", "Restart the server with zero downtime.\n");

  log.info("Options:")
  printColumns("-d", "Start in development environment mode.");
  printColumns("-i", "Initalize the server's database.");
  printColumns("-l", "Start in local environment mode.");
  printColumns("-n", "Start server using plain old node.js and local mode.");
  printColumns("-p", "Start in production environment mode.");
  printColumns("-v", "Enable verbose or debug mode.\n");

  log.info("fox template <command> <options>");
  printColumns("add <template>", "Add a new template by name or git repo.");
  printColumns("list", "List all templates");
  printColumns("remove <template>", "Remove a template by name or git repo.\n");

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
 * Print a 3 column table header.
 */
function printHeader(left, center, right, rightLength) {
  left = (!left) ? "" : left;
  center = (!center) ? "" : center;
  right = (!right) ? "" : right;

  log.info(Array(56 + rightLength).join("-"));
  log.info( "| " + left   + Array(24 - left.length).join(" ")   + 
            "| " + center + Array(24 - center.length).join(" ") +
            "| " + right  + Array(rightLength+2 - right.length).join(" ") + " |");
  log.info(Array(56 + rightLength).join("-"));
}

/**
 * Print a 3 column table row.
 */
function printRow(left, center, right, rightLength) {
  left = (!left) ? "" : left;
  center = (!center) ? "" : center;
  right = (!right) ? "" : right;

  log.info( "| " + left   + Array(24 - left.length).join(" ")   +
            "| " + center + Array(24 - center.length).join(" ") +
            "| " + right  + Array(rightLength+2 - right.length).join(" ") + " |");
}

/**
 * Print a 3 column table footer.
 */
function printFooter(length) {
  log.info(Array(56 + length).join("-"));
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
  if(fox.package["author"]) {
    if(fox.package["author"].name) {
      return fox.package["author"].name.toString();
    }

    return fox.package["author"].toString();
  }

  return "Scott Smereka"
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

  // For a create command, default to the local config.
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


/**
 * Handle and act on any command line input.
 */
var handleCli = function(_config, next) {
  var isCommandHandled = false;

  // Ensure a next callback parameter exists.
  next = (next) ? next : function(err) {
    if(err) {
      log.error(err);
    }
  };

  // Ensure a config parameter exists.
  _config = (_config === undefined) ? fox["config"] : _config;

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

  // Handle template commands.
  if(isTemplateCommand()) {

    // List templates
    if(isListTemplateCommand()) {
      return printTemplateList(fox.template.list(), next);
    }

    // Add a new template by name or repo.
    if(isAddTemplateCommand()) {
      return fox.template.add(_config, argv._[2], function(err) {
        if(err) {
          return next(err);
        }
        
        return printTemplateList(fox.template.list(), next);
      });
    }

    // Remove a template by name or repo.
    if(isRemoveTemplateCommand()) {
      return fox.template.remove(_config, argv._[2], function(err) {
        if(err) {
          return next(err);
        }
        
        return printTemplateList(fox.template.list(), next);
      });
    }
  }

  if(isKillCommand()) {
    return fox.worker.kill(_config, argv._[1], next);
  }

  // Stop the server.
  if(isStopServerCommand()) {
    return fox.server.stop(_config, next);
  }

  // Restart the server.
  if(isRestartServerCommand()) {
    return fox.server.restart(_config, next);
  }

  // Reload the server.
  if(isReloadServerCommand()) {
    return fox.server.reload(_config, next);
  }

  // Clear any server data, such as logs.
  if(isClearServerCommand()) {
    return fox.server.clear(_config, next);
  }

  // Create a new server.
  if(isCreateCommand()) {

    // Optional:  Set the template to install.
    if(argv._[2] !== undefined) {
      _config = _config.setTemplate(_config, argv._[2]); 
    }
    return fox.server.create(argv._[1], _config, next);
  }

  // Display stream of current server logs.
  if(isShowLogsCommand()) {
    return fox.server.logs(_config, next);
  }

  // Start the server.
  if(isStartServerCommand()) {
    if(isInitalizeFlagSet()) {
      fox.server.installServerPm2(_config, function(err) {
      //fox.server.install(_config, function(err) {
        if(next) {
          next(err);
        }
      });
    } else {
      fox.server.start(_config, next);
    }
  } else {
    // If we reached here, the command was not handled.
    log.error("Command contains invalid arguments.");
  }
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
 * Returns true if the reload server command is sent via the cli.
 */
var isReloadServerCommand = function() {
  return (argv._[0] && _.contains(['reload'], argv._[0]));
}

/**
 * Returns true if the create server command is sent via the cli.
 */
var isCreateCommand = function() {
  return (argv._[0] && _.contains(['new'], argv._[0]));
}

/**
 * Returns true if the clear server command is sent via the cli.
 */
var isClearServerCommand = function() {
  return (argv._[0] && _.contains(['clear'], argv._[0]));
}

/**
 * Returns true if the show logs command is sent via the cli.
 */
var isShowLogsCommand = function() {
  return (argv._[0] && _.contains(['log', 'logs'], argv._[0]));
}

var isKillCommand = function() {
  return (argv._[0] && _.contains(['kill'], argv._[0]));;
}

var isTemplateCommand = function() {
  return (argv._[0] && _.contains(['template'], argv._[0]));;
}

var isAddTemplateCommand = function() {
  return (argv._[1] && _.contains(['add'], argv._[1]));;
}

var isRemoveTemplateCommand = function() {
  return (argv._[1] && _.contains(['remove'], argv._[1]));;
}

var isListTemplateCommand = function() {
  return (argv._[1] === undefined || (argv._[1] && _.contains(['list'], argv._[1])));
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Cli.prototype.printHelp = printHelp;
Cli.prototype.handleCli = handleCli;
Cli.prototype.updateFoxReference = updateFoxReference;
Cli.prototype.handleConfigCli = handleConfigCli;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Cli;

// Reveal the public API.
exports = Cli;