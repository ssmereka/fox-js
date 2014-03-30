// ~> Library
// ~A Scott Smereka

/* Model
 * Library for handling common tasks for a MongoDB models.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var app,
    auth,
    config,
    db,
    debug = false,
    fox,
    log,
    merge,
    sanitize,
    sender,
    trace = false,
    traceHeader = "Model Library";


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
  fox     = _fox;
  auth    = fox.authentication;
  log     = fox.log;
  merge   = fox.merge;
  sender  = fox.send;
  
  // Load external modules.
  sanitize = require("sanitize-it");

  // Setup library based on config.
  handleConfig(fox["config"]);

  log.t(traceHeader, "Created new instance.", trace);
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
 * ******************** Private Methods
 * ************************************************** */

/**
 * Sanitize an object by executing its sanitize() method.
 * If the object is undefined, does not have a sanitize
 * method, or isSanitized is false then the object will 
 * be returned unaltered.
 */
var sanitizeObject = function(obj, isSanitized) {
  isSanitized = (isSanitized === undefined) ? true : isSanitized;
  if(isSanitized && obj && obj["sanitize"]) {
    obj.sanitize();
  }
  return obj;
}

/**
 * Sanitize an array by executing each object's 
 * sanitize() method.  If an object is undefined, does 
 * not have a sanitize method, or isSanitized is false 
 * then the object be unaltered.  The entire array is 
 * returned after each object is processed.
 */
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
 * @obj is the query result object.
 * @req is the request object.
 * @defaultValue is the value to assign to the query result
 * if the obj parameter is invalid.
 */
var setQueryResult = function(obj, req, defaultValue, next) {
  if(req) {
    req.queryResult = (obj === undefined) ? defaultValue : obj;
  } else {
    log.e("Cannot set query result, request object is null.");
  }
  if(next) {
    next();
  }
}

/**
 * Get the query result from a previous query.
 * @req is the request object.
 * @defaultValue is the value to return if the query result
 * is undefined or invalid.
 */
var getQueryResult = function(req, defaultValue) {
  return (req && req.queryResult !== undefined) ? req.queryResult : defaultValue;
}

var isCrudQueryHandled = function(req) {
  return (req && req.isCrudQueryHandled);
}

var setCrudQueryHandled = function(req, value) {
  if(req) {
    req.isCrudQueryHandled = (value !== undefined) ? value : true;
  }
}

var isCrudRequestHandled = function(req) {
  return (req && req.isCrudRequestHandled);
}

var setCrudRequestHandled = function(req, value) {
  if(req) {
    req.isCrudRequestHandled = (value !== undefined) ? value : true;
  }
}

/**
 * Route method to query by ID for a schema object and store the result
 * in the query result for use by later routes.
 *
 * @Schema is the schema objects to query.
 * @param is the ID parameter name in the request.
 * @populateFields is a list of fields to populate.
 * @populateSelects is the mongoose populate selects parameter.
 * @populateModels is the mongoose populate models parameter.
 * @populateConditions is the mongoose populate conditions parameter.
 */
var loadById = function(Schema, param, populateFields, populateSelects, populateModels, populateConditions, overwrite) {
  return function(req, res, next) {
    // Check if the CRUD query has already been handled,
    // don't perform a query on an already handled route.
    if(isCrudQueryHandled(req)) {
      log.t(traceHeader, "LoadById: CRUD load route is already handled, skipping this route method.", trace);
      return next();
    }

    // Don't overwrite queries if the overwrite 
    //has been set to false
    if( ! overwrite && getQueryResult(req) !== undefined) {
      //console.log("LoadById: Don't overwrite");
      return next();
    }

    // Check if the parameter exists in the request.
    if(req.params[param]) {
      
      // If we are evaluating an object ID and the parameter is not 
      // possibly an object ID, the move on.
      if( param === "_id" && ! isObjectIdString(req.params[param])) {
        return next();
      }
      
      // Ensure that each undefined parameter is handled.
      populateFields     = (populateFields)     ? populateFields     : "";
      populateSelects    = (populateSelects)    ? populateSelects    : "";
      populateModels     = (populateModels)     ? populateModels     : "";
      populateConditions = (populateConditions) ? populateConditions : "";

      // Search by ID
      Schema.findById(req.params[param]).populate(populateFields, populateSelects, populateModels, populateConditions).exec(function(err, obj) {
        if(err) {
          next(err);
        }
        
        if(obj) {
          log.t(traceHeader, "Loaded by id " + obj.toString(), trace);
        }

        setCrudQueryHandled(req);

        // Set the query result and continue on.
        setQueryResult(obj, req, undefined, next);
      });
    } else {
      log.e("Route does not contain the parameter " + param);
      return next();
    }
  };
};


