// ~> Library
// ~A Scott Smereka

/* Message
 * Library for handling control messages sent to
 * the server.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

 var fox,
     log;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Handles initalization of the message library.
 */
var Message = function(_fox) {
  fox = _fox;
  log = fox.log;
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Handle messages sent from pm2.
 */
var handler = function(server) {
  
  // Handle pm2 messages.
  process.on('message', function(msg) {
  
    // Shutdown Message - The server process is going to be killed in 
    // 4 seconds.  Try to shutdown any open connections.
    // You can override the timeout by modifying PM2_GRACEFUL_TIMEOUT
    if (msg == 'shutdown') {
      log.d("Server shutdown in progress...");
      server.stop({}, function(err) {
        if(err) {
          log.e(err);
        } else {
          log.d("Server shutdown successfully.");
        }

        process.exit(0);
      });
    } else {
      log.d("Unhandled Message: " + msg);
    }
  });

  // Handle nodemon shutdown message.
  process.once("SIGUSR2", function() {
    // Gracefully stop the server.
    server.stop({}, function(err) {
      // Kill the current process, and send the SIGUSR2 flag.
      process.kill(process.pid, "SIGUSR2");
    });
  });


  /** 
   * Handle kill command from terminal
   * 
   * SIGINT from the terminal is supported on all platforms, and can 
   * usually be generated with CTRL+C (though this may be configurable). 
   * It is not generated when terminal raw mode is enabled.
   */
  process.on("SIGINT", function() {
    server.stop({}, function(err) {
      process.exit(0);
    });
  });

  // TODO: Handle other flags http://nodejs.org/api/process.html
  
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Message.prototype.handler = handler;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Message;

// Reveal the public API.
exports = Message;
