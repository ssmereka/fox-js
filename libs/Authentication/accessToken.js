// ~>Library
// ~A Scott Smereka

/* Access Token
 * Library for handling authentication via tokens.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
 
var AccessTokenModel,     // Model for access tokens
    auth,                 // Authentication module.
    BearerStrategy,       // Passport strategy for bearer tokens.
    debug = false,        // Debug flag for this module.
    trace = false,
    db,                   // Database connection.
    fox,                  // Fox module reference.
    log,                  // Logging module reference.
    isEnabled = false,    // Flag for whether or not to use access tokens.
    passport,             // Passport module reference.
    url = require("url"); // Node js url parser module.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new Access Token library object.
 */
var AccessToken = function(_fox) {
  if( ! _fox) {
    console.log("Access Token Module: Failed to load, missing fox module parameter.");
  }

  fox = _fox;
  log = fox.log;

  handleConfig(fox["config"]);
}

/**
 * Setup the module based on the config object.
 */
var handleConfig = function(config) {
  if(config) {
    if(config["system"]) {
      debug = (config.system["debug"]) ? config.system["debug"] : debug;
      trace = (config.system["trace"]) ? config.system["trace"] : trace;
    }
  }
}


/* ************************************************** *
 * ******************** Public Methods
 * ************************************************** */

/**
 * Enable the access token module.  When enabled, all authorization 
 * methods will also check for access tokens as well as sessions.
 */
var enable = function(_db, _passport, _bearerStrategy) {
  if( ! _db) {
    return log.e("Cannot enable access token authentication, database is not defined.");
  }
  db = _db;

  if( ! _passport) {
    _passport = require('passport');

    if( ! _passport) {
      return log.e("Cannot enable access token authentication, passport is not defined.");
    }
  }
  passport = _passport;

  try {
    AccessTokenModel = db.model("AccessToken");
  } catch(err) {
    return log.e("Cannot enable access token authentication, AccessToken schema is not defined.");
  }

  if( ! _bearerStrategy) {
    var _bearer = require('passport-http-bearer');

    if( ! _bearer) {
      return log.e("Cannot enable access token authentication, bearer strategy is not defined.");
    } else {
      _bearerStrategy = _bearerStrategy.Strategy;
    }
  }
  BearerStrategy = _bearerStrategy;
  passport.use('bearer', new BearerStrategy(strategy));
  isEnabled = true;
};

/**
 * Allow a route to be authenticated via an access token.
 * If an access token is presented, it will be verified like a 
 * login attempt.  If the access token is not available, the user 
 * is already authenticated, or access token authentication is turned 
 * off, then this method will do nothing.
 */
var allow = function(req, res, next) {
  // Check if access token is enabled, or for an already 
  // authenticated user.
  if( ! isEnabled || req.isAuthenticated()) {
    return next();
  }
  
  // Check for access_token, if one is not found then move on.
  var queryString = url.parse(req.url, true).query;
  if( ! queryString["access_token"]) {
    return next();
  }

  // Perform authentication via access token strategy.
  return passport.authenticate('bearer', { session: false })(req, res, next);
}



/**
 * Disable the access token passport strategy for authentication.
 */
var disable = function(next) {
  isEnabled = false;
  next();
}

/**
 * Require an access token to access anything beyond this route.
 * If access token is not enable, it will not enforce this requirement.
 */
var requireAccessToken = function() {
  if( ! isEnabled) {
    return next();
  }

  // Perform authentication via access token strategy.
  return passport.authenticate('bearer', { session: false })(req, res, next);
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
    AccessTokenModel.findOne({token: possibleToken}).populate('user', 'first_name last_name email roles activated').populate('user.roles').exec(function(err, token) {
      if(err) {
        return next(err);
      } 

      // Check for invalid token.
      if( ! token) {
        //TODO: Log a break in attempt
        var err = new Error('Access token is invalid.');
        err.status = 403;
        return next(err);
      }

      if( ! token["user"]) {
        var err = new Error("Access token must be assigned to a user.");
        err.status = 403;
        return next(err);
      }

      // Check for deactivated user.
      if( ! token.user.activated) {
        var err = new Error('User is deactivated.');
        err.status = 403;
        return next(err);
      }

      // Check for a valid token
      token.authenticate(function(err) {
        if(err) {
          return next(err);
        }

        // At this point token is valid.
        return next(undefined, token.user);
      });
    });
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
AccessToken.prototype.enable  = enable;
AccessToken.prototype.require = requireAccessToken;
AccessToken.prototype.allow   = allow;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = AccessToken;

// Reveal the public API.
exports = AccessToken;
