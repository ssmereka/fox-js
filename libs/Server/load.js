// ~> Library
// ~A Scott Smereka

/* Load
 * Library for handling dates.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var accessToken,
    app, 
    config, 
    configModule, 
    debug = false, 
    db,
    fox,
    log, 
    express,
    expressValidator, 
    fs, 
    merge, 
    model, 
    mongoose, 
    MongoStore, 
    path,
    sender,
    trace = false;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Load = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules
  log = fox.log;
  merge = fox.merge;
  model = fox.model;
  accessToken = fox.accessToken;
  sender = fox.send;

  // Load external modules
  path = require('path');

  // Configure the load instance.
  handleConfig(fox.config);
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
 * Load and initalize modules, libraries, and global variables
 * that are used in this loading module.  This includes loading
 * the configuration object.
 */
var modules = function(_config, next) {

  loadConfig(_config, function(err, loadedConfig) {

    // Make sure we loaded a config object before we try to use it.
    if(loadedConfig === undefined) {
      return next(new Error("Could not load a valid config object."));
    }

    config = loadedConfig;

                                          
    express          = require("express");           // Express will handle our sessions and routes at a low level.
    expressValidator = require("express-validator"); // Express validator will assist express.
    fs               = require('fs');                // Initialize the file system module.
    
    // Load Mongo DB related modules, if we are using Mongo DB.
    if(config.mongodb.enabled) {
      mongoose = require('mongoose'),
      MongoStore = require('connect-mongo')(express);
    }

    // If in debug mode, notify the user it was turned on.
    log.d("System level debug mode activated", debug);

    return next(undefined, config);
  });
};

var loadConfig = function(_config, next) {
  // Ensure the next method is valid.
  next = (next) ? next : function(err) { 
    if(err){ 
      log.e(err["message"]||err); 
    }
  };
  
  var systemConfig,
      systemConfigFile,
      systemConfigFilePath = path.normalize("../Config/config.js");
  
  // Load the system configuration file.  This file holds the default
  // configurations for the server.
  try {
    systemConfigFile = require(systemConfigFilePath);
  } catch(err) {
    log.e(err);
    return next(new Error("Cannot load system configuration file."));
  }

  systemConfig = new systemConfigFile();

  var config = systemConfig.createConfigObject(_config);

  next(undefined, config);
}

/**
 * Setup and connect to the database configured in the
 * server config file.  Return a database object once
 * connected, or an error.
 */
var database = function(next) {
  
  // If our database connection could take some time.
  // then notify the user we are waiting for the database conneciton.
  if(config.enviorment !== "local") {
    log.i("Connecting to database...");
  }

  // If we using MongoDB
  if(config.mongodb.enabled) {                                         // If we are configuring a Mongo database.
    // Setup a Mongo Session Store, this will define the database
    // settings and event actions.
    var mongoSessionStore = new MongoStore({                           // Setup a mongo session store and code to run on a connection.
      url: config.mongodb.uri,                                         // Store the uri to connect to the database.
      auto_reconnect: true                                             // Enable auto reconnect if the database connection is lost.
    }, function() {                                                    // This function is called after a successful connection is setup by mongo-connect.
      mongoose.connect(config.mongodb.uri);                            // Finally, connect to the MongoDB Database.
      
      mongoose.connection.on('close', function() {
        log.e("Database connection closed.");
      });

      mongoose.connection.on('disconnected', function() {
        log.e("Database disconnected.");
      });

      mongoose.connection.on('error', function(err) {
        log.e("Database encountered an error: \n", err);
      });

      mongoose.connection.on('open', function() {                      // Once the connection is opened.
        log.s("Connected to the database.");
        if(next !== undefined) {
          next(undefined, mongoose);                                   // Return our connection object (in this case it is just mongoose).
        }
      });

    });

    // Set our Mongo Session Store object to be used by express.
    app.use(                                                           // Finally, execute our code to configure our connection to the mongodb database.
      express.session({                                                // Enable express sessions.
        secret: config.express.sessionKey,                             // Setup the secret session key.
        store: mongoSessionStore                                       // Setup & connect to the MongoDB database.
      })
    );

  // If we are using PostgreSQL database.
  } else if(config.postgresql && config.postgresql.enabled) {                               // If we are configuring a postgresql database.
    return next(new Error("Could not connect to postgresql, one was not configured."), undefined);
  
  // Otherwise, throw an error.
  } else {
    return next(new Error("Could not configure and connect to a database because there were not any enabled."));
  }
};


