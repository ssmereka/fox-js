// ~> Library
// ~A Scott Smereka

/* Request
 * Library for handling and simplifying requests.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var debug = false,
    fox,
    log,
    sanitize,
    trace = false,
    url;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Handles initalization of the library.
 */
var Request = function(_fox) {
  // Handle parameters.
  if(! _fox) {
    return console.log("Error loading foxjs module.");
  }
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  // Load external modules.
  sanitize = require("sanitize-it");
  url = require("url");

  // Configure request instance.
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
 * ******************** Private API Methods
 * ************************************************** */

var requireParameters = function(obj) {
  return requireParameters[obj] || (requireParameters[obj] = function(req, res, next) {
    var queryString = url.parse(req.url, true).query;

    if( ! req.body) {
      req.body = {};
    }
    for (var key in obj) {
      if( ! obj.hasOwnProperty(key)) {
        continue;
      } else if(req.body[key]) {
        //continue;
      } else if(req.params[key]) {
        //req.body[key] = req.params[key];
      } else if(queryString[key]) {
        //req.body[key] = queryString[key];
      } else {
        var err = new Error("Missing the required '"+key+"' parameter.");
        err.status = 400;
        return next(err);
      }
    }
  });
}


var joinAndRequireParameters = function(obj, location, app) {
  return joinAndRequireParameters[obj, location, app] || (joinAndRequireParameters[obj, location, app] = function(req, res, next) {
    var queryString = url.parse(req.url, true).query;
    location = (location) ? location.toLowerCase() : "body";
    var newObj = {};

    req.body = (req.body) ? req.body : {};
    req.params = (req.params) ? req.params : {};

    for (var key in obj) {
      if( ! obj.hasOwnProperty(key)) {
        continue;
      } else if(req.body[key]) {
        newObj[key] = req.body[key];
      } else if(req.params[key]) {
        newObj[key] = req.params[key];
      } else if(queryString[key]) {
        newObj[key] = queryString[key];
      } else {
        var err = new Error("Missing the required '"+key+"' parameter.");
        err.status = 400;
        return next(err);
      }
    }

    switch(location) {
      default:
      case "body":
        req.body = mergeObjects(newObj, req.body);
        break;

      case "params":
        req.params = mergeObjects(newObj, req.params);
        break;

      case "app.local.params":
        app.local.params = newObj;
        break;
    }
    next();
  });
}

/* Merge Objects
 * Combine two object's attributes giving priority
 * to the first object's (obj1) attribute values.
 */
var mergeObjects = function (obj1, obj2) {
  for(var key in obj2) {
    if(obj2.hasOwnProperty(key) && obj1[key] === undefined) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}


var joinParameters = function(location, app) {
  return joinParameters[location, app] || (joinParameters[location, app] = function(req, res, next) {
    location = (location) ? location.toLowerCase() : "app.local.params";
    //app.local.params = {};
    var obj = {};
    var queryString = url.parse(req.url, true).query;
    
    if(req.body) {
      for(var key in req.body) {
        if(req.body.hasOwnProperty(key)) {
          obj[key] =  req.body[key];
        }
      }
    }

    if(req.params) {
      for(var key in req.params) {
        if(req.params.hasOwnProperty(key)) {
          obj[key] =  req.params[key];
        }
      }
    }

    if(queryString) {
      for(var key in queryString) {
        if(queryString(key)) {
          obj[key] =  queryString[key];
        }
      }
    }

    switch(location) {
      case "params":
        req.params = obj;
        break;
      case "body":
        req.body = obj;
        break;
      default:
      case "app.local.params":
        app.local.params = obj;
        break;
    }

    next();
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Request.prototype.requireParameters = requireParameters;
Request.prototype.joinParameters = joinParameters;
Request.prototype.joinAndRequireParameters = joinAndRequireParameters;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Request;

// Reveal the public API.
exports = Request;