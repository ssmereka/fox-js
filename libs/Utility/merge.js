// ~> Library
// ~A Scott Smereka

/* Merge
 * Library for combining two objects.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var _ = require("underscore");


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Combine two object's attributes giving priority
 * to the first object's properties.  If either parameter
 * is undefined or not an object, then the other valid 
 * object will be returned.  If both parameters are
 * not valid objects, then undefined will be returned.
 * @param a Object to be merged with priority.
 * @param b Other object to be merged into param 'a'.
 */
var priorityMerge = function(a, b) {
  // If 'a' or 'b' are a function they can't be merged.
  if(_.isFunction(a) || _.isFunction(b)) {
    return undefined;
  }

  // Check if both 'a' and 'b' are valid objects.
  if(a === undefined) {
    if(b === undefined || ! _.isObject(b)) {
      return undefined;  // 'a' is undefined and 'b' is not valid
    } else {
      return b; // 'a' is undefined, but 'b' is valid.
    }
  } else if( ! _.isObject(a)) {
    if(b === undefined || ! _.isObject(b)) {
      return undefined;  // both 'a' and 'b' are not invalid.
    } else {
      return b;  // 'a' is not a valid object, but 'b' is.
    }
  } else {
    if( b === undefined || ! _.isObject(b)) {
      return a;  // 'a' is valid, but 'b' is not.
    }
  }

  // Merge new values of 'b' into 'a'
  for(var i in b) {
    if(a[i] === undefined) {
      a[i] = b[i];
    }
  }

  // Return the merged 'a' object.
  return a;
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

var MergeLibrary = {}

// Expose the public methods available.
MergeLibrary.priorityMerge = priorityMerge;
MergeLibrary.deepPriorityMergeSync = deepPriorityMergeSync;
MergeLibrary.deepPriorityMerge = deepPriorityMerge;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = MergeLibrary;