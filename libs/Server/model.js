// ~> Library
// ~A Scott Smereka

/* Model
 * Library for handling common tasks for a MongoDB models.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

 var fox,
     log,
     auth,
     sanitize,
     app,
     db,
     config,
     debug = false;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Handles initalization of the model library.
 */
var Model = function(_fox) {
  if(! _fox) {
    return console.log("Model Module: Error loading foxjs module.");
  }

  // Load local libraries.
  fox = _fox;
  log = fox.log;
  auth = fox.authentication;
  
  // Load external modules.
  sanitize = require("sanitize-it");

  // Setup Model based on config.
  handleConfig(fox["config"]);
}

/**
 * Setup the send module based on options available in the
 * configuration object.
 */
var handleConfig = function(config) {
  if(config) {
    debug = (config["systemDebug"]) ? config["systemDebug"] : debug;
  }
}


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/* Merge Objects
 * Combine two object's attributes giving priority
 * to the first object's (obj1) attribute values.
 */
function mergeObjects(obj1, obj2) {
  for(var key in obj2) {
    if(obj1[key] === undefined)
      obj1[key] = obj2[key];
  }
  return obj1;
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Set the query result so it can be used by later routes.
 */
var setQueryResult = function(obj, req, defaultValue) {
  if(req) {
    req.queryResult = (obj === undefined) ? defaultValue : obj;
  } else {
    log.e("Cannot set query result, request object is null.");
  }
}

/**
 * Get the query result from a previous lookup.
 */
var getQueryResult = function(req, defaultValue) {
  return (req && req.queryResult !== undefined) ? req.queryResult : defaultValue;
}


var loadById = function(Schema, queryObject, populateFields, populateSelects, populateModels, populateConditions) {
  return loadById[Schema, queryObject, populateFields, populateSelects, populateModels, populateConditions] || (loadById[Schema, queryObject, populateFields, populateSelects, populateModels, populateConditions] = function(req, res, next) {
    if(req.params[queryObject]) {
      
      populateFields     = (populateFields)     ? populateFields     : "";
      populateSelects    = (populateSelects)    ? populateSelects    : "";
      populateModels     = (populateModels)     ? populateModels     : "";
      populateConditions = (populateConditions) ? populateConditions : "";

      Schema.findById(req.params[queryObject]).populate(populateFields, populateSelects, populateModels, populateConditions).exec(function(err, obj) {
        if(err) {
          console.log(err);
          next(err);
        } else if( ! obj){
          log.w("Could not find schema object.  Query Object:", debug);
          log.w("\t" + queryObject);
        } else {
          console.log("Found result: ");
          req.queryResult = obj;
          console.log(req.queryResult);
        }
        return next();
      });
    } else {
      return next();
    }
  });
};


var load = function load(Schema, queryObject, opts) {
  if(!queryObject) {
    queryObject = {};
  }
  return load[Schema, queryObject, opts] || (load[Schema, queryObject, opts] = function(req, res, next) {

    var sort = "";

    // Grab the request query object, removing auth tokens if they exist.
    var requestQuery = req.query;
    if(requestQuery["access_token"]) {
      delete requestQuery.access_token;
    }
    var query = mergeObjects(requestQuery, queryObject);

    log.d("Query: " + JSON.stringify(query), debug);

    if(opts) {
      sort = (opts["sort"]) ? opts["sort"] : "";
    }

    Schema.find(query).sort(sort).exec(function(err, obj) {
      if(err) {
        next(err);
      } else if( ! obj){
        log.w("Could not find schema object.  Query Object:", debug);
        log.w("\t" + query);
      } else {
        req.queryResult = obj;
      }
        return next();
    });
  });
};















var enableCrud = function(_app, _db, _config) {
  app = (_app) ? _app : app;
  db = (_db) ? _db : db;
  config = (_config) ? _config : config;

  if(! app || ! db || ! config) {
    return false;
  }

  //enableCrudForSchema(schemaName);

}

/*var enableCrudOnSchemas = function(schemas) {
  for(var i = schemas.length-1; i >= 0; --i) {
    enableCrudForSchema(schemas[i])
  }
} */



/* ************************************************** *
 * ******************** CRUD
 * ************************************************** */

var enableCrudOnAllSchemas = function(_app, _db, _config) {
  db = _db;
  app = _app;
  config = _config;

  var defaultViewAuthMethod = auth.allowRolesOrHigher(auth.queryRoleByName(config.roles.defaultViewRole));
  var defaultEditAuthMethod = auth.allowRolesOrHigher(auth.queryRoleByName(config.roles.defaultEditRole));

  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        enableSchemaCrud(key, defaultViewAuthMethod, defaultEditAuthMethod);
        break;
      }
    }
  }
}

