// ~> Server
// ~A Scott Smereka

/*
 * Creates, configures, and starts the server.
 */

var path = require("path");
var app = require("foxjs");    

var server = {
  start: function(config, next) {

    // Perform any additional configuration of the server
    // before it starts loading routes and finishing up.

    app.start(config, next);
  },

  stop: function(config, next) {

    // Perform any additional tasks before the server
    // is shutdown.  Make them quick you only have 
    // 4 seconds for this entire method to finish.

    // Gracefully shutdown the server. 
    app.stop(next);
  }
};

// Handle messages sent to the server, such as start, stop, restart, etc.
app.message.handler(server);

// Start the server using the configuration file.
server.start(require(path.resolve(__dirname, "../configs/config.js")));