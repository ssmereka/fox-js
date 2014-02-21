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

  // When enabled additional system level debug information shown.
  debugSystem: true,

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
    
    // Load all non-static controllers.
    "controller", 
    
    //
    "response", 
    
    // Lastly load error handler(s) to catch any unhandled requests.
    "error"
  ]
}

// Export the configuration object.
module.exports = config;
