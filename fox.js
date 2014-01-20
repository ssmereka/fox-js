#!/usr/bin/env node

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

var app = {
  path: process.cwd()
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
if(argv._[0] && _.contains(['start', 's'], argv._[0])) {
  process.cwd()
  app.path
  //NODE_ENV="local" 
  exit();
}

// Argument is not valid
console.log("Command has invalid arguments.".error);
exit();

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
 *
 */
function exit() {
  process.exit(1);
}