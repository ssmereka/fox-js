// ~A Scott Smereka

/* Server
 * Create and manage server instances using this 
 * modules methods and the fox configuration object.
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

/***
 * FS
 * @stability 3 - Stable
 * @description access the file system
 * @website http://nodejs.org/api/fs.html
 */
var fs = require('fs');


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

// Local variables
var config,               // Reference to fox server config.
    debug = false,        // Flag to show debug logs.
    fox,                  // Reference to current fox instance.
    node,                 // Instance of node controller object.
    nodemon,              // Instance of nodemon controller object.
    log,                  // Reference to fox log object.
    pm2,                  // Instance of pm2 controller object.
    trace = false;        // Flag to show trace logs.
    
// Load local modules.
var Nodemon = require("./nodemon.js"),
    Node = require("./node.js"),
    Pm2 = require("./pm2.js");

// External modules.
var async,
    argv,                 // Optimist argv module.
    request,              // Request module.
    wrench;               // Wrench module.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor to create the server object and load 
 * any other local modules that are required to manage
 * the server instance(s).
 */
var Server = function(_fox) {
  // Load external modules.
  async = require('async');
  argv = require('optimist').argv;
  request = require('request');
  wrench = require('wrench');


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
 * Update this instances reference to the fox object.  Also update
 * any other modules initalized by this module.
 */
var updateFoxReference = function(_fox, next) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  if( ! _fox) {
    next(new Error("Server Module: Cannot update fox with an invalid fox object."));
  }

  fox = _fox;
  log = fox.log;

  handleConfig(fox["config"]);

  var tasks = [];

  if( ! node) {
    node = new Node(_fox);
  } else {
    tasks.push(updateObjectReferenceFn(node, _fox));
  }

  if( ! nodemon) {
    nodemon = new Nodemon(_fox);
  } else {
    tasks.push(updateObjectReferenceFn(nodemon, _fox));
  }

  if( ! pm2) {
    pm2 = new Pm2(_fox);
  } else {
    tasks.push(updateObjectReferenceFn(pm2, _fox));
  }
  
  if(tasks.length > 0) {
    async.parallel(tasks, function(err, results) {
      next(err);
    });
  } else {
    next();
  }
}

/**
 * Creates and returns a function to update an object's
 * refrence to fox.
 */
function updateObjectReferenceFn(obj, _fox) {
  return function(next) {
    obj.updateFoxReference(_fox, next);
  }
};


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Start the server using a controller and conditions 
 * defiend in the config object.
 **/
var start = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      node.start(_config, next);
      break;

    case "nodemon":
      nodemon.start(_config, next);
      break;

    case "pm2":
      pm2.start(_config, next);
      break;
    
    case "fox":
      log.info("Not implemented.");
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Stop the server using a controller and conditions
 * defiend by the configuration object.
 */
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
      log.info("Not implemented.");
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Restart the server as gracefully as possible using 
 * a controller and conditions defiend by the 
 * configuration object.
 */
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
      log.info("Not implemented.");
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Reload the server using zero downtime techniques.
 */
var reload = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      log.info("Not implemented.");
      break;

    case "nodemon":
      log.info("Not implemented.");
      break;

    case "pm2":
      pm2.reload(_config, next);
      break;

    case "fox":
      log.info("Not implemented.");    
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Clear the server's temp information, such as logs.
 */
var clear = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      log.info("Not implemented.");
      break;

    case "nodemon":
      log.info("Not implemented.");
      break;

    case "pm2":
      pm2.clear(_config, next);
      break;

    case "fox":
      log.info("Not implemented.");    
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Display the server's logs using a controller and 
 * conditions defiend by the configuration object.
 */
var logs = function(_config, next) {
  switch(_config["controller"]) {
    case "node":
      log.info("Not implemented.");
      break;

    case "nodemon":
      log.info("Not implemented.");
      break;

    case "pm2":
      pm2.logs(_config, next);
      break;

    case "fox":
      log.info("Not implemented.");    
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}

/**
 * Create a new server, initalize the database, and 
 * start the server.
 */
var create = function(name, _config, next) {
  // Ensure the next function is defined.
  if( ! next) {
    next = function(err) { if(err) {log.error(err);} };
  }

  // If a config object was not defined, used the local one.
  _config = (_config) ? _config : config;

  // Ensure the server has a name.
  name = (name === undefined) ? "fox" : name;

  // Find the new server's path.
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

  // Ensure the choosen template is already installed.
  fox.template.ensureTemplateIsInstalled(_config, _config.template, function(err, template) {
    if(err) {
      return next(err);
    }

    // Copy the server boilerplate to the new server location.
    log.info("4. Creating " + name + "...");
    wrench.copyDirSyncRecursive(template["dir"], newServerPath, {
      forceDelete: true, 
      preserveFiles: true, 
      inflateSymlinks: false, 
      excludeHiddenUnix: true
    });

    // Update the current config object as well as the global one.
    _config.setSeverPath(newServerPath);
    _config["serverPath"] = newServerPath;
    _config["clientPath"] = path.normalize(newServerPath + "/client");

    // Install the server's dependencies using npm install.
    log.info("3. Installing server modules...");
    fox.worker.execute("npm", ["--prefix", path.normalize(newServerPath + "/server"), "install"], {}, false, function(err, code, stdout, stderr) {

      // Install all the client's dependencies using bower.
      log.info("2. Intalling client modules...");
      fox.client.install(_config, function(err) {

        // Update the config object with the new server's paths.
        _config = fox.config.updateConfigPaths(_config);

        // Run install on the server, initalizing the database and performing 
        // any other tasks defined by the server boilerplate.
        // This will also start the server.
        install(_config, next);
      });
    });
  });
}

/**
 * Run instalization on the server which should setup the database
 * and anything else required by the server.  This will also run the 
 * server and restart the server once installed.
 */
var install = function(_config, next) {
  fox.log.info("1. Setting up the database...");

  // Ensure there is a next function.
  next = (next) ? next : function(err) { log.error(err); };

  // Start the server
  start(_config, function(err, output) {
    if(err) {
      return next(err);
    }

    // TODO: Generate / get an install key.
    var installKey = "IOlQ9V6Tg6RVL7DSJFL248723Bm3JjCF34FI0TJOVPvRzz";

    // Execute the install command.
<<<<<<< HEAD
    request.post("http://localhost:3001/install.json?access_token="+installKey, {}, function(err, r, body) {
=======
    request.post("http://localhost:3000/install.json?access_token="+installKey, {}, function(err, r, body) {
>>>>>>> a76ab4db271f4bfe154e76265c87b93e4458cf60
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


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Server.prototype.start = start;
Server.prototype.stop = stop;
Server.prototype.restart = restart;
Server.prototype.reload = reload;
Server.prototype.install = install;
Server.prototype.create = create;
Server.prototype.logs = logs;
Server.prototype.clear = clear;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Server;

// Reveal the public API.
exports = Server;