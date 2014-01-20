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
//******************** Configurations
//**************************************************




//**************************************************
//******************** Setup
//**************************************************

var config = getDefaultConfigSync();

config["currentPath"] = process.cwd();
config["currentPath"] = process.cwd();
config["serverPath"] = getServerPathSync();

setLoggingTheme();

//**************************************************
//******************** Argument Parsing
//**************************************************
var isArgvHandled = false;

// Help - Print fox usage.
if( ! argv._[0] || (_.contains(['help', 'h'], argv._[0]))) {
  printHelp();
  exit();
} 

// Verbose Debug Mode - enable or disable debug mode.
if(argv.v || argv.verbose || argv.debug) {
  config["debug"] = true
}

// Environment Mode - set the current operating enviorment mode.
if(argv.l || argv.local) {
  config["environment"] = "local";
} else if(argv.d || argv.dev || argv.development) {
  config["environment"] = "development";
} else if(argv.p || argv.prod || argv.production) {
  config["environment"] = "production";
}

// Start - Start the server
if(argv._[0] && _.contains(['start'], argv._[0])) {
  isArgvHandled = true;
  require(config.serverPath).start(config, function(err, success) {
    if(err) {
      console.log(err.error);
    } else {
      console.log(success.success);
    }
  });
} 

// Stop - Stop the server
if(argv._[0] && _.contains(['stop'], argv._[0])) {
  isArgvHandled = true;
  require(config.serverPath).stop(config, function(err, success) {
    if(err) {
      console.log(err.error);
    } else {
      console.log(success.success);
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
  console.log("Command has invalid arguments.".error);
  exit();
}



//**************************************************
//******************** Private Methods
//**************************************************

/**
 * 
 */
function printHelp() {
  console.log("Usage:  fox <command>\n".info);
  printColumns("Commands:".info);
  printColumns("start".info, "Start the server.".info );
  printColumns("stop".info, "Stop the server.".info );
  printColumns("restart".info, "Restart the server.".info );
  printColumns("Options:".info)
  printColumns("-v".info, "Enable verbose or debug mode.".info );
  printColumns("-l".info, "Start in local environment mode.".info );
  printColumns("-d".info, "Start in development environment mode.".info );
  printColumns("-p".info, "Start in production environment mode.".info );
  process.exit(1);
}

/**
 *
 */
function printColumns(left, right) {
  left = (!left) ? "" : left;
  right = (!right) ? "" : right;
  
  var n = 25 - left.length;
  console.log("  " + left + Array(n+1).join(" ") + right);
}

/**
 * Finds the absolute path to the server application's
 * directory synchronously and returns that value.
 */
function getServerPathSync() {
  var currentPath = process.cwd(),
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

function getDefaultConfigSync() {
  var configPath = __dirname + '/config/default_server_config.js';

  if(fs.existsSync(configPath)) {
    return require(configPath);
  } else {
    return {}
  }
}

function setLoggingTheme() {
  var configPath = __dirname + '/config/default_log_config.js';

  if(fs.existsSync(configPath)) {
    colors.setTheme(require(configPath).theme);
  }
}

/**
 *
 */
function exit() {
  process.exit(1);
}