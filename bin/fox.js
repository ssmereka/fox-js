#!/usr/bin/env node

/* Fox Script
 * Handles all fox commandline commands.
 * @Author Scott Smereka
 */


//**************************************************
//******************** Load Dependencies
//**************************************************

/***
 * Optimist 
 * @description A library for command option parsing.
 * @repo https://github.com/substack/node-optimist
 * @License MIT/X11
 */
var argv = require('optimist').argv;

/***
 * Lo-Dash 
 * @description A utility library for consitency, customization, and performance.
 * @repo https://github.com/lodash/lodash
 */
var _ = require('lodash');

/***
 * Colors
 * @description Print console messages in color.
 * @repo https://github.com/Marak/colors.js
 * @License MIT
 */
var colors = require('colors');

/***
 * Path
 * @description Handles tranforming file paths.
 * @website http://nodejs.org/api/path.html
 */
var path = require('path');

/***
 * FS
 * @description 
 * @website 
 */
var fs = require('fs');


//**************************************************
//******************** Setup Fox
//**************************************************

var fox = {};

// Load the fox logger.
fox.log = tryRequire('fox_log.js');

// Load the default backend server configuration object.
fox["config"] = tryRequire('/config/default_server_config.js');

// If the object could not be loaded, then insert a empty object.
if( ! fox["config"]) {
  fox.log.warn("The default server configuration file could not be loaded.");
  fox["config"] = {}
}

// Get the absolute path to this script's directory.
fox.config["foxBinPath"] = process.cwd();

// Find the path to the backend server's directory.
fox.config["serverPath"] = getServerPathSync();


//**************************************************
//******************** Console Argument Parsing
//**************************************************

// Flag indicating if the user input has been handled.
var isArgvHandled = false;

// Help - Print fox usage.
if( ! argv._[0] || (_.contains(['help', 'h'], argv._[0]))) {
  printHelp();
  exit();
} 

// Verbose (Debug Mode) - enable or disable debug mode.
if(argv.v || argv.verbose || argv.debug) {
  fox.config["debug"] = true
}

// Environment Mode - set the current operating enviorment mode.
if(argv.l || argv.local) {
  fox.config["environment"] = "local";
} else if(argv.d || argv.dev || argv.development) {
  fox.config["environment"] = "development";
} else if(argv.p || argv.prod || argv.production) {
  fox.config["environment"] = "production";
}

// Start - Start the server
if(argv._[0] && _.contains(['start'], argv._[0])) {
  isArgvHandled = true;
  require(fox.config.serverPath).start(fox.config, function(err, success) {
    if(err) {
      fox.log.error(err.error);
    } else {
      fox.log.info(success.success);
    }
  });
} 

// Stop - Stop the server
if(argv._[0] && _.contains(['stop'], argv._[0])) {
  isArgvHandled = true;
  require(fox.config.serverPath).stop(fox.config, function(err, success) {
    if(err) {
      fox.log.error(err.error);
    } else {
      fox.log.success(success.success);
    }
  });
} 

// Restart - Restart the server
if(argv._[0] && _.contains(['restart'], argv._[0])) {
  isArgvHandled = true;
  // TODO: restart or start the server
} 

// Argument is not valid
if ( ! isArgvHandled) {
  fox.log.error("Command has invalid arguments.".error);
  exit();
}


//**************************************************
//******************** Private Methods
//**************************************************

/**
 * Print the fox script's usage.
 */
function printHelp() {
  fox.log.info("Usage:  fox <command>\n");
  fox.log.info("Commands:");
  printColumns("start", "Start the server.");
  printColumns("stop", "Stop the server.");
  printColumns("restart", "Restart the server.\n");

  printColumns("Options:")
  printColumns("-v", "Enable verbose or debug mode.");
  printColumns("-l", "Start in local environment mode.");
  printColumns("-d", "Start in development environment mode.");
  printColumns("-p", "Start in production environment mode.\n");
  exit();
}

/**
 * Print two strings in two different columns in a format much
 * like a word on the left and the definition on the right.
 */
function printColumns(left, right) {
  left = (!left) ? "" : left;
  right = (!right) ? "" : right;
  
  var n = 25 - left.length;
  fox.log.info("  " + left + Array(n+1).join(" ") + right);
}

/**
 * Finds the absolute path to the server application's
 * directory synchronously and returns that value.
 */
function getServerPathSync() {
  var currentPath = fox.config.foxBinPath,
      gpDir = path.resolve(currentPath + "/server/app"),
      pDir = path.resolve(currentPath + "/app");

  if(fs.existsSync(currentPath + "/index.js")) {
    return currentPath;
  } else if (fs.existsSync(pDir + "/index.js")) {
    return pDir;
  } else if(fs.existsSync(gpDir + "/index.js")) {
    return gpDir;
  } else {
    return undefined;
  }
}

/**
 * Attempts to require a file by name synchronously.  This
 * method will do a small, but smart search for the file 
 * and require it.  If the file is not found, then undefined 
 * is returned.
 */
function tryRequire(file) {
  var currentDirectory = "./" + file;
  var binDirectory = path.resolve(__dirname + "/" + file);

  if(fs.existsSync(currentDirectory)) {
    return require(currentDirectory);
  } else if(fs.existsSync(binDirectory)) {
    return require(binDirectory);
  } else {
    return undefined;
  }
}

/**
 * Exit the script.
 */
function exit() {
  process.exit(1);
}