var enableSchemaCrud = function(schemaName, viewAuthMethod, editAuthMethod) {
  schema = db.model(schemaName);
  collectionName = schemaName.toLowerCase() + 's';

  viewAuthMethod = (! viewAuthMethod) ? viewAuthMethod : [];
  editAuthMethod = (! editAuthMethod) ? editAuthMethod : [];

  console.log(schema.schema);

  // Get an access token by ID.
  app.get('/'+collectionName+'/:id.:format', viewAuthMethod, loadById(schema, "id"), getRoute(schema));

  // Get all access tokens.
  app.get('/'+collectionName+'.:format', viewAuthMethod, load(schema, {}, { "sort": "creationDate"}), getAllRoute(schema));

  // Update an access token.
  app.post('/'+collectionName+'/:id.:format', editAuthMethod, loadById(schema, "id"), updateRoute(schema));

  // Create an access token.
  app.post('/'+collectionName+'.:format', editAuthMethod, createRoute(schema));

  // Delete an access token.
  app.delete('/'+collectionName+'/:id.:format', editAuthMethod, loadById(schema, "id"), removeRoute(schema));

  log.i("CRUD enabled for the ".white +schemaName.cyan+" schema.".white, debug);
}


/* ************************************************** *
 * ******************** CRUD - CREATE
 * ************************************************** */

var createRoute = function(Schema, isSanitize) {
  return createRoute[Schema, isSanitize] || (createRoute[Schema, isSanitize] = function(req, res, next) {
    var obj = new Schema();
    obj.update(req.body, (req.user) ? req.user._id : undefined, function(err, obj) {  // Update the new user object with the values from the request body.  Also, if the person creating the new user is identified, send that along in the request.
      if(err) next(err);

      if(obj && isSanitize === undefined || isSanitize) {
        obj.sanitize();
      }

      sender.setResponse(obj, req, res, next);                                   // Handles the request by sending back the appropriate response, if we havn't already.
    });
  });
}

 /* ************************************************** *
 * ******************** CRUD - READ
 * ************************************************** */

var getRoute = function(Schema, isSanitize) {
  return getRoute[Schema, isSanitize] || (getRoute[Schema, isSanitize] = function(req, res, next) {
    // Get the object from the query result.
    var obj = getQueryResult(req);

    // If there wasn't a result, move on.
    if( ! obj) {
      return next();
    }

    if(isSanitize === undefined || isSanitize) {
      obj.sanitize();
    }

    // Set the response object to be returned to the caller.
    sender.setResponse(obj, req, res, next);
  })
}

var getAllRoute = function(Schema, isSanitize) {
  return getAllRoute[Schema, isSanitize] || (getAllRoute[Schema, isSanitize] = function(req, res, next) {
    // Get the object from the query result.
    var objs = req.queryResult;

    // If there wasn't a result, move on.
    if( ! req.queryResult) {
      return next();
    }

    // Sanitize the access token information before sending it back.
    if(isSanitize === undefined || isSanitize) {
      for(var i = 0; i < objs.length; i++) {
        objs[i] = objs[i].sanitize();
      }
    }

    // Set the response object to be returned to the caller.
    sender.setResponse(objs, req, res, next);
  });
}

/* ************************************************** *
 * ******************** CRUD - UPDATE
 * ************************************************** */