var load = function load(Schema, queryObject, opts, overwrite, queryBody) {
  return load[Schema, queryObject, opts] = function(req, res, next) {
    // Check for a previous query performed by CRUD method.
    // Don't perform a query if a CRUD query has already been handled.
    if(isCrudQueryHandled(req)) {
      log.t(traceHeader, "Load: CRUD load route is already handled, skipping this route method.", trace);
      return next();
    }

    // If overwrite is false, don't perform a query to overwrite an existing one.
    if( ! overwrite && getQueryResult(req) !== undefined) {
      //console.log("Load: Don't overwrite the query...");
      return next();
    }


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

    // Merge body as part of the query, if the flag is set.
    if(queryBody && req.body) {
      query = merge.priorityMerge(req.body, query);
    }

    // Handle options
    if(opts) {
      sort = (opts["sort"]) ? opts["sort"] : "";
    }

    Schema.find(query, function(err, obj) {
      if(err) {
        next(err);
      } else if( ! obj){
        log.w("Could not find schema object.  Query Object:", debug);
        log.w("\t" + query);
      } else {
        setQueryResult(obj, req, []);
        setCrudQueryHandled(req);
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

/*
  var authConfig = getCrudAuthConfig(config),
      isAuthEnabled = (authConfig && authConfig["enabled"]);

  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        enableCrudOnSchema(key, isAuthEnabled, config);
      }
    }
  } */
}


function getCrudAuthConfig(config) {
  if(config && config["crud"] && config.crud["auth"]) {
    return config.crud.auth;
  }
  return {};
}


/**
 * Create an authentication method to place along a 
 * CRUD route.  This uses the configuration object to create
 * the correct authentication route method.
 * 
 * @param methodType is a key word representing a CRUD method.
 * Some acceptable values are create, read, readAll, delete, and update.
 * @param schemaName is the schema the CRUD auth method will be in front of.
 * @param authConfig is the authentication portion of the configuration object.
 */
function createAuthMethod(methodType, schemaName, authConfig) {
  // Sanitize the schema name to be lowercase and defined.
  schemaName = ( ! schemaName) ? "default" : schemaName.toLowerCase();
  
  // Method type must be defined to continue.
  if( ! methodType ) {
    log.e("Cannot create CRUD authentication method named '"+methodType+"' for schema '"+schemaName+"'");
    return [];
  }

  // Make sure the config object is valid.
  if( ! authConfig || ! authConfig["routeRoleAuth"]) {
    log.e("Cannot create CRUD authentication method '"+methodType+"' for schema "+schemaName+" because the config object is missing.");
    return [];
  }

  var method,     // Is the auth method to be returned.
      roleNames,  // List of roles by name to pass into the auth method.
      roles = [], // List of roles to pass into the auth method.
      enabled;    // Boolean flag to check if auth is enabled along a route.

  // Check for a schema specific configuration.
  if(authConfig.routeRoleAuth[schemaName] && authConfig.routeRoleAuth[schemaName][methodType]) {
    
    // Check if authentication for the schema is enabled.
    if(authConfig.routeRoleAuth[schemaName][methodType]["enabled"] === false) {
      log.t(traceHeader, "CRUD "+methodType.cyan+" authentication for ".grey+schemaName.cyan+" is ".grey+"disabled".cyan+".".grey, trace);
      return [];
    } else {
      enabled = true;
    }

    method = authConfig.routeRoleAuth[schemaName][methodType]["method"];
    roleNames = authConfig.routeRoleAuth[schemaName][methodType]["roles"];
  }

  // Check for default.
  if(authConfig.routeRoleAuth["default"] && authConfig.routeRoleAuth["default"][methodType]) {
    // Check if authentication for the schema is enabled.
    if(enabled === undefined && authConfig.routeRoleAuth["default"][methodType]["enabled"] === false) {
      log.t(traceHeader, "CRUD "+methodType.cyan+" authentication for ".grey+schemaName.cyan+" is ".grey+"disabled".cyan+".".grey, trace);
      return [];
    } else {
      enabled = true;
    }

    if(method === undefined || method === null) {
      method = authConfig.routeRoleAuth["default"][methodType][method];
    }

    if(roleNames === undefined || roleNames === null) {
      roleNames = authConfig.routeRoleAuth["default"][methodType]["roles"];
    }
  }

  // Make sure roleNames is an array.
  roleNames = ( ! roleNames) ? [] : roleNames;

  // Create the list of roles from the list of role names.
  for(var i = roleNames.length-1; i >=0; --i) {
    role = auth.queryRoleByName(roleNames[i]);
    if(role) {
      roles.push(role);
    }
  }

  method = (method === undefined || method === null) ? ">=" : method;

  switch(method) {
    default:
    case ">=":
      method = auth.allowRolesOrHigher(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "!>=":
      method = auth.denyRolesOrHigher(roles, authConfig["ignoreHandledRequests"]);
      break;
    
    case "<=":
      method = auth.allowRolesOrLower(roles, authConfig["ignoreHandledRequests"]);
      break;
    
    case "!<=":
      method = auth.denyRolesOrLower(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "=":
    case "==":
      method = auth.allowRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "!=":
      method = auth.denyRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case ">":
      method = auth.allowHigherRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "!>":
      method = auth.denyHigherRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "!<":
      method = auth.allowLowerRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case "!<":
      method = auth.denyLowerRoles(roles, authConfig["ignoreHandledRequests"]);
      break;

    case true:
    case "true":
      method = auth.allowAllRoles(authConfig["ignoreHandledRequests"]);
      break;

    case false:
    case "false":
      method = auth.denyAllRoles(authConfig["ignoreHandledRequests"]);
      break;
  }

  log.t(traceHeader, "Created CRUD auth "+methodType.cyan+" method for ".grey+schemaName.cyan+" with roles: [ ".grey+roleNames.toString().cyan+" ]".grey, trace);

  return (method) ? method : [];
}


function getCrudAuthRouteName() {
  if(config && config["crud"] && config.crud["auth"]) {
    return config.crud.auth.name;
  }
}

var loadCrudAuth = function(app, db, config, next) {
  var authConfig = getCrudAuthConfig(config);
  if(! (authConfig && authConfig["enabled"])) {
    if(next) {
      next()
    }
    return;
  }

  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        loadCrudAuthOnSchema(key, config);
      }
    }
  }

  if(next) {
    return next();
  }
}

var loadCrudAuthOnSchema = function(schemaName, config, next) {
  schema = db.model(schemaName);
  
  // Get the collection name from the schema name.
  collectionName = schemaName.toLowerCase() + 's';

  // Get the authentication configuration object from the config.
  var authConfig = getCrudAuthConfig(config);

  // Create our CRUD authenticaiton methods.
  var createAuth = createAuthMethod("create", schemaName, authConfig),
      readAuth = createAuthMethod("read", schemaName, authConfig),
      updateAuth = createAuthMethod("update", schemaName, authConfig),
      deleteAuth = createAuthMethod("remove", schemaName, authConfig),
      readAllAuth = createAuthMethod("readAll", schemaName, authConfig);

  // Query all
  app.get('/'+collectionName+'/query.:format', readAllAuth);
  app.post('/'+collectionName+'/query.:format', readAllAuth);

  // Get by ID.
  app.get('/'+collectionName+'/:id.:format', readAuth);

  // Get all
  app.get('/'+collectionName+'.:format', readAllAuth);

  // Update
  app.post('/'+collectionName+'/:id.:format', updateAuth);
  app.post('/'+collectionName+'/:id/update.:format', updateAuth);

  // Create
  app.post('/'+collectionName+'.:format', createAuth);
  app.post('/'+collectionName+'/create.:format', createAuth);

  // Delete
  app.delete('/'+collectionName+'/:id.:format', deleteAuth);
  app.delete('/'+collectionName+'/:id/delete.:format', deleteAuth);

  log.d("\tCRUD Authentication enabled for the "+schemaName.cyan+" schema.".magenta, debug);

  if(next) {
    return next();
  }
}


function getCrudQueryRouteName() {
  if(config && config["crud"] && config.crud["queries"]) {
    return config.crud.queries.name;
  }
}

var loadCrudQuery = function(app, db, config, next) {
  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        loadCrudQueryOnSchema(key, config);
      }
    }
  }

  if(next) {
    return next();
  }
}


