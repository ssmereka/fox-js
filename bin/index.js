// ~> Index
// ~A Scott Smereka

/* Fox
 * Framework for simplifying node server development
 * and taking a server into production.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
var Cli    = require("./cli.js"),
    Log    = require("./fox_log.js"),
    Server = require("./server.js");

var fox;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

function Fox() {
  this.config = Config.config();

  this.log      = new Log(this);

  this.execute = execute;
  this.littleChildren = [];
  this.addChild = addChild;
  this.removeChild = removeChild;
  
  this.server   = new Server(this);
  this.cli      = new Cli(this);

  fox = this;
};


var getInstance = function() {
  if(fox === undefined) {
    //console.log("Returning new instance of fox.");
    return new Fox();
  } else {
    //console.log("Returning current instance of fox.");
    return fox;
  }
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

/**
 *
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
      end(err, code);
    }

    // Remove the child from the list of children processes.
    removeChild(this);
  });
  
  // Add the child to the list of children processes.
  addChild(child);

  return child;
}


/**
 * Execute a command in a child process.
 * @param command is the command to be executed by the child's process.
 * @param args are the args to be sent to the child's command.
 * @param options are the options to be sent to the child's command.
 * @param showStd when true, will show all stdout and stderrs to
 * the current processes' stdout and stderr.
 * @param end is a callback function called when the child is killed.
 */
var execute = function(command, args, options, showStd, end) {
  // Default to showing the stderr and stdout.
  showStd = (showStd === undefined) ? true : showStd;

  var child = childProcess.spawn(command, args, options);
  
  var stdout = "",
      stderr = "";

  // Handle child process standard out.
  child.stdout.on('data', function(data) {
    if(data) {
      stdout += data;
      if(showStd) {
        process.stdout.write("" + data);
      }
    }
  });

  // Handle child process standard error.
  child.stderr.on('data', function(data) {
    if(data) {
      stderr += data;
      if(showStd) {
        process.stderr.write("" + data);
      }
    }
  });

  // Define what to do when a child is closed.
  child.on('close', function(code) {
    if(end) {
      end(err, code, stdout, stderr);
    }

    // Remove the child from the list of children processes.
    removeChild(this);
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

  _fox.littleChildren.remove(child);
}



/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Export singleton of Fox to anyone who "requires" it.
exports = module.exports = getInstance();

// Reveal the public API.
exports.Fox = Fox;