var update = function update(obj, currentObject, userId, isUpdated, next) {
    var now   = Date.now(),
        value = undefined;

    // Check if any changes were made to the object.
    // If there were not, then return, we are done here.
    if( ! isUpdated) {
      if(next !== undefined) {
        return next(undefined, true);
      }
      return true;
    }

    // check for a valid update object.
    if( ! obj) {
      var err = new Error('Cannot update the schema object because the first parameter "obj" is not valid.')
      err.status = 500;

      // If a callback was supplied, then pass the error on.
      if(next !== undefined) {
        return next(err);
      }
      
      // Otherwise just print the error.
      return log.e(err);
    }

    // Update the last updated by attribute with the parameter object's
    // information or the userId parameter.  If neither is present, then
    // set the value to undefined because we don't know who updated it last.
    value = sanitize.objectId(obj['lastUpdatedBy']);
    currentObject['lastUpdatedBy'] = (value) ? value : sanitize.objectId(userId);
    
    // Update the last updated date and time with the parameter object's
    // informaiton or the time this function was called.
    value = sanitize.objectId(obj['lastUpdated']);
    currentObject['lastUpdated'] = (value) ? value : now;

    currentObject.save(function(err, currentObject) {

      // If the current object was not returned,
      // and there was no error, then create a generic error.
      if(! currentObject && ! err) {
        var err = new Error('There was a problem saving an updated object.');
        err.status = 500;
      }

      // If there were any errors, then return them or log them.
      if(err) {
        if(next !== undefined) {
          return next(err);
        }
        return log.e(err);
      }

      // Upon success, call the next function if we can.
      if(next !== undefined) {
        next(undefined, currentObject);
      }
    });
  //});
};




var updateRoute = function(Schema, isSanitize) {
  return updateRoute[Schema, isSanitize] || (updateRoute[Schema, isSanitize] = function(req, res, next) {
    var obj = req.queryResult;                                      // Get the acess token object queried from the url's userId paramter.
    if( ! req.queryResult) return next();                            // If the user object is blank, then the requested user was not found and we cannot handle the request here, so move along.

    obj.update(req.body, (req.user) ? req.user._id : undefined, function(err, obj) {  // Update the user object with the values from the request body.  Also, if the person updating the user is identified, send that along in the request.
      if(err) next(err);

      if(isSanitize === undefined || isSanitize) {
        obj.sanitize();
      }

      sender.setResponse(obj, req, res, next);                       // Handles the request by sending back the appropriate response, if we havn't already.
    });
  });
}

/* ************************************************** *
 * ******************** CRUD - DELETE
 * ************************************************** */

/**
 * Remove an schema object from the database.
 */
var remove = function(obj, userId, next) {
  obj.remove(function(err) {
    if(next) {
      next(err);
    } else if(err) {
      log.e(err, debug);
    }
  });
}

/**
 * Route that removes a schema object from the 
 * database and returns the result to the caller.
 */
var removeRoute = function(Schema) {
  return removeRoute[Schema] || (removeRoute[Schema] = function(req, res, next) {
    var obj = getQueryResult(req);                                      // Get the user object queried from the url's userId paramter.
    if( ! obj) return next();                            // If the user object is blank, then the requested user was not found and we cannot handle the request here, so move along.

    var deleteCallback = function(err) {
      if(err) {
        return next(err);
      }
      sender.setResponse(sender.createSuccessObject(true), req, res, next);                       // Handles the request by sending back the appropriate response, if we havn't already.   
    }

    if( ! Schema.schema.methods["delete"]) {
      remove(obj, (req.user) ? req.user._id : undefined, deleteCallback);
    } else {
      obj.delete((req.user) ? req.user._id : undefined, deleteCallback);
    }
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Model.prototype.load = load;
Model.prototype.update = update;
Model.prototype.loadById = loadById;


// CRUD
Model.prototype.enableCrud = enableCrud;
Model.prototype.enableCrudOnAllSchemas = enableCrudOnAllSchemas; 

// CRUD - Create 
Model.prototype.createRoute = createRoute;

// CRUD - Read
Model.prototype.getRoute = getRoute;
Model.prototype.getAllRoute = getAllRoute;

// CRUD - UPDATE
Model.prototype.updateRoute = updateRoute;

// CRUD - Delete
Model.prototype.removeRoute = removeRoute;
Model.prototype.remove = remove;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Model;

// Reveal the public API.
exports = Model;