var loadCrudQueryOnSchema = function(schemaName, config, next) {
  schema = db.model(schemaName);

  //Overwrite previous queries?
  var overwrite = (config && config["crud"] && config.crud["overridePreviousQueries"]);
  
  // Get the collection name from the schema name.
  collectionName = schemaName.toLowerCase() + 's';

  // Query all by parameter and body properties.
  app.get('/'+collectionName+'/query.:format', load(schema, {}, undefined, overwrite, true));
  app.post('/'+collectionName+'/query.:format', load(schema, {}, undefined, overwrite, true));

  // Get by ID.
  app.get('/'+collectionName+'/:id.:format', loadById(schema, "id", overwrite));

  // Get all
  app.get('/'+collectionName+'.:format', load(schema, {}, undefined, overwrite, true));

  // Update
  app.post('/'+collectionName+'/:id.:format', loadById(schema, "id", overwrite));
  app.post('/'+collectionName+'/:id/update.:format', loadById(schema, "id", overwrite));

  // Delete
  app.delete('/'+collectionName+'/:id.:format', loadById(schema, "id", overwrite));
  app.delete('/'+collectionName+'/:id/delete.:format', loadById(schema, "id", overwrite));

  log.d("\tCRUD Query enabled for the "+schemaName.cyan+" schema.".magenta, debug);

  if(next) {
    return next();
  }
}

