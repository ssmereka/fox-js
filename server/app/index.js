/* Server.js
 * Creates, configures, and starts the node.js server.
 */

var load = require("../libs/loading");    // Require a library to help setup & configure the server.

module.exports = {
  start: function(config, next) {
    //console.log(config);
    //next(undefined, "Loaded successfully");
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
        

        // Notify the start script that the server has started successfully.
        if(next) {
          return next(undefined, "Loaded successfully");
        }

      });
    });
  },

  stop: function(config, next) {

    // Notify the start script that the server has stopped succesfully.
    return next(undefined, "Server stopped successfully.");
  }

};
