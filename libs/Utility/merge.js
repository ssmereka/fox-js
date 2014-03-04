// ~> Library
// ~A Scott Smereka

/* Merge
 * Library for combining two objects.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,
    fox,
    log,
    sanitize,
    trace = false;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Merge = function(_fox) {
  // Handle parameters.
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  // Load external modules.
  sanitize = require("sanitize-it");

  // Configure merge instance.
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



/**
 * Merge two objects attributes into a single object.
 * This will do a deep merge, meaning that if both objects 
 * contain an attribute that is also an object, then they 
 * will be merged as well.  This will give all priorty to
 * the first object, meaning if both objects have the same 
 * attribute, the first object's value will be preserved
 * while the second-object's value is not.
 */
var deepPriorityMerge = function(obj1, obj2, done, depth, next) {
  depth = (depth) ? depth : 0;
  var result = {};

  // Loop through all the attributes in the first object.
  for(var key in obj1) {
    
    // If an attribute is also an object and not an array.
    if(obj1.hasOwnProperty(key) && obj1[key] !== null && typeof obj1[key] === 'object' && ! obj1[key] instanceof Array) {     
      
      // And obj2's attribute with the same key is also an object.
      if(obj2.hasOwnProperty(key) && obj2[key] !== null && typeof obj2[key] === 'object') {
        // recurse and merge those objects as well.
        depth++;
        deepPriorityMerge(obj1[key], obj2[key], done, depth, function(err, obj){
          result[key] = obj;
          depth--;
        });
        //result[key] = deepMergeObjects(obj1[key], obj2[key], depth++, next);
      } else {
        // Otherwise store the object in the result.
        result[key] = obj1[key];
      }
    } else {
      // If the attribute is not an object, store it in the results.
      result[key] = obj1[key];
    }
  }

  // Process queue

  // Loop through and add all the attributes in object 2 that
  // are not already in object 1.
  for(i in obj2) {

    // If the attribute is already in the result, skip it.
    if(i in result) {
      continue;
    }

    // Add the new attribute to the result object.
    result[i] = obj2[i];
  }

  if(depth > 0 && next) {
    return next(undefined, result);
  } else if(done) {
    return done(undefined, result);
  } else {
    console.log("Hmmm something has gone wrong...");
    //console.log(result);
  }
}



/**
 * Merge two objects attributes into a single object.
 * This will do a deep merge, meaning that if both objects 
 * contain an attribute that is also an object, then they 
 * will be merged as well.  This will give all priorty to
 * the first object, meaning if both objects have the same 
 * attribute, the first object's value will be preserved
 * while the second-object's value is not.
 */
var deepPriorityMergeSync = function(obj1, obj2) {
  var result = {};

  // Loop through all the attributes in the first object.
  for(var key in obj1) {
    
    // If obj1's property is an object and not an array
    if(obj1.hasOwnProperty(key) && obj1[key] !== null && typeof obj1[key] === 'object' && ! (obj1[key] instanceof Array)) {     
      
      // And obj2's attribute with the same key is also an object.
      if(obj2.hasOwnProperty(key) && obj2[key] !== null && typeof obj2[key] === 'object') {
        // recurse and merge those objects as well.
        result[key] = deepPriorityMergeSync(obj1[key], obj2[key]);
      } else {
        // Otherwise store the object in the result.
        result[key] = obj1[key];
      }
    } else {
      // If the attribute is not an object, store it in the results.
      result[key] = obj1[key];
    }
  }

  // Loop through and add all the attributes in object 2 that
  // are not already in object 1.
  for(i in obj2) {
    if(obj2.hasOwnProperty(i)) {
      // If the attribute is already in the result, skip it.
      if(i in result) {
        continue;
      }

      // Add the new attribute to the result object.
      result[i] = obj2[i];
    }
  }

  return result;
}




/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Merge.prototype.priorityMerge = priorityMerge;
Merge.prototype.deepPriorityMergeSync = deepPriorityMergeSync;
Merge.prototype.deepPriorityMerge = deepPriorityMerge;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Merge;

// Reveal the public API.
exports = Merge;