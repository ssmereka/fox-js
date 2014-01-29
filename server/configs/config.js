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

  // Routes determines the order in which models and controllers are required.
  // Note:  Models are automatically required for you so you do not need to
  // list them here.  An example routes value is: [ "controller", "error" ]
  routes: []
}

// Export the configuration object.
module.exports = config;
