// ~> Library
// ~A Scott Smereka

/* Date
 * Library for handling dates.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var fox,
    log;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var DateLibrary = function(_fox) {
  fox = _fox;
  log = fox.log;
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Returns the difference between two dates.
 * A Postitive number is a date in the future where negative is in the past.
 */
var diff = function(date1, date2) {
  if( ! (date1 instanceof Date) || ! (date2 instanceof Date)) {
    return undefined
  }
  
  return (date1.getTime() - date2.getTime());
};

/**
 * Get the difference of two dates in milliseconds.
 */
var diffInMilliseconds = function(date1, date2) {
  return diffMilliseconds[date1, date2] || (diffMilliseconds[date1, date2] = function(req, res, next) {
    return diff(date1, date2);
  });
};

/**
 * Get the difference of two dates in seconds.
 */
var diffInSeconds = function(date1, date2) {
  return diffSeconds[date1, date2] || (diffSeconds[date1, date2] = function(req, res, next) {
    return diff(date1, date2) / 1000;
  });
};

/**
 * Get the difference of two dates in minutes.
 */
var diffInMinutes = function(date1, date2) {
  return diffMinutes[date1, date2] || (diffMinutes[date1, date2] = function(req, res, next) {
    return diff(date1, date2) / (1000 * 60);
  });
};

/**
 * Get the difference of two dates in hours.
 */
var diffInHours = function(date1, date2) {
  return diffHours[date1, date2] || (diffHours[date1, date2] = function(req, res, next) {
    return diff(date1, date2) / (1000 * 60 * 60);
  });
};

/**
 * Get the difference of two dates in days.
 */
var diffInDays = function(date1, date2) {
  return diffDays[date1, date2] || (diffDays[date1, date2] = function(req, res, next) {
    return diff(date1, date2) / (1000 * 60 * 60 * 24);
  });
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