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
    node,
    nodemon,
    log,
    pm2,
    request,
    trace = false;

var Nodemon = require("./nodemon.js"),
    Node = require("./node.js"),
    Pm2 = require("./pm2.js");

/***
 * Wrench
 * @description A utility library for recursive file operations in node.js.
 * @repo https://github.com/ryanmcgrath/wrench-js
 * @license MIT
 */
var wrench = require('wrench');


/***
 * Path
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
 * ******************** Constructor & Initalization
 * ************************************************** */

var Server = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  node = new Node(_fox);
  nodemon = new Nodemon(_fox);
  pm2 = new Pm2(_fox);


  // Load external modules.
  argv = require('optimist').argv;
  request = require('request');

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


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

var start = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      node.start(_config, next);
      break;

    case "nodemon":
      nodemon.start(_config, next);
      break;

    case "pm2":
      pm2.start(config, next);
      break;
    case "fox":
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

var stop = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      node.stop(_config, next);
      break;

    case "nodemon":
      nodemon.stop(_config, next);
      break;

    case "pm2":
      pm2.stop(config, next);
      break;

    case "fox":
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

var restart = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      node.restart(_config, next);
      break;

    case "nodemon":
      nodemon.restart(_config, next);
      break;

    case "pm2":
      pm2.restart(config, next);
      break;

    case "fox":
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

var logs = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      break;

    case "nodemon":
      break;

    case "pm2":
      pm2.logs(_config, next);
      break;

    case "fox":
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

var isLogIndicationServerStarted = function(str) {
  return (str.indexOf("Listening on port") != -1);
}


/**
 * Create a new server.
 */
var create = function(name, _config, next) {
  if( ! next) {
    next = function(err) { if(err) {log.error(err);} };
  }

  _config = (_config) ? _config : config;

  name = (name === undefined) ? "server" : name;

  var newServerPath = path.normalize(_config.userPath + "/" + name);

  // Check if the new server location is taken
  if(fs.existsSync(newServerPath)) {
    return next(new Error("Server already exists at " + newServerPath));
  }

  // Check for a collision of server resources.
  if(_config.serverPath && _config.serverPath.indexOf(_config.userPath) !== -1) {

    // Check for index file at current directory
    if(fs.existsSync(path.resolve(newServerPath, "../index.js"))) {
      return next(new Error("Server already exists at " + path.resolve(newServerPath, "../index.js")));
    }

    var serverSplitPath = _config.serverPath.replace(_config.userPath, "").split(path.sep);

    if(serverSplitPath[1] === "name" || serverSplitPath[1] === "app") {
      return next(new Error("Server already exists at " + fox.config.serverPath));
    }
  }

  log.info("3. Creating " + name + "...");
  wrench.copyDirSyncRecursive(_config.foxServerPath, newServerPath, {
    forceDelete: true, 
    preserveFiles: true, 
    inflateSymlinks: false, 
    excludeHiddenUnix: true
  });


  log.info("2. Installing npm modules...");
  fox.worker.execute("npm", ["--prefix", newServerPath, "install"], {}, false, function(err, code, stdout, stderr) {

    // Update the config file.
    _config = fox.config.updateConfigPaths(_config);

    install(_config, next);
  });
}


var install = function(_config, next) {
  fox.log.info("1. Setting up the database...");

  next = (next) ? next : function(err) { log.error(err); };

  start(_config, function(err, output) {
    if(err) {
      return next(err);
    }

    var installKey = "IOlQ9V6Tg6RVL7DSJFL248723Bm3JjCF34FI0TJOVPvRzz";
    request.post("http://localhost:3001/install.json?access_token="+installKey, {}, function(err, r, body) {
      if(err) {
        return next(err)
      }

      // Check the body for an error.
      body = (body) ? JSON.parse(body) : {};
      if(body["error"]) {
        nodemon.stop();
        return next("("+body["status"]+") "+body["error"]);
      }

      // Stop the server
      nodemon.stop();
      fox.log.info("0. Success!");

      // Finally relaunch the server, install complete.
      fox.worker.fork(_config["foxBinPath"]+"/fox", ["start", "-l"], { cwd: '.' }, function(err) {
        return next(err);
      }); 
    });
  });
}




/*
var install = function(config, next) {
  fox.log.info("1. Initalizing database...");
  var installKey = "IOlQ9V6Tg6RVL7DSJFL248723Bm3JjCF34FI0TJOVPvRzz";
  request.post("http://localhost:3001/install.json?access_token="+installKey, {}, function(err, r, body) {
    body = (body) ? JSON.parse(body) : {};
    
    if(body["error"]) {
      return next("("+body["status"]+") "+body["error"]);
    }

    if(err) {
      fox.log.info("")
    }
    fox.log.info("0. Success!");

    return next(err);
  });
} */


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Server.prototype.start = start;
Server.prototype.stop = stop;
Server.prototype.restart = restart;
Server.prototype.install = install;
Server.prototype.create = create;
Server.prototype.logs = logs;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Server;

// Reveal the public API.
exports = Server;