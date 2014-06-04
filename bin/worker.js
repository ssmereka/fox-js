// ~A Scott Smereka

/* Worker
 * Creation and management of child processes and task
 * is done by this module.
 */


/* ************************************************** *
 * ******************** Node.js Core Modules
 * ************************************************** */

/***
 * Child Process
 * @stability 3 - Stable
 * @description Handle child processes in node.js
 * @website http://nodejs.org/api/child_process.html
 */
var childProcess = require('child_process');

/***
 * Utility
 * @stability 4 - API Frozen
 * @description node.js utility functions
 * @website http://nodejs.org/api/util.html#util_util
 */
var util = require('util');

/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

// Local variables
var debug = false,        // Flag to display debug logs.
    fox,                  // Reference to fox instance.
    trace = false;        // Flag to display trace logs.

// External modules
var async;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor for worker, handles initalizing the 
 * worker instance using fox and its config object.
 */
var Worker = function(_fox) {
  // Load external modules.
  argv = require('optimist').argv;
  request = require('request');
  async = require('async');

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

  if(fox.littleChildren === undefined) {
    fox.littleChildren = [];
  }

  handleConfig(fox["config"]);

  next();
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Creates a child process using node's fork command.  
 * Also handles keeping track of the child process
 * so it can be gracefully killed if needed.
 */
var fork = function(command, args, options, end, onStdout, onStderr, onMessage) {
  var child = childProcess.fork(command, args, options);

  if(onMessage) {
    child.on('message', onMessage);
  }

  if(onStdout) {
    child.stdout.on('data', onStdout);
  }

  if(onStderr) {
    child.stderr.on('data', onStderr);
  }

  // Define what to do when a child is closed.
  child.on('close', function(code) {
    if(end) {
      end(undefined, code);
    }

    // Remove the child from the list of children processes.
    removeChild(this);
  });
  
  // Add the child to the list of children processes.
  addChild(child);

  return child;
}

/**
 * Creates a child process using node's execute command.
 * Also handles keeping track of the child process
 * so it can be gracefully killed if needed.
 */
var execute = function(cmd, end) {
  var child = childProcess.exec(cmd, function(err, stdout, stderr) {
    if(end) {
      end(err, stdout, stderr);
    }

    // Remove the child from the list of children processes.
    removeChild(this);
  });

  // Add the child to the list of children processes.
  addChild(child);

  return child;
}


/**
 * Creates a child process using node's spawn command.
 * Also handles keeping track of the child process so it 
 * can be gracefully killed if needed.
 * @param command is the command to be executed by the child's process.
 * @param args are the args to be sent to the child's command.
 * @param options are the options to be sent to the child's command.
 * @param showStd when true, will show all stdout and stderrs to
 * the current processes' stdout and stderr.
 * @param end is a callback function called when the child is killed.
 */
var spawn = function(command, args, options, showStd, end, callEndOnExit) {
  var isEndCalled = false;

  // Default to showing the stderr and stdout.
  showStd = (showStd === undefined) ? true : showStd;
  var child = childProcess.spawn(command, args, options);

  var stdout = "",
      stderr = "";

  // Handle child process standard out.
  child.stdout.on('data', function(data) {
    if(data) {
      stdout += data.toString();
      if(showStd) {
        process.stdout.write("" + data);
      }
    }
  });

  // Handle child process standard error.
  child.stderr.on('data', function(data) {
    if(data) {
      stderr += data.toString();
      if(showStd) {
        process.stderr.write("" + data);
      }
    }
  });

  // Define what to do when a child is closed.
  child.on('close', function(code) {
    //console.log(this.pid + ": Close");
    if(end && ! isEndCalled) {
      isEndCalled = true;
      end(undefined, code, stdout, stderr);
    }

    // Remove the child from the list of children processes.
    removeChild(this);
  });

  if(callEndOnExit) {
    child.on("exit", function(code) {
      //console.log(this.pid + ": Exit");
      if(end && ! isEndCalled) {
        isEndCalled = true;
        end(undefined, code, stdout, stderr);
      }
    });
  }

  // Catch errors thrown by the child process.
  child.on("error", function(error) {
    if(error) {
      if(showStd) {
        stderr += error.message || error.toString();
        process.stderr.write("" + error);
      }
      if(end) {
        end(error, undefined, undefined, undefined);
      }
    }
  });

  // Add the child to the list of children processes.
  addChild(child);

  return child;
}

/**
 * Add a child process to the list of children processes.
 */
var addChild = function(child, _fox) {
  if( ! child) {
    return log.error("Cannot add child '" + child +"' to list of children.");
  }

  _fox = ( ! _fox) ? fox : _fox;

  if( ! _fox["littleChildren"]) {
    _fox["littleChildren"] = [ child ];
  } else {
    _fox.littleChildren.push(child);
  }
}

/**
 * Remove a child process from the list of children processes.
 */
var removeChild = function(child, _fox) {
  if( ! child) {
    return log.error("Cannot remove child '" + child +"' from list of children.");
  }

  _fox = ( ! _fox) ? fox : _fox;

  if( ! _fox["littleChildren"]) {
    return log.error("Cannot remove child from empty list of children.");
  }

  var index = _fox.littleChildren.indexOf(child);
  if(index > -1) {
  	_fox.littleChildren.splice(index, 1);
  }
}

/**
 * Kill all child processes gracefully, then proceed
 * with the callback.  If the callback is not defined,
 * fox will exit.
 */
var killChildren = function(index, signal, end) {
  var littleChildren = fox.littleChildren;
  // Ensure signal is valid or defaults to SIGINT.
  signal = (signal === undefined) ? "SIGINT" : signal;

  // Ensure callback is valid or defaults to exit.
  end = (end === undefined) ? function() { fox.exit(); } : end;

  // Ensure index is valid, or defaults to first child.
  index = ( ! index || index >= littleChildren.length || index < 0) ? 0 : index;
  
  var tasks = [];

  for(var i = index; i < littleChildren.length; i++) {
    tasks.push(killChildFunction(littleChildren[i], signal));
  }

  async.parallel(tasks, function(err, results) {
    end();
  });
}

/**
 * Create a function to kill a child process.
 */
function killChildFunction(child, signal) {
  return function(next) {
    killChild(child, signal, next);
  }
};

/**
 * Kill a child process sending the requrested
 * signal.  Once the child is killed, it make a 
 * call to the callback.
 */
function killChild(child, signal, next) {
  // Event so child makes a call to the next
  // callback after closing.
  child.once('close', function(code) {
    if(next) {
      next();
    }
  });

  // Kill the child process with the specified signal.
  if(child && child.pid && signal) {
    try {
      process.kill(child.pid, signal);
    } catch(e) {
      log.debug(e);
      fox.exit();
    }
  }
}

var killProcessAtPort = function(config, port, next) {
  port = (port) ? port : config["port"];

  if(port != undefined) {
    execute("sudo kill `sudo lsof -t -i:" + port + "`", function(err, stdout, stderr) {
      util.puts(stdout);
      next();
    });
  } else {
    next(new Error("Port is not defined."));
  }
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Worker.prototype.fork = fork;
Worker.prototype.execute = spawn;
Worker.prototype.executeCmd = execute;
Worker.prototype.addChild = addChild;
Worker.prototype.kill = killProcessAtPort;
Worker.prototype.removeChild = removeChild;
Worker.prototype.killChildren = killChildren;
Worker.prototype.killChildFunction = killChildFunction;
Worker.prototype.updateFoxReference = updateFoxReference;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Worker;

// Reveal the public API.
exports = Worker;