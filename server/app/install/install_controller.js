// ~> Controller
// ~A Scott Smereka

/* Install Controller
 * Setup the server and database for use.
 */ 

module.exports = function(app, db, config) {
  

  /* ************************************************** *
   * ******************** Module Variables
   * ************************************************** */

  var async       = require('async'),      // Async library for processing functions.
      ObjectId    = db.Types.ObjectId;     // Mongo DB object ID.

  // Fox framework
  var fox         = require("foxjs"),      // Fox library
      sender      = fox.send,              // Fox methods for sending responses to requests.
      log         = fox.log,               // Fox methods for logging error and debug information.
      auth        = fox.authentication,    // Fox methods for controlling access to routes and data.
      accessToken = fox.accessToken;       // Fox methods for authorizing users based on access tokens.

  // Database models
  var User        = db.model('User'),      // User model defined by server.
      UserRole    = db.model('UserRole');  // User role model defiend by server.

  // Authentication variables and methods.
  var superAdminRole   = auth.queryRoleByName("superadmin"),  // Admin role object.
      installKeys = [ config.installKey ];          // List of keys allowed to perform the install action.

  // Routes for authenticating an admin user via session or access token.
  var allowSuperAdmin = [ 
    accessToken.allow,
    auth.allowRolesOrHigher([superAdminRole])
  ]


  /* ************************************************** *
   * ******************** Routes
   * ************************************************** */

  // Install the server's database components.
  app.post('/install.:format', auth.allowKeysOnce(installKeys), install);

  // Remove the server's database components.
  app.post('/uninstall.:format', allowSuperAdmin, uninstall);

  // Purge the database of collections altered by an install.
  app.post('/purge.:format', allowSuperAdmin, purge);

  // Purge the database of all data so a fresh install can be made.
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
        return sendError(err, req, res, next);
      }
      
      // Load all the roles required by the server.
      addUserRolesToDatabase(createUserRoleObjects(config), function(err) {
        if(err) {
          return sendError(err, req, res, next);
        }
        sender.send(true, req, res, next);
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
        return sender.sendError(err, req, res, next);
      }
      
      // Remove users added by install.
      removeInstallUserObjects(function(err) {
        if(err) {
          return sender.sendError(err, req, res, next);
        }

        // Remove all fading keys.
        dropCollectionByName("fadingkeys");

        sender.send(true, req, res, next);
      });
    });
  }

  /**
   * Purge all collections altered by the install process.
   */
  function purge(req, res, next) {
    dropCollectionByName("userroles");
    dropCollectionByName("users");
    sender.send(true, req, res, next);
  }

  /**
   * Purge all collections in the database.
   */
  function purgeAll(req, res, next) {
    dropAllCollections(function(err) {
      if(err) {
        return sender.sendError(err, req, res ,next);
      }

      sender.send(true, req, res, next);
    });
  }


  /* ************************************************** *
   * ******************** Private Methods
   * ************************************************** */

  /**
   * Add an array of user schema objects to the database.
   */
  function addUsersToDatabase(users, next) {
    for(var i = users.length-1; i >=0; --i) {
      addToSchema(users[i], function(err, user) {
        if(err) {
          log.e(err);
        } else {
          log.i("Added user ".white + user.email.cyan + " to the database with the ".white + "install key".cyan + " as the password.".white);
        }
      });
    }

    if(next) {
      return next();
    }
  }

  /**
   * Add an array of user role schema objects to the database.
   */
  function addUserRolesToDatabase(roles, next) {
    for(var i = roles.length-1; i >=0; --i) {
      addToSchema(roles[i], function(err, role) {
        if(err) {
          log.e(err);
        } else {
          log.i("Added user role ".white+role.name.cyan+" to the database.".white);
        }
      });
    }

    if(next) {
      return next();
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

      if(err) {
        log.e(err);
      }
    });
  }

  /**
   * Remove all data in the specified collection.
   */
  function dropCollectionByName(schema) {
    if(schema) {
      schema = schema.toLowerCase();
      if(db.connection.collections[schema] !== undefined) {
        db.connection.collections[schema].drop();
        log.i("Removed all objects in schema ".white + schema.cyan);
        return;
      } 
    }

    log.e("Cannot drop collection " + schema);
  }

  /**
   * Drop all the collections in the connected database.
   */
  function dropAllCollections(next) {
    if(db && db["connection"] && db.connection["collections"]) {
      for(var i = db.connection.collections.length-1; i >=0; --i) {
        db.connection.collections[i].drop();
      }

      if(next) {
        return next();
      }
    } else {
      var err = new Error("Cannot purge database of all collections, connection or collections were undefined.");
      if(next) {
        return next(err);
      }
      log.e(err);
    }
  }

  
  /* ************************************************** *
   * ******************** Install Data
   * ************************************************** */

  // List of roles will be added to the database with receding permission levels. 
  var roleNames = ['all', 'self', 'superadmin', 'admin', 'moderator', 'user', 'guest'];
  //TODO: Handle a role list over 10 roles long.  Currently object id generation is 
  //      based on the list being from 0 - 10 long.
  
  // Query name of the server admin account.
  var superAdminName = "superadmin";

  /**
   * Create a list of user objects to be loaded into the database.
   * If debug mode is enabled, a user will be installed for each role.
   */
  function createUserObjects(config) {
    users = [];
    for(var i = 0; i < roleNames.length; i++) {
      // If not in debug mode, then only add the super admin role.
      if( ! config.debugSystem && roleNames[i] != superAdminName) {
        continue;
      }

      users.push(new User({
        activated: true,
        firstName: roleNames[i],
        email: roleNames[i].replace(/\s+/g, '').toLowerCase() + "@localhost.com",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ ObjectId("5000000000000000000000a" + i) ],
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
    var roles = [];
    for(var i = 0; i < roleNames.length; i++) {
      roles.push(new UserRole({ name: roleNames[i], index: i, _id: ObjectId("5000000000000000000000a" + i) }));
    }
    return roles;
  }

  /**
   * Remove all installed user objects from the database.
   */
  function removeInstallUserObjects(next) {
    var tasks = [];
    for(var i = 0; i < roleNames.length; i++) {
      queueFindAndDeleteFunction(tasks, User, { "firstName" : roleNames[i] });
    }

    async.parallel(tasks, function(err, results) {
      for(var i=0; i < results.length; i++) {
        if(results[i]) {
          log.i("Removed user ".white +roleNames[i].cyan+ " from database.".white);
        } else {
          log.i("Could ".white+"not".cyan+" remove user ".white +roleNames[i].cyan +" from database.".white);
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
    for(var i = 0; i < roleNames.length; i++) {
      queueFindAndDeleteFunction(tasks, UserRole, { "name" : roleNames[i] });
    }

    async.parallel(tasks, function(err, results) {
      for(var i=0; i < results.length; i++) {
        if(results[i]) {
          log.i("Removed user role ".white +roleNames[i].cyan +" from database.".white);
        } else {
          log.i("Could ".white+"not".cyan+" remove user role ".white +roleNames[i].cyan +" from database.".white);
        }
      }
      if(next) {
        next(err);
      } else if(err) {
        log.e(err);
      }
    });
  }

  /**
   * Create a function that finds and deletes an object in 
   * a collection, then adds that function to a queue.
   */
  function queueFindAndDeleteFunction(queue, model, query) {
    queue.push(function(next) {
      model.findOne(query, function(err, obj) {
        if(err || ! obj) {
          return next(err, false);
        }

        obj.remove(function(err) {
          if(err) {
            return next(err, false);
          }
          return next(undefined, true);
        });
      });
    });
  }

}