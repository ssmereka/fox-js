// ~> Config
// ~A Scott Smereka

/*
 * Configure the server and initalize global variables available 
 * to all models and controllers.  Note that each of the settings 
 * defined will override its default setting.
 */

var path            = require('path'),
    serverDirectory = path.resolve(__dirname, "../");	// Path to the server directory.


var config = {
	
  accessTokens: {
    tokenLifeInDays: 10
  },

  // Create, read, update, and delete routes and methods can be automatically
  // generated for each schema model.  This allows you to configure how the 
  // routes behave, authentication, and other settings.
  crud: {
    enabled: true,                            // Enable or Disable creation of the CRUD methods and routes.
    auth: {                                   // Authentication for each module's routes can be controlled.
      routeRoleAuth: {                        // Role based authentication
        
        "user": {                             // User schema model specific settings.
          read: {                             // Getting a single user object settings.
            enabled: true,                    // Enable authentication
            method: ">=",                     // Allow roles with permissions equal to or greater than the roles specified.
            roles: [ "admin", "self" ],       // Allow roles admin and the user themselves to read the single user object.
          },
          update: {                           // Updating a single user object settings.
            enabled: true,                    // Enable authentication for updates.
            method: ">=",                     // Allow roles with permissions equal to or greater than the roles specified.
            roles: [ "admin", "self" ],       // Allow roles admin and the user themselves to update the single user object.
          }
        },

        "default": {                          // Default settings for all schema models.
          read: {
            enabled: false
          },
          readAll: {
            enabled: false,
          }
        }
      }
    }
  },

  // Private configs for the internal libraries.
  system: {
    debug: false,
    trace: false
  },

  // Server application root directory.
  dirname: serverDirectory + "/app/",

  // Absolute paths to files and folders.
  paths: {

  	// Server application root directory.
    serverAppFolder: serverDirectory + "/app/",

    // Server configuration folder, where all the config files are stored.
    serverConfigFolder: serverDirectory + "/configs/",

    // Server node_modules folder, where all the dependencies are stored.
    serverNodeModulesFolder: path.resolve(__dirname, "../node_modules") + "/"
  },

  // Routes determines the order in which models and controllers are required
  // and therefore executed.  All models and static routes are loaded 
  // automatically for you so you should not list them here.
  // An example routes value is: [ "controller", "error" ]
  // which loads all the controllers and finally an error handler.
  routes: [ 
    "crud-auth",          // Authentication for all CRUD routes.
    "crud-queries",       // Query for schema object(s) on CRUD routes.
    "crud-methods",       // Set response and perform CRUD methods on all CRUD routes.
    "controller",         // Load all non-static controllers.
    "tracker",            // Handle tracking requests and responses. 
    "response",           // Handle returning non-error respones to a requestor.
    "error"               // Lastly load error handler(s) to send errors and catch any unhandled requests.
  ]
}

// Export the configuration object.
module.exports = config;
