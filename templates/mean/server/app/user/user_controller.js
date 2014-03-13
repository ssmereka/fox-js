// ~> Controller
// ~A Scott Smereka

module.exports = function(app, db, config) {
  
  var fox    = require('foxjs'),
      sender = fox.send,
      auth   = fox.authentication,
      model  = fox.model,
      User   = db.model('User');                                     // Pull in the user schema


  /* ************************************************** *
   * ******************** Routes and Permissions
   * ************************************************** */
  
  // Load user roles used for authentication.
  var adminRole = auth.queryRoleByName("admin"),
      selfRole  = auth.queryRoleByName("self");


  /* ************************************************** *
   * ******************** Route Methods
   * ************************************************** */


};