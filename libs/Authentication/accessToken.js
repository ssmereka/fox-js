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
    isEnabled,
    AccessTokenModel,
    sender,
    db,
    passport;


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
  sender = fox.send;
  isEnabled = false;
}


/* ************************************************** *
 * ******************** Public Methods
 * ************************************************** */

var enable = function(_db, _passport, _bearerStrategy) {
  if( ! _db) {
    log.e("Cannot enable access token authentication, database is not defined.");
    return;
  }
  db = _db;

  if( ! _passport) {
    _passport = require('passport');

    if( ! _passport) {
      log.e("Cannot enable access token authentication, passport is not defined.");
      return;
    }
  }
  passport = _passport;

  if( ! _bearerStrategy) {
    _bearerStrategy = require('passport-http-bearer').Strategy

    if( ! _bearerStrategy) {
      log.e("Cannot enable access token authentication, bearer strategy is not defined.");
      return;
    }
  }
  BearerStrategy = _bearerStrategy;
  AccessTokenModel = db.model("AccessToken");
  passport.use('bearer', new BearerStrategy(strategy));
  isEnabled = true;
};

var authenticate = function(req, res, next) {
  if(isEnabled) {
    return passport.authenticate('bearer', { session: false })(req, res, next);
  } else {
    enable(req, res, next);
  }
}


/**
 * Disable the access token passport strategy for authentication.
 */
var disable = function(next) {
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
var strategy = function(possibleToken, next) {
  process.nextTick(function() {
    AccessTokenModel.findOne({tokenHash: possibleToken}).populate('user', 'first_name last_name email roles activated').populate('user.roles').exec(function(err, token) {
      if(err) {
        return next(err);
      } 

      // Check for invalid token.
      if( ! token) {
        //TODO: Log a break in attempt
        //TODO: Return error as 403 not 500
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
      return next(undefined, token.user);
    });
  });
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
AccessToken.prototype.enable = enable;
AccessToken.prototype.allow = authenticate;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = AccessToken;

// Reveal the public API.
exports = AccessToken;