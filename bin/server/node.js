// ~A Scott Smereka

/* Node
 * Handles tasks involiving running the server using node.
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

/**
 * Constructor for node object that setups the instance
 * based on the fox instance and configuration.
 */
var Node = function(_fox) {
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

/**
 * Start the server normally using the "node" command.
 * If next is defined, it will be called once the server
 * has been started.
 */
var start = function(config, args, next) {
  var onStdOutput,
      isNextCalled = false;

  // If next is not defined, create a method to print errors.
  // Otherwise create a method to call next after the server
  // has started successfully.
  if( ! next) {
    next = function(err) { if(err) { log.error(err); } };
  } else {
    onStdOutput = function(data) {
      if( ! isNextCalled) {
        if(data && data.toString().indexOf("Listening on port") != -1) {
          next();
          isNextCalled = true;
        }
      }
    };
  }
  
  // Ensure there is a configuration object.
  if( ! config) {
    return next(new Error("startWithNode:  Config object required."));
  }

  // Setup the arguments required to start the node server.
  args = (args) ? args : [];

  args.unshift(config.serverPath);
  //var args = [
  //  config.serverPath
  //];

  // Add our node enviorment.
  var env = process.env;
  env["NODE_ENV"] = config.environment;

  // Setup our options to be sent to node.
  var opts = {
    cwd: '.',
    env: env
  };

  // Create a child process that runs the sever using node.
  var child = fox.worker.execute("node", args, opts, undefined, onStdOutput);
}

var install = function(config, next) {
  log.info("Not implemented.");
  next(new Error("Protocol not implemented"));
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Node.prototype.install = install;
Node.prototype.start = start;
Node.prototype.updateFoxReference = updateFoxReference;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Node;

// Reveal the public API.
exports = Node;