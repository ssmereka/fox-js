// ~A Scott Smereka

/* Pm2
 * Handles tasks involiving running the server using pm2.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,        // Flag to show debug logs.
    fox,                  // Reference to fox instance.
    log,                  // Reference to fox log instance.
    trace = false;        // Flag to show trace logs.

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor for PM2, initalizes the instance based 
 * on the fox instance and configuration.
 */
var Pm2 = function(_fox) {
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

var isInstalled = function(next) {
  npmListProcess = fox.worker.execute("npm", ["list", "pm2", "-g"], { cwd: '.' }, false, function(err, code, npmlist, stderr) {
    next(err, (npmlist.indexOf("pm2") !== -1));
  });
}

var install = function(next) {
  isInstalled(function(err, isInstalled) {
    if(err) {
      next(err);
    } else if(isInstalled) {
      next();
    } else {
      log.info("Installing pm2...");
      fox.worker.execute("npm", ["install", "pm2", "-g"], { cwd: '.' }, false, function(err, code, output, stderr) {
        log.success("PM2 install complete.");
        next(err);
      });
    }
  });
}

/**
 * Start the server using pm2 to daemonize the process.  Also 
 * perform any clustering that is needed.
 */
var start = function(config, args, next) {
  // Check for a valid server file.
  if(! config || config.serverPath === undefined) {
    return next(new Error("A node.js server file was not found."));
  }

  // Arguments for staring the server using pm2.
  var args = [
    "start",
    config.serverPath,
    "-i",
    config.cluster.workers,
    "--name", 
    config.name,
    " -- -p test"
  ];

  // Enable/Disable fork mode
  if(config.pm2 && config.pm2.fork) {
    args.splice(1, 0, "-x");
  }

  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to start the server using pm2.
  var opts = {
    cwd: '.',
    env: env
  };

  install(function(err) {

    // Check if pm2 server already running, Get list of current pm2 servers.
    var jlistProcess = fox.worker.execute("pm2", ["jlist"], opts, false, function(err, code, jlist, stderr) {
    //var jListProcess = fox.worker.executeCmd("pm2 jlist", function(err, jlist, stderr) {
      if(err) {
        if(next) {
          return next(err);
        }
        fox.log.error(err);
        exit();
      }
      
      // Convert the list to an array.
      if(jlist) {
        try {
          JSON.parse(jlist);
        } catch (e) {
          jlist = undefined
        };
      } else {
        jlist = undefined;
      }

      // Check if the server is already running.
      if(jlist !== undefined && jlist instanceof Array && jlist.length > 0) {
        for(var i = jlist.length-1; i >= 0; --i) {
          if(jlist[i]["name"] === config.name && jlist[i]["pm2_env"]["status"] === "online") {
            if(next) {
              return next(new Error("Server " + config.name + " is already started."));
            }
            fox.log.error("Server " + config.name + " is already started.");
            return;
          }
        }
      }

      // Server is not running, so start it.
      var startProcess = fox.worker.execute("pm2", args, opts, true, function() {
        return next();
      });
    }, true);
  });
}

/**
 * Stop the server.  If the server encounters an error
 * trying to stop, log it, and send the results to the 
 * callback function.
 */
var stop = function(config, next) {
  var opts = {
    cwd: '.',
    env: process.env
  };
  var stopProcess = fox.worker.execute("pm2", ["stop", config.name], opts, true, next);
}

/**
 * Gracefully restart the server in daemon mode.
 */
var restart = function(config, next) {
  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to restart the server using pm2.
  var opts = {
    cwd: '.',
    env: env
  };

  // Restart the named servers gracefully.
  var restartProcess = executeCommand("pm2", ["gracefulReload", config.name], opts, next);
}

/**
 * Show the pm2 server logs.
 */
var logs = function(config, next) {
  var opts = {
    cwd: '.'
  };

  var logsProcess = fox.worker.execute("pm2", ["logs"], opts, true, next);
}


/**
 * Clear all server logs.
 */
function clearServerLogs(config, next) {
  fox.log.info("Clearing server logs...");

  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to flush the pm2 logs.
  var opts = {
    cwd: '.',
    env: env
  };

  // Flush the logs from pm2
  //var flushProcess = executeCommand("pm2", ["flush"], opts, next);
  var flushProcess = fox.worker.execute("pm2", ["flush"], opts, true, next);
}

/**
 * Delete all servers from pm2.
 */
function deleteServersFromPm2(config, next) {
  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to flush the pm2 logs.
  var opts = {
    cwd: '.',
    env: env
  };

  // Delete the named servers with from pm2.
  //var deleteProcess = executeCommand("pm2", ["delete", config.name], opts, next);
  var deleteProcess = fox.worker.execute("pm2", ["delete", config.name], opts, true, next);
}

/**
 * Kill the PM2 deamon
 */
function killPm2Deamon(config, next) {
  // Create the options used to flush the pm2 logs.
  var opts = {
    cwd: '.',
    env: process.env
  };

  var deleteProcess = fox.worker.execute("pm2", ["kill"], opts, true, next);
}

/**
 * Clear and remove all current tracking of the server.
 */
var clear = function(config, next) {
  stop(config, function(err) {
    clearServerLogs(config, function(err) {
      deleteServersFromPm2(config, function(err) {
        killPm2Deamon(config, next);
      });
    });
  });
}

/**
 * Reload the server with zero down time.
 * This will preserve the existing connections and reload 
 * each worker one by one.
 * Note:  This will not do a gracefull shutdown.
 */
var reload = function(config, next) {
  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to reload the server using pm2.
  var opts = {
    cwd: '.',
    env: env
  };

  // Reload the named servers with zero down time..
  var reloadProcess = fox.worker.execute("pm2", ["reload", config.name], opts, true, next);
}


var installServer = function(_config, next) { 
  fox.log.info("1. Setting up the database...");

  // Ensure there is a next function.
  next = (next) ? next : function(err) { log.error(err); };

  // Start the server
  start(_config, function(err, output) {
    if(err) {
      return next(err);
    }
    //console.log(_config);

    // Ensure we load the proper configuration object for the enviorment.
    process.NODE_ENV = _config.environment;

    // Load the system configuration file.  This file holds the default
    // configurations for the server.
    try {
      serverConfigFile = require(_config["foxConfigLibPath"]);
    } catch(err) {
      console.log(err);
      return next(new Error("Cannot load system configuration file."));
    }

    // Create a new server library config instance.
    var serverConfig = new serverConfigFile();

    // Create a server config object.
    var config = serverConfig.createConfigObject(undefined);

    // TODO: Generate / get an install key.
    var installKey = "IOlQ9V6Tg6RVL7DSJFL248723Bm3JjCF34FI0TJOVPvRzz";

    //console.log(config.server.uri+"/install.json?access_token="+installKey);

    isServerRunning(config, function(err) {
      if(err) {
        return next(err);
      }

      // Execute the install command.
      request.post(config.server.uri+"/install.json?access_token="+installKey, {}, function(err, r, body) {
        if(err) {
          return next(err)
        }

        // Check the body for an error.
        body = (body) ? JSON.parse(body) : {};
        if(body["error"]) {
          //nodemon.stop();
          return next("("+body["status"]+") "+body["error"]);
        }

        // Stop the server
        stop(_config, function(err) {
          isServerStopped(config, function(err) {
            if(err) {
              //return next(err);  for now just continue on.
            }

            fox.log.info("0. Success!");

            // Finally relaunch the server, install complete.
            fox.worker.fork(_config["foxBinPath"]+"/fox", ["start", "-d"], { cwd: '.' }, function(err) {
              return next(err);
            }); 
          });
        });
      });
    });
  });

  /*var ipm2 = require('pm2-interface')();
  ipm2.on('ready', function() {
    console.log("Connected to pm2");

    ipm2.bus.on('cmd:install', function(data) {
      console.log("Install results: ");
      console.log(data);
    });

    console.log("Send Message");
    ipm2.rpc.msgProcess({ name: "fox", msg: { type: "cmd:install" } }, function(err, res) {
      if(err) {
        console.log(err);
      }
      console.log("Response: ");
      console.log(res);
    });

    ipm2.rpc.getMonitorData({}, function(err, dt) {
      console.log("Monitor");
      console.log(dt);
    });
  });
  next(); */
}

function isServerRunning(config, next) {
  var error = new Error("Server did not start.");
  var attempts = 5;

  var interval = setInterval(function() {    
    if(attempts > 0) {
      request.get(config.server.uri, function(err, r, body) {
        if(err) {
          //console.log(err);
        } else {
          attempts = 0;
          error = undefined;
        }
      });

      attempts--;
    } else {
      clearInterval(interval);
      return next(error);
    }
  }, 2000);
}


// TODO: Does not throw an error....
function isServerStopped(config, next) {
  var error = new Error("Server did not stop.");
  var attempts = 2;

  var interval = setInterval(function() {    
    if(attempts > 0) {
      request.get(config.server.uri, function(err, r, body) {
        if(err) {
          //console.log(err);
          attempts = 0;
          error = undefined;
        }
      });

      attempts--;
    } else {
      clearInterval(interval);
      return next(error);
    }
  }, 2000);
}



/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Pm2.prototype.isInstalled = isInstalled;
Pm2.prototype.install = install;
Pm2.prototype.installServer = installServer;
Pm2.prototype.start = start;
Pm2.prototype.stop = stop;
Pm2.prototype.restart = restart;
Pm2.prototype.reload = reload;
Pm2.prototype.logs = logs;
Pm2.prototype.clear = clear;
Pm2.prototype.updateFoxReference = updateFoxReference;

/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Pm2;

// Reveal the public API.
exports = Pm2;