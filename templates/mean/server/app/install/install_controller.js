// ~> Controller
// ~A Scott Smereka

/* Install Controller
 * Setup the server and database for use.
 *
 * Installation includes loading admin users,
 * user roles, or anthing else required to setup
 * the server for use via the front-end GUI.
 */ 

module.exports = function(app, db, config) {
  
  /* ************************************************** *
   * ******************** Configuration Variables
   * ************************************************** */

  // List of roles will be added to the database with receding permission levels. 
  var roleNames = ['all', 'self', 'superadmin', 'admin', 'moderator', 'user', 'guest'];
  
  // Query name of the super admin account, this should be the account with the
  // highest level of permission.
  var superAdminName = "superadmin";


  /* ************************************************** *
   * ******************** Module Variables
   * ************************************************** */

  var async       = require('async'),      // Async library for processing functions.
      ObjectId    = db.Types.ObjectId,     // Mongo DB object ID.
      debug       = false;

  var fox         = require("foxjs"),      // Fox library
      sender      = fox.send,              // Fox methods for sending responses to requests.
      log         = fox.log,               // Fox methods for logging error and debug information.
      auth        = fox.authentication,    // Fox methods for controlling access to routes and data.
      accessToken = fox.accessToken;       // Fox methods for authorizing users based on access tokens.

  var User        = db.model('User'),      // User model defined by server.
      UserRole    = db.model('UserRole');  // User role model defiend by server.

  var superAdminRole = auth.queryRoleByName("superadmin"),  // Admin role object.
      installKeys    = [ config.installKey ];               // List of keys allowed to perform the install action.

  var allowSuperAdmin = [                                   // Authenticate a call allowing only the super admin or higher roles.
    //accessToken.allow,
    //auth.allowRolesOrHigher([superAdminRole])
  ]


  /* ************************************************** *
   * ******************** Routes
   * ************************************************** */

  /**
   * Install the server & server's database components.
   * Access is limited to a one time call with the 
   * install key.
   */
  app.post('/install.:format', auth.allowKeysOnce(installKeys), install);

  /**
   * Undo the server install and remove any database 
   * components added during install. Access is limited 
   * to the super admin role or higher.
   */
  app.post('/uninstall.:format', allowSuperAdmin, uninstall);

  /**
   * Purge all data in all database collections altered by 
   * the install.  Access is limited to the super admin 
   * role or higher.
   */
  app.post('/purge.:format', allowSuperAdmin, purge);

  /**
   * Purge all data in the database.  Access is limited to
   * the super admin role or higher.
   */
  app.post('/purgeall.:format', allowSuperAdmin, purgeAll);


  /* ************************************************** *
   * ******************** Routes Methods
   * ************************************************** */

  /**
   * Load the server's setup information into the database.
   */
  function install(req, res, next) {
    // Load a list of predefined users to the database.
    addUsersToDatabase(createUserObjects(config), function(err) {
      if(err) {
        return next(err);
      }
      
      // Load all the roles required by the server.
      addUserRolesToDatabase(createUserRoleObjects(config), function(err) {
        if(err) {
          return next(err);
        }

        // Send a successful result to the caller.
        sender.setResponse(sender.createSuccessObject(), req, res, next);
      });
    });
  }

  /**
   * Remove all the setup information from the database.
   */
  function uninstall(req, res, next) {
    // Remove user roles added by install.
    removeInstallUserRoleObjects(function(err) {
      if(err) {
        return next(err);
      }
      
      // Remove users added by install.
      removeInstallUserObjects(function(err) {
        if(err) {
          return next(err);
        }

        // Remove all fading keys.
        dropCollectionByName("fadingkeys");

        // Send a successful result to the caller.
        sender.setResponse(sender.createSuccessObject(), req, res, next);
      });
    });
  }

  /**
   * Purge all collections altered by the install process.
   */
  function purge(req, res, next) {
    // Drop all data in the User Roles collection.
    dropCollectionByName("userroles");

    // Drop all data in the users collection.
    dropCollectionByName("users");

    // Drop all data in the fading keys collection.
    dropCollectionByName("fadingkeys");

    // Send a successful result to the caller.
    sender.setResponse(sender.createSuccessObject(), req, res, next);
  }

  /**
   * Purge all collections in the database.
   */
  function purgeAll(req, res, next) {
    // Loop through and drop all data in all collections in the
    // connected database.
    dropAllCollections(function(err) {
      if(err) {
        return next(err);
      }

      // Send a successful result to the caller.
      sender.setResponse(sender.createSuccessObject(), req, res, next);
    });
  }


  /* ************************************************** *
   * ******************** Private Methods
   * ************************************************** */

  /**
   * Add an array of user schema objects to the database.
   */
  function addUsersToDatabase(users, next) {
    // Loop through each user.
    for(var i = users.length-1; i >=0; --i) {
      // Add the user to the database.
      addToSchema(users[i], function(err, user) {
        if(err) {
          log.e(err, debug);
        } else {
          log.i("Added user ".white + user.email.cyan + " to the database with the ".white + "install key".cyan + " as the password.".white, debug);
          user.createAccessToken({activated:true},function(err){
            if(err) {
              log.e(err, debug);
            }
          });
        }
      });
    }

    if(next) {
      next();
    }
  }

  /**
   * Add access tokens for each user to the database.
   */
  function addAccessTokensToDatabase(next) {

    User.find({}, function(err, users) {
      if(err) {
        if(next) {
          return next(err);
        }
        log.e(err, debug);
      }

      for(var i = 0; i < users.length; i++) {
        users[i].createAccessToken(function(err) {
          if(err) {
            log.e(err, debug);
          }

          log.i("Added access token for user " + users[i].name.white, debug);
        });
      }
      if(next) {
        return next();        
      }
    });
  }

  /**
   * Add an array of user role schema objects to the database.
   */
  function addUserRolesToDatabase(roles, next) {
    var errors;

    // Loop through each role
    for(var i = roles.length-1; i >=0; --i) {

      // Add the role to the database.
      addToSchema(roles[i], function(err, role) {
        if(err) {
          if(errors) {
            errors.push(err);
          } else {
            errors [ err ];
          }
        } else {
          log.i("Added user role ".white+role.name.cyan+" to the database.".white, debug);
        }
      });
    }

    if(next) {
      return next(errors);
    }
  }

  /**
   * Add a schema object to the database.
   */
  function addToSchema(schemaObj, next) {
    schemaObj.save(function(err, newSchemaObj) {
      if(next) {
        return next(err, newSchemaObj);
      }
    });
  }

  /**
   * Remove all data in the specified collection.
   */
  function dropCollectionByName(schema, next) {
    if( ! schema || db.connection.collections[schema.toLowerCase()] === undefined) {
      var err = sender.createError("Cannot drop a collection of " + schema, 500);
      if(next) {
        return next(err);
      }
      log.e(err, debug);
    }

    db.connection.collections[schema.toLowerCase()].drop();
    log.i("Dropped all objects in the ".white + schema.cyan + " collection.".white, debug);

    if(next) {
      next();
    }
  }

  /**
   * Drop all the collections in the connected database.
   */
  function dropAllCollections(next) {
    if(db && db["connection"] && db.connection["collection"]) {
      for(var key in db.connection.collections) {
        if(db.connection.collections[key] !== undefined) {
          log.i("Dropped all objects in the ".white + db.connection.collections[key].collection.collectionName.cyan + " collection.".white, debug);
          db.connection.collections[key].drop();
        }
      }
      if(next) {
        return next();
      }
    } else {
      var err = new Error("Cannot purge database of all collections, connection or collections were undefined.");
      if(next) {
        return next(err);
      }
      log.e(err, debug);
    }
  }

  
  /* ************************************************** *
   * ******************** Install Data
   * ************************************************** */

  // List of object IDs that, at each index, correlate 
  // to the roles described in the roleNames array.
  var roleObjectIds = [];

  /**
   * Create a list of user objects to be loaded into the database.
   * If debug mode is enabled, a user will be installed for each role.
   */
  function createUserObjects(config) {
    // Make sure we have a list of role object IDs.
    if( ! generateRoleObjectIds(roleNames)) {
      return undefined;
    }

    var users = [];
    for(var i = 0; i < roleNames.length; i++) {
      
      // If not in debug mode, then only add the super admin role.
      if( ! debug && roleNames[i] != superAdminName) {
        continue;
      }

      users.push(new User({
        activated: true,
        firstName: roleNames[i],
        email: roleNames[i].replace(/\s+/g, '').toLowerCase() + "@localhost.com",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ roleObjectIds[i] ],
        securityQuestion: 'What is the install key?',
        securityAnswer: config.installKey
      }));
    }
    return users;
  }

  /**
   * Create all the user roles to be added to the database
   * on an install.
   */
  function createUserRoleObjects() {
    // Make sure we have a list of role object IDs.
    if( ! generateRoleObjectIds(roleNames)) {
      return undefined;
    }

    var roles = [];
    for(var i = 0; i < roleNames.length; i++) {
      roles.push(new UserRole({ name: roleNames[i], index: i, _id: roleObjectIds[i] }));
    }
    return roles;
  }

  /**
   * Remove all installed user objects from the database.
   */
  function removeInstallUserObjects(next) {
    var tasks = [];
    
    // Create a list of tasks to find and delete users installed by
    // the installation method.
    for(var i = 0; i < roleNames.length; i++) {
      queueFindAndDeleteFunction(tasks, User, { "firstName" : roleNames[i] });
    }

    // Execute each task and create a list of the results.
    async.parallel(tasks, function(err, results) {
      
      // Loop through the results and report success or failures.
      for(var i=0; i < results.length; i++) {
        if(results[i]) {
          log.i("Removed user ".white +roleNames[i].cyan+ " from database.".white, debug);
        } else {
          log.i("Could ".white+"not".cyan+" remove user ".white +roleNames[i].cyan +" from database.".white, debug);
        }
      }
      next(err);
    });
  }


  /**
   * Remove all installed user role objects from the database.
   */
  function removeInstallUserRoleObjects(next) {
    var tasks = [];

    // Create a list of tasks to find and delete user roles installed by
    // the installation method.
    for(var i = 0; i < roleNames.length; i++) {
      queueFindAndDeleteFunction(tasks, UserRole, { "name" : roleNames[i] });
    }

    // Execute each task and create a list of the results.
    async.parallel(tasks, function(err, results) {

      // Loop through the results and report success or failures.
      for(var i=0; i < results.length; i++) {
        if(results[i]) {
          log.i("Removed user role ".white +roleNames[i].cyan +" from database.".white, debug);
        } else {
          log.i("Could ".white+"not".cyan+" remove user role ".white +roleNames[i].cyan +" from database.".white, debug);
        }
      }
      if(next) {
        next(err);
      } else if(err) {
        log.e(err, debug);
      }
    });
  }

  /**
   * Create a function that finds and deletes an object in 
   * a collection, then adds that function to a queue.
   */
  function queueFindAndDeleteFunction(queue, model, query) {
    // Add a method to find and delete to the queue parameter.
    queue.push(function(next) {

      // Find one object based on the query
      model.findOne(query, function(err, obj) {
        if(err || ! obj) {
          return next(err, false);
        }

        // Remove that object.
        obj.remove(function(err) {
          if(err) {
            return next(err, false);
          }
          return next(undefined, true);
        });
      });
    });
  }

  /**
   * Generate a list of object IDs, one for each role.
   * Each index of the roleobjectIds list correlates to 
   * the roleName at the same index.
   * If the list has already been generated, this method will
   * not regenerate the list.
   */
  function generateRoleObjectIds(roles, next) {
    // If roles is undefined or not an array, generate an error.
    if( ! roles || Object.prototype.toString.call( roles ) !== '[object Array]') {
      var err = sender.createError("Cannot generate role object IDs for an invalid roles array: " + roles, 500);
      if(next) {
        next(err);
      } else {
        log.e(err, debug);
      }
      return false;
    }

    // Check if the role object IDs have already been made.
    if(roleObjectIds && roleObjectIds.length === roles.length) {
      if(next) {
        next();
      }
      return true;
    }

    // Create a new array of object IDs, one for each role.
    roleObjectIds = [];
    for(var i = 0; i < roles.length; i++) {
      roleObjectIds.push(ObjectId());
    }
    if(next) {
      next();
    }
    return true;
  }

}