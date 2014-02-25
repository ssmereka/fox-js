// ~> Library
// ~A Scott Smereka

/* Merge
 * Library for combining two objects.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var fox,
    log;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Merge = function(_fox) {
  fox = _fox;
  log = fox.log;
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */


/* Merge Objects
 * Combine two object's attributes giving priority
 * to the first object's (obj1) attribute values.
 */
var priorityMerge = function(obj1, obj2) {
  for(var key in obj2) {
    if(obj1[key] === undefined)
      obj1[key] = obj2[key];
  }
  return obj1;
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Merge.prototype.priorityMerge = priorityMerge;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Merge;

// Reveal the public API.
exports = Merge;