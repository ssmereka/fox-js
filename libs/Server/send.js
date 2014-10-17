// ~> Library
// ~A Scott Smereka

/* Send
 * Library for handling sending information to 
 * a user or requestor.
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

/**
 * Constructor
 * Handles initalization of the send library.
 */
var Send = function(_fox) {
  // Handle parameters
  if(! _fox) {
    return console.log("Error loading foxjs module.");
  }
  fox = _fox;
  
  // Load internal modules.
  log = fox.log;
  
  // Load external modules.
  sanitize = require("sanitize-it");

  // Configure send instance.
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

/**
 * Store the response object in a private location
 * to be later accessed in a different route.
 */
var setResponse = function(obj, req, res, next) {
  setRequestHandled(req, true);
  res.locals.response = obj;
  if(next) {
    next();
  }
}

/**
 * Get the response object from the private store.
 */
var getResponse = function(res) {
  return res.locals.response;
}

var setRequestHandled = function(req, handled) {
  req.isHandled = (handled === undefined) ? true : handled;
}

var isRequestHandled = function(req) {
  return (req.isHandled) ? req.isHandled : false;
}

var isResponseSent = function(res) {
  return res.locals.isResponseSent;
}

var setIsResponseSent = function(res, value) {
  res.locals.isResponseSent = value;
}

/**
 * Send a response object to the requestor.
 */
var sendResponse = function(obj, req, res, next) {
  setRequestHandled(req, true);

  // Format the object into a response object.
  obj = createResponseObject(undefined, obj);
  
  // Update the response object.
  res.locals.response = obj;
  res.locals.isResponseSent = true;

  // Send a TEXT response.
  if(sanitize.isText(req)) {
    res.type('txt').send(JSON.stringify(obj));
  } else {
    // Default by returning json.
    res.json(obj);
  }
  next();
}

/** 
 * Create an error and send it in a response object to the requestor.
 */
var createAndSendError = function(errMessage, status, req, res, next) {
  errMessage = (errMessage) ? errMessage : "Unknown error occurred.";
  status = (status) ? status : 500;

  var err = new Error(errMessage);
  err["status"] = status;

  return this.sendError(err, req, res, next);
};

/**
 * Create an error object from an error message and status.
 */
var createError = function(errMessage, status) {
  errMessage = (errMessage) ? errMessage : "Unknown error occurred.";
  status = (status) ? status : 500;

  var err = new Error(errMessage);
  err["status"] = status;

  return err;
}

/**
 * Send an error in a response object to the requestor.
 */
var sendError = function(err, req, res, next, debug) {
  setRequestHandled(req, true);

  err = (err) ? err : new Error("Unknown error occurred.");
  err["status"] = (err["status"]) ? err["status"] : 500;

  // Create a response object.
  var obj = createResponseObject(err, undefined, debug);

  // If in debug mode, log the error.
  log.e(err, debug);
  log.e(err["stack"]);

  // Send a TEXT response.
  if(sanitize.isText(req)) {
    return res.type('txt').send(JSON.stringify(obj), err.status);
  }

  // Default to JSON.
  return res.send(obj, err.status);
};


/**
 * Create an object to show a request was successful.
 */
var createSuccessObject = function(success) {
  return {
    success: (success === undefined) ? true : success
  }
}

/**
 * Create an object to show a request was successful and
 * then send it.
 */
var createAndSendSuccessObject = function(success, req, res, next) {
  sendResponse(createSuccessObject(success), req, res, next);
}

/**
 * Make a json object pretty by formatting it
 * and adding HTML tags to give it syntax highlighting.
 */
function prettifyJson(obj) {
  return syntaxHighlight(JSON.stringify(obj, undefined, 4));
}



var sendEmail = function(addresses) {

}


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/**
 * Create a response object from any errors or objects that 
 * need to be returned to the caller.  This is meant to 
 * take a routes result and format it for a user.
 */
var createResponseObject = function(err, obj, debug) {
  var resObj = {};
  obj = (obj) ? obj : {};

  // If there is an error, set the error properties.
  if(err) {  
    // Set the error type and error message.
    if(Object.prototype.toString.call( err ) === '[object Array]') {
      resObj["errorType"] = "array";
      resObj["error"] = [];

      if( ! debug) {
        for(var x= 0; x < err.length; x++) {
          resObj["error"].push(err[x]["message"]);
        }
      } else {
        resObj["trace"] = [];
        for(var y= 0; y < err.length; y++) {
          resObj["error"].push(err[y]["message"]);
          resObj["trace"].push(err[y]["stack"]);
        }
      }
    } else {
      resObj["errorType"] = "string";
      resObj["error"] = err["message"];
      if(debug) {
        resObj["trace"] = err["stack"];
      }
    }

    // Set the response status based on the error status code.
    resObj["status"] = getStatus(err["status"]);

  } else {
    // Set the response status based on the status code of 200.
    resObj["status"] = getStatus(200);
  }

  // Set the response type to array or object.
  if(Object.prototype.toString.call( obj ) === '[object Array]') {
    resObj["responseType"] = "array";
  } else {
    resObj["responseType"] = "object";
  }

  // Set the response object
  resObj["response"] = obj;

  return resObj;
}

/**
 * Get the status string from a status code.
 */
var getStatus = function(code) {
  return code + " " + getStatusCodeString(code);
}

/**
 * Return the status string associated with a status code.
 * This follows the RFC spec:
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 */
var getStatusCodeString = function(code) {
  if( ! code) {
    return "undefined";
  }

  switch(code) {
    // 2xx Successful
    case 200: return "ok";
    case 201: return "created";
    case 202: return "accepted";
    case 203: return "non-authoritative information";
    case 205: return "reset content";
    case 206: return "partial content";
    
    // 3xx Redirection
    case 300: return "multiple choices";
    case 301: return "moved permanently";
    case 302: return "found";
    case 303: return "see other";
    case 304: return "not modified";
    case 305: return "use proxy";
    //case 306: return "unused";
    case 307: return "temporary redirect";
    
    // 4xx Client Error
    case 400: return "bad request";
    case 401: return "unauthorized";
    case 402: return "payment required";
    case 403: return "forbidden";
    case 404: return "not found";
    case 405: return "method not allowed";
    case 406: return "not acceptable";
    case 407: return "proxy authentication required";
    case 408: return "request timeout";
    case 409: return "conflict";
    case 410: return "gone";
    case 411: return "length required";
    case 412: return "precondition failed";
    case 413: return "request entity too large";
    case 414: return "request-uri too long";
    case 415: return "unsupported media type";
    case 416: return "requested range not satisfiable";
    case 417: return "expectation failed";
    
    // 5xx Server Error
    case 500: return "internal server error";
    case 501: return "not implemented";
    case 502: return "bad gateway";
    case 503: return "service unavailable";
    case 504: return "gateway timeout";
    case 505: return "http version not supported";

    default:  return "unknown";
  }
}

/**
 * Add HTML syntax highlighting to a json object.
 */
function syntaxHighlight(json) {
  if (typeof json != 'string') {
       json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Send.prototype.send = sendResponse;

Send.prototype.setResponse = setResponse;
Send.prototype.getResponse = getResponse;

Send.prototype.setRequestHandled = setRequestHandled;
Send.prototype.isRequestHandled = isRequestHandled;

Send.prototype.setIsResponseSent = setIsResponseSent;
Send.prototype.isResponseSent = isResponseSent;

Send.prototype.sendResponse = sendResponse;
Send.prototype.createAndSendError = createAndSendError;
Send.prototype.createError = createError;
Send.prototype.sendError = sendError;
Send.prototype.createResponseObject = createResponseObject;
Send.prototype.createSuccessObject = createSuccessObject;
Send.prototype.createAndSendSuccessObject = createAndSendSuccessObject;
Send.prototype.prettifyJson = prettifyJson;
Send.prototype.email = sendEmail;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Send;

// Reveal the public API.
exports = Send;