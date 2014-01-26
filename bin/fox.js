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
 * Path
 * @description Handles tranforming file paths.
 * @website http://nodejs.org/api/path.html
 */
var path = require('path');

/***
 * FS
 * @description access the file system
 * @website http://nodejs.org/api/fs.html
 */
var fs = require('fs');


//**************************************************
//******************** Setup Fox
//**************************************************

var fox = {};

// Load the fox logger.
fox.log = tryRequire('fox_log.js');

// Load the default backend server configuration.
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

fox.config["cluster"]["workers"] = getNumberOfWorkers(fox.config);

//**************************************************
//******************** Console Argument Parsing
//**************************************************

// Flag indicating if the user input has been handled.
var isArgvHandled = false,
    isDaemon = false;

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

  if(isDaemonEnabled()) {
    startServerAsDaemon(fox.config);
  } else {
    startServer(fox.config);
  }
} 

// Stop - Stop the server
if(argv._[0] && _.contains(['stop'], argv._[0])) {
  isArgvHandled = true;
  stopServer(fox.config);
} 

// Restart - Restart the server gracefully with 0 downtime.
if(argv._[0] && _.contains(['restart'], argv._[0])) {
  isArgvHandled = true;
  if(isDaemonEnabled()) {
    restartServer(fox.config);
  }
} 

// Argument is not valid
if ( ! isArgvHandled) {
  fox.log.error("Command has invalid arguments.");
  exit();
}


//**************************************************
//******************** Private Methods
//**************************************************

/**
 * Start the server normally using the "node" command.  
 */
function startServer(config, next) {
  var sys = require('sys');
  var exec = require('child_process').exec;
  exec('NODE_ENV="'+config.environment+'" node '+config.serverPath, function(err, stdout, stderr) {
    sys.puts(stdout);
    if(next) { 
      next(undefined, true); 
    }
  });
}

/**
 * Start the server using pm2 to daemonize the process.  Also 
 * perform any clustering needed.
 */
function startServerAsDaemon(config, next) {
  var sys = require('sys');
  var exec = require('child_process').exec;
  exec('NODE_ENV="'+config.environment+'" pm2 start '+config.serverPath+" -i "+config.cluster.workers+" --name "+config.name, function(err, stdout, stderr) {
    sys.puts(stdout);
    if(next) { 
      next(undefined, true); 
    }
  });
}

function getNumberOfWorkers(config) {
  var isCluster = (config["cluster"] && config.cluster.enabled);
  if(isCluster) {
    var cpuCount = require('os').cpus().length;
    var workerMax = (config.cluster["workerMax"]) ? config.cluster.workerMax : cpuCount;
    
    // Determine the number of workers to create based 
    // on the number of CPUs and the max number of workers.
    var workerCount = (config.cluster["workerPerCpu"] && cpuCount <= workerMax) ? cpuCount : workerMax;

    return (workerCount == cpuCount) ? "max" : workerCount;
  } else {
    return 1;
  }
}

function restartServer(config, next) {
  console.log("Restarting Server...");
  var sys = require('sys');
  var exec = require('child_process').exec;
  exec('NODE_ENV="'+config.environment+'" pm2 reload all', function(err, stdout, stderr) {
    sys.puts(stdout);
    if(next) { 
      next(undefined, true); 
    }
  });
}

/**
 * Stop the server.  If the server encounters an error
 * trying to stop, log it, and send the results to the 
 * callback function.
 */
function stopServer(config, next) {
  console.log("Restarting Server...");
  var sys = require('sys');
  var exec = require('child_process').exec;
  exec('pm2 stop all', function(err, stdout, stderr) {
    sys.puts(stdout);
    if(next) { 
      next(undefined, true); 
    }
  });
}

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
 * Combine two object's attributes giving priority
 * to the first object's (obj1) attribute values.
 */
function mergeObjects(obj1, obj2) {
  for(var key in obj2) {
    if(obj1[key] === undefined)
      obj1[key] = obj2[key];
  }
  return obj1;
}

function isDaemonEnabled() {
  // Check for a command line argument.
  if(argv.s !== undefined) {
    return ! argv.s;
  }

  if(argv.m !== undefined) {
    return argv.m;
  }

  if(fox && fox.config && fox.config.daemon !== undefined) {
    return fox.config.daemon;
  } else {

    // Default daemon to enabled.
    return true;
  }
}

/**
 * Exit the script.
 */
function exit() {
  process.exit(1);
}