/**
 * Require all folders listed in the server configuration
 * object's array:  "config.paths.staticFolders".
 * Static folders are loaded before all other routes and 
 * will serve all files in those folders.
 */
var requireStaticFolders = function() {
  if(! config.paths.staticFolders) {
    log.d("Configuring Static Routes: none", debug)
    return;
  }

  // If there are static folders in the config file, 
  // then we will configure them as static.
  if(config.paths.staticFolders.length > 0) {
    log.d("Configuring Static Routes: ", debug);
  }

  
  for(var key in config.paths.staticFolders) {
    if(config.paths.staticFolders.hasOwnProperty(key)) {
      log.d("\t"+key+": " + config.paths.staticFolders[key].path, debug);
      app.use("/"+key, express.static(config.paths.staticFolders[key].path));
    }
  }
}


/**
 * Configure the view engine and view folder.
 * Note: We are for now defaulting to JADE
 * as the tempalte engine.
 */
var configureViews = function() {
  //log.d("Set Jade as view engine.", debug);
  //log.d("Set view path as: ", debug);
  //log.d("\tFolder: " + config.paths.clientAppFolder, debug);

  // Set up the root directory for our views.
  //app.set('views', config.paths.clientAppFolder); 
  
  // Set our view engin as JADE.
  //app.set('view engine', 'jade');                         
}

/**
 * Configures the favicon to be served staticly
 * using express.  The location of the favicon
 * is set in the config object: "config.paths.favicon".
 */
var configureFavIcon = function() {
  log.d("Set favicon:", debug);
  // Set the favicon if available, otherwise use the default express favicon.
  if(config.paths.favicon !== undefined) {
    log.d("\tFile: " + config.paths.favIcon, debug);
    app.use(express.favicon(config.paths.favIcon));
  } else {
    log.d("\tDefault express favicon.", debug);
    express.favicon();
  }
}

/**
 * Get all "valid" files in a given directory and perform
 * the action specified on those files.
 */
var walkAsync = function(directory, action, next) { 
  // Ensure the directory does not have a trailing slash.
  if(directory.substring(directory.length -1) === "/") {
    directory = directory.substring(0, directory.length -1);
  }
  
  // Get a list of all the files and folders in the directory.
  fs.readdir(directory, function(err, list) {
    if(err) {
      return next(err, false);
    }
    
    // Create a count of the number of files and/or folders in the directory.
    var pending = list.length;
    
    // If we are at the end of the list, then return success!
    if( ! pending) {
      return next(null, true);
    }
    
    // For each item in the list, perform an "action" and continue on.
    list.forEach(function(file) {
      
      // Check if the file is invalid; ignore invalid files.
      if(isFileInvalid(file)) {
        log.d("\tSkipping: " + directory + "/" + file, debug);
        pending--;
        return;
      }
      
      // Add a trailing / and file to the directory we are in.
      file = directory + '/' + file;

      // Check if the item is a file or directory.
      fs.stat(file, function(err, stat) {
        if(err) {
          return next(err, false);
        }
        
        // If a directory, add it to our list and continue walking.
        if (stat && stat.isDirectory()) {   
          walkAsync(file, action, function(err, success) {
            if (!--pending) {
              next(null, success);
            }
          });

        // If a file, perform the action on the file and keep walking.
        } else {  
          action(file, function(err) {
            if(err) {
              next(err, false);
            }

            if (!--pending) {
              next(null, true);
            }
          });
        }
      });
    });
  });
}

/**
 * Checks if the file should be required or if the
 * folder should be searched for files to require.
 * This is a helper function of WalkAsync.
 */
var isFileInvalid = function(file) {

  // List of invalid file and folder names; must be in lower case.
  var invalidFiles = ["node_modules"];
  
  // Skip all files that begin with a .
  if(file.substring(0,1) === ".") {
    return true;
  }

  // Skip all files and folders in the invalid file array.
  for(var i = 0; i < invalidFiles.length; i++) {
    if(file.toLowerCase().indexOf(invalidFiles[i]) != -1) {
      return true;
    }
  }

  return false;
}


