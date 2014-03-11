// ~> Bin
// ~A Scott Smereka

/* Pm2
 * Handles tasks involiving running the server using pm2.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
var debug = false,
    fox,
    log,
    trace = false;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Pm2 = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  // Configure message instance.
  handleConfig(fox["config"]);
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

/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Start the server using pm2 to daemonize the process.  Also 
 * perform any clustering that is needed.
 */
var start = function(config, next) {
  // Arguments for staring the server using pm2.
  var args = [
    "start",
    config.serverPath,
    "-i",
    config.cluster.workers,
    "--name", 
    config.name
  ];

  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to start the server using pm2.
  var opts = {
    cwd: '.',
    env: env
  };

  // Get list of current pm2 servers.
  var jlistProcess = fox.worker.execute("pm2", ["jlist"], { cwd: '.' }, false, function(err, code, jlist, stderr) {
    if(err) {
      if(next) {
        return next(err);
      }
      fox.log.error(err);
      exit();
    }
    
    // Convert the list to an array.
    jlist = (jlist) ? JSON.parse(jlist) : undefined;

    // Check if the server is already running.
    if(jlist !== undefined && jlist instanceof Array && jlist.length > 0) {
      for(var i = jlist.length-1; i >= 0; --i) {
        if(jlist[i]["name"] === config.name && jlist[i]["pm2_env"]["status"] === "online") {
          if(next) {
            return next(new Error("Server " + config.name + " is already started."));
          }
          return fox.log.error("Server " + config.name + " is already started.");
        }
      }
    }

    var startProcess = fox.worker.execute("pm2", args, opts, true, next);
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

var logs = function(config, next) {
  var opts = {
    cwd: '.'
    //env: process.env
  };
  var logsProcess = fox.worker.execute("pm2", ["logs"], opts, true, next);
}


function showServerLogs(config, next) {
  // Create the options used to reload the server using pm2.
  var opts = {
    cwd: '.',
    env: process.env
  };

  var startProcess = executeCommand("pm2", ["logs"], opts, function(code) {
    if(next) {
      next();
    }
  });
}

/**
 * Clear all logs.
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
  var flushProcess = executeCommand("pm2", ["flush"], opts, next);
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
  var deleteProcess = executeCommand("pm2", ["delete", config.name], opts, next);
}

/**
 * Clear and remove all current tracking of the server.
 */
function clearServer(config, next) {
  stopServer(config, function(err) {
    clearServerLogs(config, function(err) {
      deleteServersFromPm2(config, next);
    });
  });
}



/**
 * Reload the server with zero down time.
 * This will preserve the existing connections and reload 
 * each worker one by one.
 * Note:  This will not do a gracefull shutdown.
 */
function restartServerZeroDowntime(config, next) {
  // Add the enviorment mode to the current enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Create the options used to reload the server using pm2.
  var opts = {
    cwd: '.',
    env: env
  };

  // Reload the named servers with zero down time..
  var reloadProcess = executeCommand("pm2", ["reload", config.name], opts, next);
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Pm2.prototype.start = start;
Pm2.prototype.stop = stop;
Pm2.prototype.restart = restart;
Pm2.prototype.logs = logs;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Pm2;

// Reveal the public API.
exports = Pm2;