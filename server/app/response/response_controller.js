// ~> Response
// ~A Scott Smereka

module.exports = function(app, db, config) {
  var fox = require('foxjs'),
      sender = fox.send;
  
  app.all('/*', sendResponse);

  function sendResponse(req, res, next) {
    // If there is a response object, send it.
    if(sender.getResponse(res)) {
      return sender.sendResponse(sender.getResponse(res), req, res, next);
    }

    // If there is not a response object, move on.
    next();
  }
};