function getCrudMethodRouteName() {
  if(config && config["crud"] && config.crud["methods"]) {
    return config.crud.methods.name;
  }
}

var loadCrudMethod = function(app, db, config, next) {
  if(db && db.models) {
    for(var key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        loadCrudMethodOnSchema(key, config);
      }
    }
  }

  if(next) {
    return next();
  }
}

var loadCrudMethodOnSchema = function(schemaName, config, next) {
  schema = db.model(schemaName);
  
  // Get the collection name from the schema name.
  collectionName = schemaName.toLowerCase() + 's';

  // Check if the sanitize method is available.
  var isSanitized = (verifyModelHasCrudMethod(schema, "sanitize"));

  // Query all by parameters or body.
  app.get('/'+collectionName+'/query.:format', getAllRoute(isSanitized));
  app.post('/'+collectionName+'/query.:format', getAllRoute(isSanitized));

  // Get by ID.
  app.get('/'+collectionName+'/:id.:format', getRoute(isSanitized));

  // Get all
  app.get('/'+collectionName+'.:format', getAllRoute(isSanitized));

  // Update
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'/:id.:format', updateRoute(isSanitized));
    app.post('/'+collectionName+'/:id/update.:format', updateRoute(isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the update CRUD route.");
  }

  // Create
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'.:format', createRoute(schema, isSanitized));
    app.post('/'+collectionName+'/create.:format', createRoute(schema, isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the create CRUD route.");
  }

  // Delete
  if(verifyModelHasCrudMethod(schema, "delete")) {
    app.delete('/'+collectionName+'/:id.:format', removeRoute);
    app.delete('/'+collectionName+'/:id/delete.:format', removeRoute);
  } else {
    log.e("Schema " + schemaName + " must implement the delete method to enable the delete CRUD route.");
  }

  log.d("\tCRUD Method enabled for the "+schemaName.cyan+" schema.".magenta, debug);
}

/**
 * Add routes for creating, reading, updateing, and deleting instances of
 * a schema object.  It also protects the routes using default authentication
 * settings found in the config.
 */
