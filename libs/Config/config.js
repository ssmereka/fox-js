// ~> Library
// ~A Scott Smereka

/* Configuration
 * Handles information needed to setup and run the client
 * and server.  Creates a static configuration object that
 * is available to the different parts of the server.
 */


/* ************************************************** *
 * ******************** Variables and Libs
 * ************************************************** */

var fox,
    merge,
    path            = require('path'),
    serverDirectory = path.resolve(__dirname + "../../"),
    clientDirectory = path.resolve(__dirname, '../../../../../client');

/**
 * Use this key in the access_token field when you try 
 * to io install the server.
 */
var SERVER_INSTALL_KEY = "IOlQ9V6Tg6RVL7DSJFL248723Bm3JjCF34FI0TJOVPvRzz";

/**
 * Application information used to help configure the app.
 */
var app = {
  name: "fox",
  domain: "fox.com"
}


/* ************************************************** *
 * ******************** Config Constructor
 * ************************************************** */

/**
 * Config constructor to setup the config object before
 * the methods are used.
 */
var Config = function(_fox) {
  updateFoxInstance(_fox);
};

/**
 * Update the instance of fox and anything related
 * in this config instance.
 */
var updateFoxInstance = function(_fox) {
  if(_fox) {
    fox = _fox;
    merge = fox.merge;
  }
}


/* ************************************************** *
 * ******************** Config Defaults
 * ************************************************** */

/**
 * The default configuration file stores all the properties
 * required to run the client and server.
 */
