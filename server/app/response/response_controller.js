// ~> Response
// ~A Scott Smereka

module.exports = function(app, db, config) {
  var fox = require('foxjs'),
      sender = fox.send;
  
  app.all('/*', sendResponse);

  function sendResponse(err, req, res, next) {
    // If there is an error, move on.
    if(err) {
      next(err);
    }

    // If there is a response object, send it.
    if(sender.getResponse) {
      return sender.sendResponse(sender.getResponse, req, res, next);
    }

    // If there is not a response object, move on.
    next();
  }
};