// ~> Library
// ~A Scott Smereka

/* Date
 * Library for handling dates.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var _ = require("underscore");


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

var DateLibrary = {};

// Expose the public methods available.
DateLibrary.diff = diff;
DateLibrary.diffInMilliseconds = diffInMilliseconds;
DateLibrary.diffInSeconds = diffInSeconds;
DateLibrary.diffInMinutes = diffInMinutes;
DateLibrary.diffInHours = diffInHours;
DateLibrary.diffInDays = diffInDays;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
module.exports = exports =  DateLibrary;