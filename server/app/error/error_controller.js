// ~> Error
// ~A Scott Smereka

/* Error
 * Displays, sends, or otherwise handles all errors 
 * generated from previous routes.
 */

module.exports = function(app, db, config) {


  /* ************************************************** *
   * ******************** Module Variables
   * ************************************************** */

  var fox = require('foxjs'),
      sender = fox.send,
      log = fox.log,
      debug = config.debug;
  

  /* ************************************************** *
   * ******************** Routes
   * ************************************************** */

  // Handle errors from previous routes.
  app.all('/*', handleErrors);

  // Handle routes that were not yet handled.
  app.all('/*', handle404);


  /* ************************************************** *
   * ******************** Routes Methods
   * ************************************************** */

  /**
   * Handle any and all errors that occur during
   * a route by sending a properly formatted error
   * object to the caller.
   */
  function handleErrors(err, req, res, next) {
    // If there is not an error, move on.
    if( ! err) {
      next();
    }

    // Send the error.
    sender.sendError(err, req, res, next);

    // If debug mode, print out the errors in the log.
    if(debug) {

      // Handle printing an error array.
      if(Object.prototype.toString.call( err ) === '[object Array]') {
        var errCount;
        for(var i = 0; i < err.length; i++) {
          errCount = i + 1;
          log.i("Error "+errCount+"/"+err.length+": ")
          log.e(err[i]);
          log.e(err[i]["stack"]);
        }
      } else {
        // Print out a single error object.
        log.e(err);
        log.e(err["stack"]);
      }
    }

    
  }

  /**
   * Send a 404 not found error message.
   * Place this method at the very end of the routes.
   */
  function handle404(req, res, next) {
    // If the request is not already handled, send a 404 error response.
    if(! req.isHandled) {
      sender.createAndSendError("Method or Request not found.", 404, req, res, next);
    }
  }
};