/**
 * Require all files of the given types.  For example:
 * "types = [controller, error]" will load all controller
 * files and then all error files.
 *
 * Note: This function will walk through all the files in
 * the given folder and search each file a few times.
 * This is a lengthy operation so limit the amount of
 * calls to this function.
 */
var requireTypesInFolder = function(types, folder, next) {
  var files = {};
  var crudAuthRouteName = model.getCrudAuthRouteName(),
      crudQueryRouteName = model.getCrudQueryRouteName(),
      crudMethodRouteName = model.getCrudMethodRouteName();
  
  // Initialize the files object.
  for(var i = 0; i < types.length; i++) {
    files[i] = [];
  }
  
  log.d("Selecting folders to load from: ", debug);
  log.d("\tDirectory: " + folder, debug);
  
  // Walk through all the files in the directory.
  walkAsync(folder, function(file, next) {
    fs.readFile(file, 'utf8', function(err, data) {
      // Check if the file contains a route tag.
      for(var i = 0; i < types.length; i++) {
        // If it contains a route tag, then add it to the list of files to require.
        if(data.toLowerCase().indexOf(config.routeTypeIdentifier + " " + types[i]) != -1) {
          files[i].push(file);
        }
      }
      next();
    });
  }, function(err, success){
    if(err || ! success) {
      next(err || new Error("There was a problem walking through the routes."));
    }

    // If successful, require all the files in the correct order.
    log.d("File Paths to Require: ", debug);
    for(var key in files) {
      if(types[key] === crudAuthRouteName) {
        model.loadCrudAuth(app, db, config);
      } else if(types[key] === crudQueryRouteName) {
        model.loadCrudQuery(app, db, config);
      } else if(types[key] === crudMethodRouteName) {
        model.loadCrudMethod(app, db, config);
      } else {
        files[key].forEach(function(file) {
          requireFile(file);
        });
      }
    }
    
    next(undefined, true);
  });
}

/**
 * Load libraries that require extra time to initalize.
 */
var loadlibs = function(next) {
  fox.authentication.refreshCachedRoles(db, function(err, roles) {
    if(err) {
      next(err);
    } else {
      next(undefined, true);
    }
  });
}


/* Require File
 * Requires a file with the given relative path.  A relative path
 * begins at the applications server root folder.  In this case that
 * is keys_server.
 */
function requireFile(path) {
  // Don't try to load a folder you can't.
  if(path === undefined || path === '') {
    return log.e("Can't require a file with path undefined.");
  }

  // Make sure there is a '/' at the start of the relative path.
  path = (path.substring(0,1) === '/') ? path : '/' + path;
  if(! fs.existsSync(path)) {
    log.e("Can't require a file that doesn't exist.");
    return;
  }
  
  log.d("\tRequire: " + path, debug);
  require(path)(app, db, config);
}


/**
 * Create our application, configuration, and database objects.
 * Also handle initial configurations for our application and express.
 * Finally connect to the database.
 */
var application = function appFunction(_config, next) {
  // Load and initalize some of our external modules, libraries, and global variables.
  // This includes loading our configuration object.
  modules(_config, function(err, config) {
    if(err) {
      return next(err);
    } else if( ! config) {
      return next(new Error("An error occured while loading modules."));
    }
    
    // Create and return an application object created by express.
    // We use module.exports as opposed to exports so that we can use
    // the "app" object as a function.  (Reference: http://goo.gl/6yzmKc)
    //app = module.exports = express(); 
    app = express();

    // Handle configuration and setup for different server enviorment modes. (Such as local, development, and production).
    //var success = configModule.configureEnviorment(express, app);
    //if(! success) {
    //  return next(new Error("Could not load config environment"));
    //}

    // Setup express.
    app.use(express.cookieParser());  // Setup express: enable cookies.

    // For connect 3.0, body parser call changed.
    // app.use(express.bodyParser());    // Setup express: enable body parsing.
    app.use(express.json());
    app.use(express.urlencoded());

    //app.use(expressValidator);        // Setup express validator.

    // Configure and connect to the database.
    database(function(err, _db) {
      if(err) {
        return next(err);
      } else if(! _db) {
        return next(new Error('Could not load or connect to database.'));
      }

      // Set our modules global database variable.
      db = _db;

      // Load the database modules.
      requireTypesInFolder(["model"], config.paths.serverAppFolder, function(err, success) {
        if(err) {
          return next(err);
        } else if( ! success) {
          return next(new Error("Could not load models."));
        }

        // Load and initalize libraries that require some time to laod.
        loadlibs(function(err, success) {
          if(err || ! success) {
            return next(err || new Error("An error occured while trying to preload some libraries."));
          }
          
          next(err, app, config, db);   // Return the app, config, and database objects.
        });
      });
    });
  });
};


