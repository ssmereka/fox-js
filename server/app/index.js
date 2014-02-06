// ~> Server
// ~A Scott Smereka

/*
 * Creates, configures, and starts the node.js server.
 */

var path = require("path");
var app = require("fox");    

var server = {
  start: function(config, next) {
    // The config routes array determines the order in which
    // your routes will be executed.  Note that models are
    // always loaded first and automatically for you.

    // Load all non-static controllers.
    config.routes.push("controller");    
    
    // Lastly load error handler(s) to catch any unhandled requests.
    config.routes.push("error");     

    app.start(config, next);
  },

  // Note:  This function has a 4 second timeout.
  stop: function(config, next) {
    console.log("STOP");
    // Gracefully shutdown the server. 
    app.stop(next);
  }

};

// Handle messages sent to the server, such as start, stop, restart, etc.
app.message.handler(server);

// Start the server using the configuration file.
server.start(require(path.resolve(__dirname, "../configs/config.js")));