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

/**
 * Set the Fox color theme with any of these 
 * possible colors: yellow, cyan, white, magenta, 
 * green, red, grey, blue, rainbow, zebra, random.
 */
colors.setTheme({
  success: 'green',
  ok: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'magenta',
  info: 'cyan',
});


//**************************************************
//******************** Variables
//**************************************************

var config = {

  // The current path of the caller
  currentPath: process.cwd(),

  // Absolute path to this script.
  scriptPath: process.cwd(),

  // Absolute path to the backend application
  serverPath: getServerPathSync()
}

//**************************************************
//******************** Argument Parsing
//**************************************************

// Help - Print fox usage.
if(argv._[0] == undefined || (argv._[0] && _.contains(['help', 'h'], argv._[0]))) {
  printHelp();
  exit();
} 

// Start - Start the server
else if(argv._[0] && _.contains(['start', 's'], argv._[0])) {
  require(config.serverPath).start(config, function(err, success) {
    if(err) {
      console.log(err.error);
    } else {
      console.log(success.success);
    }
  });
} 

// Argument is not valid
else {
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

/**
 *
 */
function exit() {
  process.exit(1);
}