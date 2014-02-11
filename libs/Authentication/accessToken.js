// ~>Library
// ~A Scott Smereka

/* Access Token
 * Library for handling authentication via tokens.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
 
var fox,          //
    log,          // Handles logging.
    debug,        // Display additional logs when enabled.
    BearerStrategy,  //API Token libary using the Bearer token strategy.
    AccessTokenModel;


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new Access Token library object.
 */
var AccessToken = function(_fox) {
  debug = false;
  fox = _fox;
  log = fox.log;
  BearerStrategy = require('passport-http-bearer').Strategy
}


/* ************************************************** *
 * ******************** Public Methods
 * ************************************************** */

/**
 * Enable the access token passport strategy for authenticaiton.
 */
var enablePassportStrategy = function(db, passport, next) {
  if( ! db) {
    log.e("Cannot load access token passport strategy.");
  }
  AccessTokenModel = db.model("AccessToken");
  passport.use(new BearerStrategy(passportStrategy));

  log.d("Enabled passport access token strategy.", debug);
  next();
}

/**
 * Disable the access token passport strategy for authentication.
 */
var disablePassportStrategy = function(passport, next) {
  next();
}


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/**
 * Strategy for using access tokens, defines the logic 
 * used to allow or deny access.
 *
 * Note: You should use this strategy with the bearer 
 * strategy using:
 * "new BearerStrategy(passportStrategy);"
 */
var passportStrategy = function(possibleToken, next) {
  process.nextTick(function() {
    AccessTokenModel.findOne({tokenHash: possibleToken}).populate('user', 'first_name last_name email roles activated').populate('user.roles').exec(function(err, token) {
      if(err) {
        return next(err);
      } 

      // Check for invalid token.
      if( ! token) {
        //TODO: Log a break in attempt
        return next(new Error('Access token is invalid.'));
      }

      // Check for deactivated user.
      if( ! token.user.activated) {
        return next(new Error('User is deactivated.'));
      }

      // Check for deactivated acess token.
      if( ! token.activated) {
        return next(new Error('User\'s access token is deactivated.'));
      }

      // At this point token is valid.
      return next(undefined, user);
    });
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
AccessToken.prototype.enablePassportStrategy = enablePassportStrategy;
AccessToken.prototype.disablePassportStrategy = disablePassportStrategy;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = AccessToken;

// Reveal the public API.
exports = AccessToken;