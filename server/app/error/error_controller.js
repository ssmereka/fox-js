// ~> Error

module.exports = function(app, db, config) {
  //var sender = require(config.paths.serverLibFolder + "send")(config);

  var fox = require('foxjs'),
      sender = fox.send;
  
  app.all('/*', handleErrors, sender.send);
  app.all('/*', handle404, sender.send);

  function handleErrors(err, req, res, next) {
    next(err);
  }

  function handle404(req, res, next) {
    return next(sender.createError("Method or Request not found.", 404));
  }

};