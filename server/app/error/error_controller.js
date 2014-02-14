// ~> Error
// ~A Scott Smereka

module.exports = function(app, db, config) {
  var fox = require('foxjs'),
      sender = fox.send;
  
  app.all('/*', handleErrors);
  app.all('/*', handle404);

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

    sender.sendError(err, req, res, next);
  }

  /**
   * Send a 404 not found error message.
   * Place this method at the very end of the routes.
   */
  function handle404(req, res, next) {
    sender.createAndSendError("Method or Request not found.", 404, req, res, next);
  }
};