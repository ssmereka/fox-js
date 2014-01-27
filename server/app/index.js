/* Server.js
 * Creates, configures, and starts the node.js server.
 */

var load = require("../libs/loading");    // Require a library to help setup & configure the server.
var msgs = require("../libs/messaging");

var server = {

  // Handle starting the server.
  start: function(config, next) {
    load.app(function(err, app, config, db) { // Create and configure our application, configuration, and database objects.
      if(err) { 
        return console.log(err.red);          // If there was an error, we can't start the server so quite and show the error message.
      }

      load.passport();                        // Load and configure passport for authentication.

      // Set the order of your routes.
      config.routes.push("controller");       // Load all non-static controllers.
      config.routes.push("error");            // Finally, load an error handler.  If no other routes handle the request, then the error handler will step in.

      load.routes(function(err, success) {    // Dynamically require all of our routes in the correct order.
        load.server();                        // Start the server.
        
        // Notify the caller that the server has started successfully.
        if(next) {
          return next(undefined, "Loaded successfully");
        }

      });
    });
  },

  // Handle stopping the server.  You have 4 seconds to kill any open 
  // connections or do what is necessary for a graceful shutdown.  
  stop: function(config, next) {

    // When done, make a call to next.  Next can accept
    // an error as the first parameter.
    return next();
  }

};

// Handle any messages sent to the server, such as 
// start, stop, restart, etc.
msgs.handle(server);

// Start the server.
server.start({}, undefined);