var defaultConfig = {
  
  // Access tokens are used for API calls made on behalf of a user.
  accessTokens: {
    tokenLifeInDays: 10                  // How long a token is valid before a new token must be requested.
  },

  // Create, read, update, and delete routes and methods can be automatically
  // generated for each schema model.  This allows you to configure how the 
  // routes behave, authentication, and other settings.
  crud: {
    enabled: true,                       // Enable or Disable creation of the CRUD methods and routes.

    // Authentication for each module's route(s) or group(s) of
    // routes can be controlled using this object.
    auth: {                              
      enabled: true,                     // Enable or Disable authentication for CRUD methods and routes.
      name: "crud-auth",                 // Name of the CRUD authentication routes in the config's route order array below.
      ignoreHandledRequests: true,       // Disable authentication for routes that have already been handled by a previous route.
      
      routeRoleAuth: {                   // Authentication for CRUD methods based on the role.
        
        "default": {                     // Default authentication settings for all roles that are not specifically defined in the config object.
          create: {                      // Create methods conist of POST requests to create a new object of a model type.
            enabled: true,               // Enable or disable authentication on create routes.
            method: ">=",                // Comparison method for allowed roles.  In this example a user must contain a role of admin level or greater to be authenticated.
            roles: [ "admin" ],          // Roles that are authenticated based on the comparison method.
          },
          read: {                        // Read methods consist of GET requests to lookup a single object.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          },
          readAll: {                     // Read all methods consist of GET requests to return all objects of a model or query for a group of objects from a model.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          },
          update: {                      // Update methods consist of POST requests to modify an existing object of a model type.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          },
          updateAll: {                   // Update all methods consist of POST requests to modify more than one object of a model type.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          },
          remove: {                      // Remove methods consist of DELETE requests to delete a single object of a model type.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          },
          removeAll: {                   // Remove all methods consist of DELETE requests to delete more than one object of a single model type.
            enabled: true,
            method: ">=",
            roles: [ "admin" ],
          }
        }
      }
    },

    // Create, read, update, and delete route methods can be 
    // configured using this config object.
    methods: {
      name: "crud-methods",             // Name of the CRUD method routes in the config's route order array below.
      ignoreHandledRequests: true       // Disable crud route methods for requests that have already been handled by a previous route.
    },

    // Query route methods preload data that will be used
    // by later CRUD route methods.  These can be configured 
    // using this object.
    queries: {                          
      name: "crud-queries",             // Name of the CRUD query routes in the config's route order array below.
      ignoreHandledRequests: true,      // Disable query route methods for requests that have already been handled by a previous route.
      overridePreviousQueries: false    // Overwrite a previous route's query results with the CRUD methods query results.
    },

    schemaBlacklist: [                  // List of schema names where CRUD will be disabled, even if whitelisted.
    ],

    schemaWhitelist: [                  // List of schema names where CRUD will be enabled, all others will be disabled.
    ]
  },

  // Path to the server's application folder.
  dirname: serverDirectory + "/app/",   

  // Server enviorment dictates how the server will run.
  // Example modes: local, development, production.
  enviorment: "local",                  // Default to local enviorment mode.

  // Express is the underlying framework for the server, configure it here.
  express: {
    sessionKey: 'CCCQ9V6Tg6RVFfFK5BjBm3JjCFy4FI0TJOD21dk' // The session key is used to keep the express sessions secure, keep this private.
  },

  // A private key used to authenticate a one-time install of the server.
  installKey: SERVER_INSTALL_KEY,       // Keep it secret, keep it safe

  // Mongo DB database connection information and configuration.
  mongodb: {
    enabled: true,                                    // Enable or disable use of a MongoDB database for data storage.
    useAuthentication: true,                          // Enable or disable MongoDB database authentication to connect.
    username: 'admin',                                // If using database authentication, this is the database username.
    password: 'ASCO231IYBeEede17dbYsELWtK5UKjNfvN34', // If using database authentication, this is the database password.
    host: 'localhost',                                // Host ip address of the database.
    port: '27017',                                    // Host port for the database.
    database: app['name'] + '_local'                  // Name of database in the Mongo DB database instance.
  },

  // Absolute paths to files and folders.
  paths: {
    
    // The client root folder.  All things client will be below this folder.
    clientFolder: clientDirectory,

    // Client application folder, which stores all of the core components for the client application.    
    clientAppFolder: clientDirectory + "/app/",                
    
    // Express has a special attribute for the favicon, so we should specifically set it.
    favIcon: path.normalize(clientDirectory + '/assets/img/favicon.ico'),

    // Server application root directory, store the server's main components.
    serverAppFolder: path.normalize(serverDirectory + '/app/'),
   
    // Server configuration folder, where all the config files are stored.
    serverConfigFolder: path.normalize(serverDirectory + '/configs/'),

    // Server node_modules folder, where all the dependencies are stored.
    serverNodeModulesFolder: path.resolve(__dirname, "../node_modules") + "/",  //TODO: Verify works on windows, linux, and mac.

    // A static folder's content is made available in routes similar to browsing
    // the folder on your computer.  Everything in the static folders is made 
    // public to everyone.
    //
    // Entries are made available using the following pattern:   /:name/:folderName/:file
    staticFolders: {

      // Client application files.
      '': {
        path: path.normalize(clientDirectory + '/app/')
      },

      // Client assets folder containing things like css, images, and javascript.
      assets: {
        path: path.normalize(clientDirectory + '/assets/')
      },

      // Client library folder containing 3rd party dependencies.
      libs: {
        path: path.normalize(clientDirectory + '/libs/')
      }
    },
  },

  // Lists the order in which routes will be required.
  // For example  [ "Model", "Controller", "Error" ]
  routes: [],                          
  
  // Concatenated with a route type to uniquely identify a file as a specific route type.
  // An example is ~> Controller or ~> Model
  routeTypeIdentifier: "~>",

  // Configs for the server itself.
  server: {
    debug: false,                       // Enable or disable additional logging and features used to debug the server.
    host: 'localhost',                  // IP address of the server
    port: '3000',                       // Port for the node application.
    protocol: 'https'                   // Default protocol to use, http or https.
  },

  socketio: {
    enabled: true,                      // Enable or disable use of web sockets through socket.io
    protocol: "http"
  },

  // Private configs for the internal fox libraries.
  system: {
    debug: false,                       // Flag to enabled additional logging of debug information.
    trace: false                        // Flag to enable additional logging of what things are occuring.
  }
};


/* ************************************************** *
 * ******************** Config Enviorments
 * ************************************************** */

/**
 * Local enviorment mode specific variables.  These 
 * properties will be merged with the default config
 * object if the server is in the local enviorment mode.
 */
var local = {
  // Server enviorment dictates how the server will run.
  // Example modes: local, development, production.
  enviorment: "local",

  // Mongo DB database connection information and configuration.
  mongodb: {
    enabled: true,                       // Enable or disable use of a MongoDB database for data storage.
    useAuthentication: false,            // Enable or disable MongoDB database authentication to connect.
    host: 'localhost',                   // Host ip address of the database.
    port: '27017',                       // Host port for the database.
    database: app['name'] + '_local'     // Name of database in the Mongo DB database instance.
  },

  // Configs for the server itself.
  server: {
    debug: true,                        // Enable or disable additional logging and features used to debug the server.
    host: 'localhost',                  // IP address of the server
    port: '3000',                       // Port for the node application.
    protocol: 'http'                    // Default protocol to use, http or https.
  }
};

/**
 * Development enviorment mode specific variables.  These 
 * properties will be merged with the default config
 * object if the server is in the development enviorment mode.
 */
var development = {
  // Server enviorment dictates how the server will run.
  // Example modes: local, development, production.
  enviorment: "development",
  
  // Mongo DB database connection information and configuration.
  mongodb: {
    enabled: true,                       // Enable or disable use of a MongoDB database for data storage.
    useAuthentication: false,            // Enable or disable MongoDB database authentication to connect.
    host: 'localhost',                   // Host ip address of the database.
    port: '27017',                       // Host port for the database.
    database: app['name'] + '_local'     // Name of database in the Mongo DB database instance.
  },

  // Configs for the server itself.
  server: {
    debug: true,                        // Enable or disable additional logging and features used to debug the server.
    host: 'localhost',                  // IP address of the server
    port: '3000',                       // Port for the node application.
    protocol: 'http'                    // Default protocol to use, http or https.
  }
};

/**
 * Production enviorment mode specific variables.  These 
 * properties will be merged with the default config
 * object if the server is in the production enviorment mode.
 */
var production = {
  // Server enviorment dictates how the server will run.
  // Example modes: local, development, production.
  enviorment: "production",
  
  // Mongo DB database connection information and configuration.
  mongodb: {
    enabled: true,                                    // Enable or disable use of a MongoDB database for data storage.
    useAuthentication: true,                          // Enable or disable MongoDB database authentication to connect.
    username: 'admin',                                // If using database authentication, this is the database username.
    password: 'ASCO231IYBeEede17dbYsELWtK5UKjNfvN34', // If using database authentication, this is the database password.
    host: 'localhost',                                // Host ip address of the database.
    port: '27017',                                    // Host port for the database.
    database: app['name'] + '_local'                  // Name of database in the Mongo DB database instance.
  },

  // Configs for the server itself.
  server: {
    debug: false,                       // Enable or disable additional logging and features used to debug the server.
    host: app["domain"],                // IP address of the server
    port: '3000',                       // Port for the node application.
    protocol: 'https'                   // Default protocol to use, http or https.
  }
};


/* ************************************************** *
 * ******************** Config Enviorments
 * ************************************************** */

/**
 * Retrieve the configuration object specific to the 
 * current server enviorment.  If the enviorment is 
 * unknown the production enviorment config object will 
 * be returned instead.
 */
var getEnviormentConfig = function(_config) {
  _config = (_config) ? _config : this;

  // Get the enviorment string from the commandline arguments.
  var env = (process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV.toLowerCase() : '';

  // If an enviorment is not set, default to production.
  if(_config[env] === undefined) {
    console.log("Enviorment type '"+env+"' is unknown, defaulting to production mode.");
    env = "production";
  }

  return _config[env];
}

/**
 * Create the configuration object to be used by the server.
 * This will merge the default system config and enviorment 
 * specific configuration.  Then it will do the same for the 
 * user's specific config object.  Finally it will merge them
 * all together, giving the user's config priority.
 */
var createConfigObject = function(_userConfig, _systemConfig) {
  _systemConfig = (_systemConfig) ? _systemConfig : this;

  // Merge default configuration with enviorment config.
  var config = merge.deepPriorityMergeSync(getEnviormentConfig(_systemConfig), _systemConfig.default);

  // If a user config is given, merge it with the system's config.
  if(_userConfig) {
    //merge the user's default config with user's enviorment config.
    var userConfig = merge.deepPriorityMergeSync(getEnviormentConfig(_userConfig), _userConfig.default);
    // Merge the new user config with the system's config object.
    config = merge.deepPriorityMergeSync(userConfig, config);
  }

  // Auto generate any fields that do not exist, but need to based 
  // off the parameters in the final config object.
  config = addAutoGeneratedFields(config);

  return config;
}

/**
 * Generate new properties in the config object that need 
 * to exist, but are based off other properties in the config.
 * For example the server's URI depends on the server's host,
 * port, and protocol.  So this method will combine those properties
 * into a new uri property and add it to the config object.
 */
var addAutoGeneratedFields = function(_config) {
  if( ! _config) {
    return _config;
  }

  // Generate Server Fields
  if(_config["server"]) {

    // Host port
    if(process.env.PORT !== undefined) {
      _config.server.port = process.env.PORT;
    }

    // Host URI.
    if(_config.server.host === "localhost") {
      _config.server["uri"] = _config.server.protocol+"://"+_config.server.host+":"+_config.server.port;
    } else {
      _config.server["uri"] = _config.server.protocol+"://"+_config.server.host;
    }
  }

  // Generate Mongo DB fields
  if(_config["mongodb"] && _config.mongodb["enabled"]) {
    if(_config.mongodb["useAuthentication"]) {
      _config.mongodb["uri"] = 'mongodb://' + _config.mongodb['username']+':'+_config.mongodb['password']+'@'+_config.mongodb['host']+':'+_config.mongodb['port']+'/'+_config.mongodb['database'];
    } else {
      _config.mongodb["uri"] = 'mongodb://' + _config.mongodb['host']+':'+_config.mongodb['port']+'/'+_config.mongodb['database'];
    }
  }

  // Generate socket.io configs.
  if(_config["socketio"]) {

    // Path to the SSL file in the config folder.
    _config.socketio.sslFilePath = _config.paths.serverConfigFolder + "ssl";
  }

  return _config;
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Config.prototype.updateFoxInstance = updateFoxInstance;

Config.prototype.default = defaultConfig;
Config.prototype.local = local;
Config.prototype.development = development;
Config.prototype.production = production;

Config.prototype.createConfigObject = createConfigObject;

/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Config;

// Reveal the public API.
exports = Config;
