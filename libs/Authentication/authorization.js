// ~>Library
// ~A Scott Smereka

/* Authorization
 * Library for controlling access to the system and resources.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
var fox,
    sanitize,       // Used to check or sanitize a variable for use.
    sender,         // 
    log,            // Handles logging.
    debug,          // Display additional logs when enabled.
    allRoles = [],       //
    allRoleObject,  //
    selfRoleObject; // 


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new authorization library object.
 */
var Authorization = function(_fox) {
  fox = _fox;
  allRoles = [];
  sanitize = require("sanitize-it");
  debug    = (debug === undefined) ? false : debug;
  log      = fox.log;
  sender   = fox.send;
}



//var allRoles = [], allRoleObject, sanitize, selfRoleObject, debug, log, sender, isInit = false;

var permissionDeniedText = "You do not have permission to perform that action.";

/**
 * Check for any reasons why the user would be unauthorized or
 * authorized before we start checking roles.
 */
var checkRolePreconditions = function(req, roles, next) {
  // Check if the user is logged in.
  if( ! req.isAuthenticated() ) {
    log.d("User is not logged in, permission denied.", debug);
    var err = new Error("You must be logged in to perform that action.")
    err.status = 403;
    return next(err);
  }

  // Check if we have any roles to enforce, if we don't then as long as the user is logged in, they are authenticated.
  if(roles === undefined) {
    log.w("allowRoles(): Roles was undefined, permission allowed for all logged in users.");
    return next(undefined, allRoles);
  }

  // Look through all the roles and check for special conditions.
  for(var i = roles.length-1; i >= 0; --i) {
    
    // Check for the "All" role.  The all role automatically
    // gives the logged in user permission to perform the action.
    if(roles[i]._id.equals(allRoleObject._id)) {
      return next(undefined, allRoles, true);
    }

    // Check for the "Self" role.  The self role automatically
    // gives the logged in user permision to perform an action
    // on themselves.
    if(roles[i]._id.equals(selfRoleObject._id)) {
      roles.splice(i,1);
      if(req && req.params && req.params.userId && req.params.userId == req.user._id) {
        log.d("User has been granted permission to perform an action on itself.", debug);
        return next(undefined, allRoles, true);
      }
    }
  }

  return next(undefined, roles);
}

/**
 * Find the role with the lowest permissions in a list of roles
 * and return that index.
 */
var findLowestRole = function(roles) {
  var index = -1,
      lowestRoleIndex = -1,
      roleObjectId;

  // Find the permission level of each user role in the sorted list of all roles.
  for(var x = roles.length-1; x >= 0; --x) {
    roleObjectId = (roles[x]._id) ? roles[x]._id : roles[x];
    for(var y = allRoles.length-1; y >=0; --y) {
      if(allRoles[y]._id.equals(roleObjectId)) {
        index = y;
        break;
      }
    }

    // If the role is valid and the lowest permission found so far, store that as the lowest.
    if(index <= -1) {
      log.w("Role " + roles[x].cyan + " does not exist.");
    } else if(index > lowestRoleIndex) {
      lowestRoleIndex = index;
    }
  }

  // Return the lowest permission's index in the list of all roles.
  return lowestRoleIndex;
}

/**
 * Find the role with the highest permissions in a list of 
 * roles and return that index.
 */
var findHighestRole = function(roles) {
  var index = -1,
      highestRoleIndex = allRoles.length,
      roleObjectId;

  // Find the permission level of each user role in the sorted list of all roles.
  for(var x = roles.length-1; x >= 0; --x) {
    roleObjectId = (roles[x]._id) ? roles[x]._id : roles[x];
    for(var y = allRoles.length-1; y >=0; --y) {
      if(allRoles[y]._id.equals(roleObjectId)) {
        index = y;
        break;
      }
    }

    // If the role is valid and the highest permission found so far, store that as the highest.
    if(index <= -1) {
      log.w("Role " + roles[i].cyan + " does not exist.");
    } else if(index < highestRoleIndex) {
      highestRoleIndex = index;
    }
  }

  // Return the highest permission's index in the list of all roles.
  return highestRoleIndex;
}


/**
 * Find a role by the query name synchronously.  If the role
 * is not found, undefined is returned.
 * 
 * Note: This does not hit the database and uses a catched list
 * generated from the start of the server.
 */
var queryRoleByName = function(roleQueryName, next) {
  for(var i = allRoles.length-1; i >= 0; --i) {
    if(allRoles[i].queryName == roleQueryName) {
      if(next) {
        return next(undefined, allRoles[i]);
      }
      return allRoles[i];
    }
  }

  var err = new Error("Role with query name " + roleQueryName + " was not found.");
  log.d("Role with query name " + roleQueryName.cyan + " was not found.");

  if(next) {
    return next(err);
  }
  return undefined;
};

/**
 * Only allow logged in users to continue on.  All non-authenticated
 * users will be shown an error.
 */
var allowAllRoles = function () {
  return allowRoles[true] || (allowRoles[true] = function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    return sender.createAndSendError(permissionDeniedText, 403, req, res, next);
  });
};

/**
 * Allow all roles in a list to proceed.  All other users will be 
 * shown an error.
 *
 * Note: Special roles 'all' and 'self' will all all user to proceed
 * if they meet the special conditions.
 */