/*var enableCrudOnSchema = function(schemaName, isAuthEnabled, config) {
  schema = db.model(schemaName);
  
  // Get the collection name from the schema name.
  collectionName = schemaName.toLowerCase() + 's';

  // Check if the sanitize method is available.
  var isSanitized = (verifyModelHasCrudMethod(schema, "sanitize"));

  // Get the authentication configuration object from the config.
  var authConfig = getCrudAuthConfig(config);

  // Create our CRUD authenticaiton methods.
  var createAuth = createAuthMethod("create", schemaName, authConfig),
      readAuth = createAuthMethod("read", schemaName, authConfig),
      updateAuth = createAuthMethod("update", schemaName, authConfig),
      deleteAuth = createAuthMethod("remove", schemaName, authConfig),
      readAllAuth = createAuthMethod("readAll", schemaName, authConfig);

  // Query
  app.get('/'+collectionName+'/query.:format', readAuth, )

  // Get by ID.
  app.get('/'+collectionName+'/:id.:format', readAuth, loadById(schema, "id"), getRoute(isSanitized));

  // Get all
  app.get('/'+collectionName+'.:format', readAllAuth, load(schema, {}), getAllRoute(isSanitized));  //{ "sort": "creationDate"}

  // Update
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'/:id.:format', updateAuth, loadById(schema, "id"), updateRoute(isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the update CRUD route.");
  }

  // Create
  if(verifyModelHasCrudMethod(schema, "update")) {
    app.post('/'+collectionName+'.:format', createAuth, createRoute(schema, isSanitized));
  } else {
    log.e("Schema " + schemaName + " must implement the update method to enable the create CRUD route.");
  }

  // Delete
  if(verifyModelHasCrudMethod(schema, "delete")) {
    app.delete('/'+collectionName+'/:id.:format', deleteAuth, loadById(schema, "id"), removeRoute);
  } else {
    log.e("Schema " + schemaName + " must implement the delete method to enable the delete CRUD route.");
  }


  log.d("\tCRUD enabled for the "+schemaName.cyan+" schema.".magenta, debug);
} */

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
    if( ! verifyModelHasCrudMethod(Schema, methods[i])) {
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
    log.w(err, debug);
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
    // If the CRUD request is already handled, move on.
    if(isCrudRequestHandled(req)) {
      log.t(traceHeader, "GetRotue: CRUD route is already handled, skipping this route method.", trace);
      return next();
    }

    // Get the object from the query result.
    var obj = getQueryResult(req);

    // If there wasn't a result, move on.
    if( ! obj) {
      return next();
    }

    // Remove private properties in object.
    obj = sanitizeObject(obj, isSanitized);

    // Mark the CRUD request as handled.
    setCrudRequestHandled(req);

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
    // If the CRUD request is already handled, move on.
    if(isCrudRequestHandled(req)) {
      log.t(traceHeader, "GetAllRoute: CRUD route is already handled, skipping this route method.", trace);
      return next();
    }

    // Get the array from the query result.
    var objs = getQueryResult(req);

    // If there wasn't a result, move on.
    if( ! objs) {
      return next();
    }

    // Remove private properties in object.
    obj = sanitizeObjects(objs, isSanitized);

    // Mark the CRUD request as handled.
    setCrudRequestHandled(req);

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
    // If the CRUD request is already handled, move on.
    if(isCrudRequestHandled(req)) {
      log.t(traceHeader, "updateRoute: CRUD route is already handled, skipping this route method.", trace);
      return next();
    }

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

      // Mark the CRUD request as handled.
      setCrudRequestHandled(req);

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
 * ******************** Formatting Objects
 * ************************************************** */

  /**
   * Change the name of an object's key
   * @param obj is the object to be modified.
   * @param oldKey is the old property name to be removed.
   * @param newKey is the new property name to be created.
   * @param next is an optional callback method.
   */
  var changeKeyName = function(obj, oldKey, newKey, next) {
    // If the object contains a value for the old key.
    if(obj.hasOwnProperty(oldKey)) {
      
      // Save the value to the new property location
      obj[newKey] = obj[oldKey];
      
      // Remove the old property.
      delete obj[oldKey];
    }

    if(next) {
      next(undefined, obj);
    } else {
      obj;
    }
  }

  /**
   * Create an object out of an array where one of the
   * array's properties is used to index the new object.
   * If a key is not defined the array's index will be used
   * to index the new object.
   */
  var mapArrayToObject = function(array, keyProperty) {
    var obj = {};
    if( ! keyProperty) {
      for(var i = array.length()-1; i >=0; --i) {
        obj[i] = array[i];
      }
    } else {   
      for(var i = array.length()-1; i >=0; --i) {
        obj[array[i][keyProperty]] = array[i];
        delete obj[array[i][keyProperty]][keyProperty];
      }
    }

    return obj;
  }

/* Regular Expression - 24 Character Hex String
 * A regular expression to check if a string is 24 characters long and using hex
 * characters.  This is used to verify a string can be used as an Object ID as 
 * defined by MongoDB.
 */
var regex_24Hex = new RegExp("^[0-9a-fA-F]{24}$");

/**
 * Check if a string is a possible object id, meaning
 * it has 24 hex characters.
 */
var isObjectIdString = function(str) {
  return (str !== undefined && regex_24Hex.test(str));
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.

Model.prototype.setQueryResult = setQueryResult;
Model.prototype.getQueryResult = getQueryResult;

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

Model.prototype.loadCrudQuery = loadCrudQuery;
Model.prototype.loadCrudAuth = loadCrudAuth;
Model.prototype.loadCrudMethod = loadCrudMethod;

Model.prototype.getCrudAuthRouteName = getCrudAuthRouteName;
Model.prototype.getCrudQueryRouteName = getCrudQueryRouteName;
Model.prototype.getCrudMethodRouteName = getCrudMethodRouteName;

// Format Objects
Model.prototype.changeKeyName = changeKeyName;
Model.prototype.mapArrayToObject = mapArrayToObject;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Model;

// Reveal the public API.
exports = Model;