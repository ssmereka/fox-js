// ~>Library
// ~A Scott Smereka

/* Log
 * Library for logging information to one or more destinations.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var config,
    /***
     * Colors Module
     * Possible Colors: yellow, cyan, white, magenta, green, red, grey, blue, rainbow, zebra, random.
     * Possible Styles: bold, italic, underline, inverse.
     */
    colors,
    debug = false,
    fox,
    trace = false;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Log
 * Initalize a new logging library object.
 */
var Log = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load interal modules.
  config = fox["config"];

  // Load external modules.
  colors = require("colors");
  
  // Configure log instance.
  handleConfig(config);
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
 * Checks the display log variable and determines
 * whether or not to show the log.
 */
var isDisplayLog = function(displayLog) {
  // If the user didn't specify a display log variable, or
  // if the display log variable is true, then return true.
  if(displayLog === undefined || displayLog) {
    return true;
  }
  return false;
}

/**
 * Special characters and tags are added to the
 * log string based on the type of log.
 */
var formatLog = function(string, tag) {
  if(/\r|\t/.exec(string)) {
    return string.replace(/\t/g, '          ');
  } else if(tag) {
    return "[ " + tag + " ] " + string;
  } else {
    return string;
  }
}


/**
 * Verbose (White): Display logs that are descriptive.
 */
var v = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
      return;
  }

  console.log(string.white);
};

/**
 * Debug (Magenta): Display addtional information only if the app is in debug mode.
 */
var d = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
    return;
  }

  if(! debug) {
    return;
  }

  console.log(formatLog(string, "DEBUG").magenta);
};

/**
 * Info (Cyan): Display general information about an action or event.
 */
var i = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
    return;
  }

  console.log(formatLog(string, "INFO").cyan);
};

/**
 * Success (Green): Display a success message to the user.
 */
var s = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
    return;
  }

  console.log(formatLog(string, "OK").green);
};


/**
 * Warning (Yellow): Warn the user about an action or event.
 */
var w = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
    return;
  }

  console.log(formatLog(string, "WARNING").yellow);
};

/**
 * Error (Red): Display an error to the user.
 * Params:
 *  err - a string or error object.  Error objects should 
 *        implement the err.message and err.status properties
 *        in order to be displayed properly.
 */
var e = function(err, displayLog) {
  if(! isDisplayLog(displayLog) || ! err) {
    return;
  }

  // Check if the err is a string or a valid error object.
  // Convert strings to a valid error object.
  if( ! err.message) {
    var obj = new Error(err);
    err = obj;
  }
  
  // Ensure the error objects have a status aka error code.
  if( ! err.status ) {
    err.status = 500;
  }

  // Log the error
  console.log(formatLog(err.message, err.status.toString()).red);
};


var t = function(where, string, displayLog) {
  if(! isDisplayLog(displayLog) || string === undefined) {
    return;
  }

  where = (where === undefined) ? "Unknown: " : where + ": ";

  console.log(formatLog(where + string, "TRACE").grey)

}

/**
 * Log (Default): Display a message using the default console settings.
 */
var log = function(string, displayLog) {
  if(! isDisplayLog(displayLog)) {
    return;
  }

  console.log(string);
};

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Log.prototype.v = v;
Log.prototype.d = d;
Log.prototype.i = i;
Log.prototype.s = s;
Log.prototype.w = w;
Log.prototype.e = e;
Log.prototype.t = t;
Log.prototype.log = log;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Log;

// Reveal the public API.
exports = Log;
