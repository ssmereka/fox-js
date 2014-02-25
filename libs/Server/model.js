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
     merge,
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
  merge = fox.merge;
  auth = fox.authentication;
  
  // Load external modules.
  sanitize = require("sanitize-it");

  // Setup library based on config.
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


function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var sanitizeObject = function(obj, isSanitized) {
  isSanitized = (isSanitized === undefined) ? true : isSanitized;
  if(isSanitized && obj && obj["sanitize"]) {
    obj.sanitize();
  }
  return obj;
}

var sanitizeObjects = function(arry, isSanitized, allOrNone) {
  isSanitized = (isSanitized === undefined) ? true : isSanitized;
  if(isSanitized && arry) {
    for(var i = arry.length-1; i >=0; --i) {
      if(arry[i]["sanitize"]) {
        arry[i].sanitize();
      } else if(allOrNone) {
        return arry;
      }
    }
  }
  return arry;
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
  return loadById[Schema, queryObject, populateFields, populateSelects, populateModels, populateConditions] = function(req, res, next) {
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
          req.queryResult = obj;
        }
        return next();
      });
    } else {
      return next();
    }
  };
};


var load = function load(Schema, queryObject, opts) {
  return load[Schema, queryObject, opts] = function(req, res, next) {
    if(!queryObject) {   
      queryObject = {};
    }

    var sort = "";

    // Grab the request query object, removing auth tokens if they exist.
    var requestQuery = req.query;
    if(requestQuery["access_token"]) {
      delete requestQuery.access_token;
    }
    var query = merge.priorityMerge(requestQuery, queryObject);

    log.d("Query: " + JSON.stringify(query), debug);

    if(opts) {
      sort = (opts["sort"]) ? opts["sort"] : "";
    }
    Schema.find({}, function(err, obj) {
      if(err) {
        next(err);
      } else if( ! obj){
        log.w("Could not find schema object.  Query Object:", debug);
        log.w("\t" + query);
      } else {
        setQueryResult(obj, req, []);
      }
        return next();
    });
  };
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

/**
 * Add routes for CRUD commands to all schema objects.
 * Note that all models must contain CRUD methods either
 * by overriding them or by including the crud plugin.
 */
var enableCrudOnAllSchemas = function(_app, _db, _config) {
  db = _db;
  app = _app;
  config = _config;

  var defaultViewAuthMethod = auth.allowRolesOrHigher(auth.queryRoleByName(config.roles.defaultViewRole));
  var defaultEditAuthMethod = auth.allowRolesOrHigher(auth.queryRoleByName(config.roles.defaultEditRole));

  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        enableCrudOnSchema(key, defaultViewAuthMethod, defaultEditAuthMethod);
      }
    }
  }
}

/**
 * Add routes for creating, reading, updateing, and deleting instances of
 * a schema object.  It also protects the routes using default authentication
 * settings found in the config.
 */
var enableCrudOnSchema = function(schemaName, viewAuthMethod, editAuthMethod) {
  schema = db.model(schemaName);

  collectionName = schemaName.toLowerCase() + 's';

  viewAuthMethod = (! viewAuthMethod) ? viewAuthMethod : [];
  editAuthMethod = (! editAuthMethod) ? editAuthMethod : [];

  // Check if the sanitize method is available.
  var isSanitized = (verifyModelHasCrudMethod(schema, "sanitize"));

  // Get by ID.
  app.get('/'+collectionName+'/:id.:format', viewAuthMethod, loadById(schema, "id"), getRoute(isSanitized));

  // Get all
  app.get('/'+collectionName+'.:format', viewAuthMethod, load(schema, {}), getAllRoute(isSanitized));  //{ "sort": "creationDate"}

  // Update
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'/:id.:format', editAuthMethod, loadById(schema, "id"), updateRoute(isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the update CRUD route.");
  }

  // Create
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'.:format', editAuthMethod, createRoute(schema, isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the create CRUD route.");
  }

  // Delete
  if(verifyModelHasCrudMethod(schema, "delete")) {
    app.delete('/'+collectionName+'/:id.:format', editAuthMethod, loadById(schema, "id"), removeRoute);
  } else {
    log.e("Schema " + schemaName + " must implement the delete method to enable the delete CRUD route.");
  }

  log.i("CRUD enabled for the ".white +schemaName.cyan+" schema.".white, debug);
}

/**
 * CRUD plugin for mongoose schema objects. When enabled, adds 
 * methods for creating, reading, updating, and deleting schema
 * object instances.  These methods are required for automatic
 * CRUD routes.  All methods added are completely overridable 
 * by declaring the method before enabling the plugin.
 */
var crudPlugin = function(Schema, options) {
  // If update method is not defined, add it.
  if( ! Schema.methods["update"]) {
    Schema.methods.update = createUpdateMethod(Schema);
  }

  // If delete method is not defined, add it.
  if( ! Schema.methods["delete"]) {
    Schema.methods.delete = createRemoveMethod;
  }
}

