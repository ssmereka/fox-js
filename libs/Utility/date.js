// ~> Library
// ~A Scott Smereka

/* Date
 * Library for handling dates.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,
    fox,
    log, 
    trace = false,
    _ = require("underscore");

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var DateLibrary = function(_fox) {
  if(_fox) {
    // Handle parameters
    fox = _fox;

    // Load internal modules.
    log = fox.log;

    // Configure date instance.
    handleConfig(fox["config"]);
  }
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
 * Returns the difference between two dates.  A Postitive 
 * number is a date in the future where negative is in the past.
 * If either parameter is not a valid date, zero will be returned.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diff = function(a, b, isDLS) {
  if(_.isDate(a) && _.isDate(b)) {
    if(isDLS) {
      return (a.getTime() - b.getTime());
    } else {
      // Discard the time and time-zone information.
      var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      return (utc1 - utc2);
    }
  }

  return 0;
}

/**
 * Get the difference of two dates in milliseconds. 
 * If either parameter is not a valid date, zero will be 
 * returned as the remainder.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diffInMilliseconds = function(a, b, isDLS) {
  return diff(a,b,isDLS);
};

/**
 * Get the difference of two dates in seconds. 
 * If either parameter is not a valid date, zero will be 
 * returned as the remainder.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diffInSeconds = function(a, b, isDLS) {
  return Math.floor( diff(a,b,isDLS) / 1000 );
};

/**
 * Get the difference of two dates in minutes. 
 * If either parameter is not a valid date, zero will be 
 * returned as the remainder.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diffInMinutes = function(a, b, isDLS) {
  return Math.floor( diff(a,b,isDLS) / ( 60000 ));
};

/**
 * Get the difference of two dates in hours. 
 * If either parameter is not a valid date, zero will be 
 * returned as the remainder.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diffInHours = function(a, b, isDLS) {
  return Math.floor( diff(a,b,isDLS) / ( 3600000 ));
};

/**
 * Get the difference of two dates in days. 
 * If either parameter is not a valid date, zero will be 
 * returned as the remainder.
 * @param a is the minuend date value.
 * @param b is the subtrahend date value.
 * @param isDLS when true the remainder will include Daylight Savings Time.
 */
var diffInDays = function(a, b, isDLS) {
  return Math.floor( diff(a,b,isDLS) / ( 86400000 ));
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
DateLibrary.prototype.diff = diff;
DateLibrary.prototype.diffInMilliseconds = diffInMilliseconds;
DateLibrary.prototype.diffInSeconds = diffInSeconds;
DateLibrary.prototype.diffInMinutes = diffInMinutes;
DateLibrary.prototype.diffInHours = diffInHours;
DateLibrary.prototype.diffInDays = diffInDays;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = DateLibrary;

// Reveal the public API.
exports = DateLibrary;