/**
 * Configure and setup Passport for authentication.
 */
var passport = function passport(db, next) {
  var passport = require('passport');

  app.use(require('connect-flash')());  // Enables flash messages while authenticating with passport.
  app.use(passport.initialize());
  app.use(passport.session());

  if(fox && fox["accessToken"]) {
    fox.accessToken.enable(db, passport, require('passport-http-bearer').Strategy);
  }

  log.d("Passport configured successfully.", debug);
  if(next) {
    next(undefined, passport);
  }
};


/**
 * Finds and requires all of the routes in the specified order.
 * The different types of routes are specified by a unique identifier
 * followed by the type.  The order is specified by the config.routes
 * array and should be configured in the server.js file.
 */
var routes = function routes(next) {
  var files = {}, 
      routesModelIndex;

  // Require all static folders as public static routes.
  requireStaticFolders();

  // Intialize the router.
  app.use(app.router);                                                 // Handle all routes
  
  // Set the favicon, if available.
  configureFavIcon();

  // Setup our view engine and directory.
  //configureViews();

  // Require all the files of the specified type, in the correct order.
  requireTypesInFolder(config.routes, config.paths.serverAppFolder, function(err, success) {

    // Add a route to ensure the chain of routes end.
    app.all("/*", function(req, res, next) {return;});

    next(err, success);
  });
};


var start = function start(config, next) {
  next = (next) ? next : function(err) {
    if(err) {
      console.log(err);
      process.exit();
    }
  };

  // Create our config object, application, and connect to the database.
  application(config, function(err, app, config, db) { 
    if(err) { 
      // Error occurred and server cannot start, display error.
      return next(err);
    }

    // Load and configure passport for authentication.
    passport(db);                                

    // Enable CRUD routes for all schemas
    if(config && config["crud"] && config.crud["enabled"]) {
      fox.model.enableCrudOnAllSchemas(app, db, config);
    }

    // Dynamically require all of our routes in the correct order.
    routes(function(err, success) {    

      // Start the server and notify the caller that the server has started successfully.
      server(next);                  
    });
  });
};

/**
 * Start the server on the specifed port.
 * Let the user know under what conditions the server started on.
 */
var server = function server(next) {
  next = (next) ? next : function(err, server) {
    if(err) {
      return log.error(err);
    }
    return server;
  };

  if(! config || ! config.server) {
    log.e("Configuration file is missing the server property.");
    return;
  }

  // Start our server listening on previously declared port.
  // You can set the port using "export PORT=1234" or it will default to your configuration file.
  var server = app.listen(config.server.port);
  
  if(config.mongodb.enabled) {
    console.log("[ OK ] Listening on port ".green + config.server.port.cyan + " in ".green + app.settings.env.cyan + " mode with database ".green + config.mongodb.database.cyan + ".".green);
  } else {
    console.log("[ OK ] Listening on port ".green + config.server.port.cyan + " in ".green + app.settings.env.cyan + " mode.".green);
  }

  next(undefined, server);
};


var stop = function stop(next) {
  db.disconnect(function(err) {
    if(err) {
      log.e(err, debug);
    }
    if(next) {
      next(err);
    }
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Load.prototype.app = application;
Load.prototype.passport = passport;
Load.prototype.routes = routes;
Load.prototype.server = server;
Load.prototype.start = start;
Load.prototype.stop = stop;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Load;

// Reveal the public API.
exports = Load;