/**
 * Verify a schema contains all the CRUD methods.
 * @Schema is the schema to evaluate.
 */
var verifyModelHasAllCrudMethods = function(Schema) {
  var methods = ['update', 'delete'];

  for(var i = methods.length-1; i >= 0; --i) {
    if( ! verifyModelHasCrudMethods(Schema, methods[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Verify a schema has a named CRUD method.
 *
 * @Schema is the schema object to evaluate.
 * @method is the method name to check for.
 * @next is an optional callback method.
 */
var verifyModelHasCrudMethod = function(Schema, method, next) {
  if( ! method || ! Schema || ! Schema.schema.methods[method]) {
    err = new Error("Schema must implement the method '"+method+"' to enable "+method+" functionality.");
    err.status = 500;
    if(next) {
      return next(err)
    }
    log.e(err, debug);
    return false;
  } else if(next) {
    next();
  } else {
    return true;
  }
}


/* ************************************************** *
 * ******************** CRUD - CREATE
 * ************************************************** */

/**
 * Creates a single object of a Schema type using the 
 * request body fields to populate it. Then sets the
 * response object to the created object.  This will
 * return a route method, meaning a function that accepts 
 * request, response, and next as parameters.
 *
 * @Schema is a mongoose schema object.
 * @isSanitized is a flag that, when true or undefined, 
 * triggers the return object to be sanitized, if possible.
 */
var createRoute = function(Schema, isSanitized) {
  return function(req, res, next) {
    // Create a new object of the schema type.
    var obj = new Schema();

    // Use the schema's update method to load in the properties in the request body.
    obj.update(req.body, (req.user) ? req.user._id : undefined, function(err, obj) {
      // If an error occurred, pass it on.
      if(err){
        return next(err);
      }

      // Remove private properties in object.
      obj = sanitizeObject(obj, isSanitized);

      // Set the response object to be returned to the caller.
      sender.setResponse(obj, req, res, next);
    });
  };
}


/* ************************************************** *
 * ******************** CRUD - READ
 * ************************************************** */

/**
 * Retrieves and sanitizes a single object found by a 
 * previously run query.  Then sets the response object.
 * This will return a route method, meaning a function 
 * that accepts request, response, and next as parameters.
 *
 * @isSanitized is a flag that, when true or undefined, 
 * triggers the return object to be sanitized, if possible.
 */
var getRoute = function(isSanitized) {
  return function(req, res, next) {
    // Get the object from the query result.
    var obj = getQueryResult(req);

    // If there wasn't a result, move on.
    if( ! obj) {
      return next();
    }

    // Remove private properties in object.
    obj = sanitizeObject(obj, isSanitized);

    // Set the response object to be returned to the caller.
    sender.setResponse(obj, req, res, next);
  };
}

/**
 * Retrieves and sanitizes multiple objects found by a 
 * previously run query.  Then sets the response object.
 * This will return a route method, meaning a function 
 * that accepts request, response, and next as parameters.
 *
 * @isSanitized is a flag that, when true or undefined, 
 * triggers the return object to be sanitized, if possible.
 */
var getAllRoute = function(isSanitized) {
  return function(req, res, next) {
    // Get the array from the query result.
    var objs = getQueryResult(req);

    // If there wasn't a result, move on.
    if( ! objs) {
      return next();
    }

    // Remove private properties in object.
    obj = sanitizeObjects(objs, isSanitized);

    // Set the response object to be returned to the caller.
    sender.setResponse(objs, req, res, next);
  };
}


/* ************************************************** *
 * ******************** CRUD - UPDATE
 * ************************************************** */

/**
 * Updates a single object from a previously run query
 * with fields values from the request body.  Then sets
 * the response object to the updated object.  This will
 * return a route method, meaning a function that accepts 
 * request, response, and next as parameters.
 *
 * @isSanitized is a flag that, when true or undefined, 
 * triggers the return object to be sanitized, if possible.
 */
var updateRoute = function(isSanitized) {
  return function(req, res, next) {
    // Retrieve the object to update from the query result.
    var obj = req.queryResult;                             

    // If there wasn't a result, move on.         
    if( ! obj) {
      return next();                            
    }

    // Update the object using the request body and currently authenticated user.
    obj.update(req.body, (req.user) ? req.user._id : undefined, function(err, obj) {  
      // If an error occurred, pass it on.
      if(err) {
        return next(err);
      }

      // Remove private properties in the object.
      obj = sanitizeObject(obj, isSanitized);

      // Set the response object to the updated object.
      sender.setResponse(obj, req, res, next);                       
    });
  };
}

/**
 * Create and return a method that, when attached to a 
 * mongoose schema, will allow a schema object instance 
 * to update itself.
 *
 * Note:  This creates a list of validation methods
 * based off the schema's property types.  These methods
 * are passed into the update method to dynmically validate
 * a schema object instance.
 */
var createUpdateMethod = function(Schema) {
  // List of validation methods for the schema object.
  var updateMethods = [];

  // Loop through each property in the schema 
  // and create a validation method.
  for(var key in Schema.paths) {
    if(Schema.paths.hasOwnProperty(key)) {
      updateMethods.push(makeUpdatePropertyMethod(key, Schema.paths[key]["instance"]));
    }
  }

  return update(updateMethods);
}

/**
 * Update an object's properties based based user input.
 * The update method validates user input by looping 
 * through each validation method in the updateMethod list.
 * Finally the object is saved if changes were made.
 */
var update = function(updateMethods) {
  return function(newObj, userId, next) {
    // Store a reference to the current object
    var obj = this;

    // Loop through each validation method updating the 
    // current object when the user input is valid.
    for(var i = updateMethods.length-1; i >= 0; --i) {
      obj = updateMethods[i](obj, newObj);
    }

    // Save the object and return the result to the callback.
    this.save(next);
  };
}

/**
 * Create a method to update a schema's property 
 * based on the property type (boolean, string, etc).
 * This method validates user input and should perform
 * strong checking.  If the user input is invalid, then
 * the schema object remains unaffected.  Finally the
 * (possibly) updated object is returned.
 *
 * @key is the object's property to be validated.
 * @type is the type of the object's property to be validated.
 *
 * @curObj is the schema object to be updated.
 * @newObj is the user input the schema object will be updated against.
 */
function makeUpdatePropertyMethod(key, type) {
  return function(curObj, newObj) {

    // If the update object contains the property "key",
    // then check if its value is valid based on the property type.
    if(newObj && newObj[key] && curObj) {
      var value = undefined;
      
      switch(type) {
        case 'Array':
          value = sanitize.array(newObj[key]);
          break;
        case 'Boolean': 
          value = sanitize.boolean(newObj[key]);
          break;
        case 'Buffer':
          //TODO: Sanitize a buffer.
          value = newObj[key];
          break;
        case 'Date': 
          value = sanitize.date(newObj[key]);
          break;
        case 'Mixed':
          //TODO: Sanitize mixed.
          value = newObj[key];
          break;
        case 'Number': 
          value = sanitize.number(newObj[key]);
          break;
        case 'ObjectID':
          value = sanitize.objectId(newObj[key]);
          break;
        case 'String': 
          value = sanitize.string(newObj[key]);
          break;
        default: 
          log.i("Processing '"+key+": "+newObj[key]+"'");
          log.e("Mongoose property type is unknown: " + type);
          // TODO: For now just assume undefined is a date, because mongoose is dumb:
          value = sanitize.date(newObj[key]);
          break;
      }

      // If the value is valid, update the current schema object
      // with the new value from the update object.
      if(value !== undefined) {
        curObj[key] = value;
      }
    }

    // Return the possibly updated object.
    return curObj;
  }
}


/* ************************************************** *
 * ******************** CRUD - DELETE
 * ************************************************** */

/**
 * Deletes an object found by a previously run query.
 * Then sets the response object with the result of the
 * delete. This will return a route method, meaning a function 
 * that accepts request, response, and next as parameters.
 */
var removeRoute = function(req, res, next) {
  // Get the object from the query result.
  var obj = getQueryResult(req);

  // If there wasn't a result, move on.
  if( ! obj) {
    return next();
  }

  obj.delete((req.user) ? req.user._id : undefined, function(err) {
    // If an error occurred, pass it on.
    if(err) {
      return next(err);
    }

    // Set the response object to be returned to the caller.
    sender.setResponse(sender.createSuccessObject(true), req, res, next);
  });
}

/**
 * Create and return a method that, when attached to a 
 * mongoose schema, will allow a schema object instance 
 * to delete itself.
 */
var createRemoveMethod = function(userId, next) {
  return remove(this, userId, next);
}

/**
 * Delete an object from the database and track
 * the user who did it.
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
Model.prototype.crudPlugin = crudPlugin; 

// CRUD - Create 
Model.prototype.createRoute = createRoute;

// CRUD - Read
Model.prototype.getRoute = getRoute;
Model.prototype.getAllRoute = getAllRoute;

// CRUD - UPDATE
Model.prototype.update = update;
Model.prototype.updateRoute = updateRoute;
Model.prototype.createUpdateMethod = createUpdateMethod;

// CRUD - Delete
Model.prototype.remove = remove;
Model.prototype.removeRoute = removeRoute;
Model.prototype.createRemoveMethod = createRemoveMethod;



/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Model;

// Reveal the public API.
exports = Model;