var allowRoles = function(roles) {
  return allowRoles[roles] || (allowRoles[roles] = function(req, res, next) {
    // Check all preconditions for user role comparisons.
    checkRolePreconditions(req, roles, function(err, roles, override) {
      if(err) {
        return next(err, req, res, next);
      }

      // Check if role authentication should be enforced.  Some
      // preconditions, such as allowing all roles, will allow
      // all logged in users to be authenticated.
      if(override) {
        return next();
      }

      // A user's roles property can be populated, so we most locate
      // where the object ID is, this variable will store the result.
      var userRoleId;

      // Check if the user has any of the authorized roles.
      for(var x = roles.length-1; x >= 0; --x) {
        for(var y = req.user.roles.length-1; y >= 0; --y) {
          userRoleId = (sanitize.objectId(req.user.roles[y])) ? req.user.roles[y] : req.user.roles[y]._id;  //TODO: Test 'else' condition.
          if(roles[x]._id.equals(userRoleId)) {
            return next();
          }
        }
      }

      // If the user does not have any of the authorized roles, then do not allow them any further.
      log.d("Permission denied, user does not contain an allowed role.", debug);
      sender.createAndSendError(permissionDeniedText, 403, req, res, next);
    });
  });
};


/**
 * Allow any role in the list, as well as all roles higher than the 
 * lowest role in the list to proceed.  All other users will be 
 * shown an error.
 *
 * Note: Special roles 'all' and 'self' will all all user to proceed
 * if they meet the special conditions.
 */
function allowRolesOrHigher(roles) {
  return allowRolesOrHigher[roles] || (allowRolesOrHigher[roles] = function(req, res, next) {
    // Check all preconditions for user role comparisons.
    checkRolePreconditions(req, roles, function(err, roles, override) {
      if(err) {
        return next(err, req, res, next);
      }

      // Check if role authentication should be enforced.  Some
      // preconditions, such as allowing all roles, will allow
      // all logged in users to be authenticated.
      if(override) {
        return next();
      }

      // A user's roles property can be populated, so we most locate
      // where the object ID is, this variable will store the result.
      var userRoleId;

      // Find the role with the lowest permissions.
      var index = findLowestRole(roles);

      // Check if the user has the lowest role, or higher.
      for(var x = 0; x <= index; x++) {
        for(var y = req.user.roles.length-1; y >= 0; --y) {
          userRoleId = (req.user.roles[y]._id) ? req.user.roles[y]._id : req.user.roles[y];
          if(allRoles[x]._id.equals(userRoleId)) {
            return next();
          }
        }
      }

      // If the user does not have any of the authorized roles, then do not allow them any further.
      log.d("Permission denied, user does not contain an allowed role.", debug);
      sender.createAndSendError(permissionDeniedText, 403, req, res, next);
    });
  });
}


/**
 * Allow any role in the list, as well as all roles lower than the 
 * highest role in the list to proceed.  All other users will be 
 * shown an error.
 *
 * Note: Special roles 'all' and 'self' will all all user to proceed
 * if they meet the special conditions.
 */
function allowRolesOrLower(roles) {
  return allowRolesOrLower[roles] || (allowRolesOrLower[roles] = function(req, res, next) {
    // Check all preconditions for user role comparisons.
    checkRolePreconditions(req, roles, function(err, roles, override) {
      if(err) {
        return next(err, req, res, next);
      }

      // Check if role authentication should be enforced.  Some
      // preconditions, such as allowing all roles, will allow
      // all logged in users to be authenticated.
      if(override) {
        return next();
      }

      // A user's roles property can be populated, so we most locate
      // where the object ID is, this variable will store the result.
      var userRoleId;

      // Find the role with the highest permissions.
      var index = findHighestRole(roles);
      
      // Check if the user has the highest role, or lower.
      for(var x = allRoles.length-1; x >= index; x--) {
        for(var y = req.user.roles.length-1; y >= 0; --y) {
          userRoleId = (req.user.roles[y]._id) ? req.user.roles[y]._id : req.user.roles[y];
          if(allRoles[x]._id.equals(userRoleId)) {
            return next();
          }
        }
      }

      // If the user does not have any of the authorized roles, then do not allow them any further.
      log.d("Permission denied, user does not contain an allowed role.", debug);
      sender.createAndSendError(permissionDeniedText, 403, req, res, next);
    });
  });
}


var denyAllRoles = function() {

};

var denyRoles = function() {

};

var denyRolesOrHigher = function() {

};

var denyRolesOrLower = function() {

};


var refreshCachedRoles = function(db, next) {
  var UserRole = db.model('UserRole');

  UserRole.find({}).sort({index: 1}).exec(function(err, _allRoles) {
    if(err) {
      next(err);
    } else if(! _allRoles) {
      next(undefined, []);
    } else {

      // Set the list of available roles for the library.
      allRoles = _allRoles;

      UserRole.findOne( {queryName: "all" }, function(err, _allRoleObject) {
        if(err) {
          next(err);
        }
        
        // Set a role that indicates all roles have permission.
        allRoleObject = _allRoleObject;

        UserRole.findOne( {queryName: "self" }, function(err, _selfRoleObject) {
          if(err) {
            next(err);
          }

          // Set the role that indicates a user has permission to perform an action on themselves.
          selfRoleObject = _selfRoleObject;

          next(undefined, _allRoles);
        });
      });
    }
  });
}


Authorization.prototype.queryRoleByName = queryRoleByName;
Authorization.prototype.allowAllRoles = allowAllRoles;
Authorization.prototype.allowRoles = allowRoles;
Authorization.prototype.allowRolesOrHigher = allowRolesOrHigher;
Authorization.prototype.allowRolesOrLower = allowRolesOrLower;
Authorization.prototype.refreshCachedRoles = refreshCachedRoles;
Authorization.prototype.denyAllRoles = denyAllRoles;
Authorization.prototype.denyRoles = denyRoles;
Authorization.prototype.denyRolesOrHigher = denyRolesOrHigher;
Authorization.prototype.denyRolesOrLower = denyRolesOrLower;

exports = module.exports = Authorization;
exports = Authorization;