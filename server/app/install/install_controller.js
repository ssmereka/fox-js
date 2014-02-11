// ~> Controller
// ~A Scott Smereka

/* Install Controller
 * Setup the server and database for use.
 */ 

module.exports = function(app, db, config) {
  

  /* ************************************************** *
   * ******************** Module Variables
   * ************************************************** */

  var ObjectId = db.Types.ObjectId,     // Mongo DB Object ID.
      User     = db.model('User'),      // User model defined by server.
      UserRole = db.model('UserRole'),  // User role model defiend by server.
      fox      = require("foxjs"),      // Fox library
      sender   = fox.send,              // Fox methods for sending responses to requests.
      log      = fox.log,               // Fox methods for logging error and debug information.
      auth     = fox.authentication;    // Fox methods for controlling access to routes and data.

  var adminRole   = auth.queryRoleByName("admin"),  // Admin role object.
      installKeys = [ config.installKey ];          // List of keys allowed to perform the install action.

  /* ************************************************** *
   * ******************** Routes
   * ************************************************** */

  // Install the server's database components.
  app.post('/install.:format', auth.allowKeys(installKeys), install);

  // Remove the server's database components.
  app.post('/uninstall.:format', auth.allowRolesOrHigher([adminRole]), uninstall);

  // Purge the database of collections altered by an install.
  app.post('/purge.:format', auth.allowRolesOrHigher([adminRole]), purge);

  // Purge the database of all data so a fresh install can be made.
  app.post('/purgeall.:format', auth.allowRolesOrHigher([adminRole]), purgeAll);


  /* ************************************************** *
   * ******************** Routes Methods
   * ************************************************** */

  /**
   * Load the server's setup information into the database.
   */
  function install(req, res, next) {
    console.log("IN INSTALL");
    loadDatabaseSchema(config, "userRoles", function(err) {
      loadDatabaseSchema(config, "user", function(err) {
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
    removeUsersFromDatabase(createUserObjects(config), function(err) {
      if(err) {
        return sender.sendError(err, req, res, next);
      }
      removeUserRolesFromDatabase(createUserRoleObjects(config), function(err) {
        if(err) {
          return sender.sendError(err, req, res ,next);
        }

        sender.send(true, req, res, next);
      });
    });
  }

  /**
   * Purge all collections altered by the install process.
   */
  function purge() {
    dropCollectionByName("userroles");
    dropCollectionByName("users");
    sender.send(true, req, res, next);
  }

  /**
   * Purge all collections in the database.
   */
  function purgeAll() {
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
      addToSchema(users[i]);
      if( ! next) {
        log.i("Added user ".white + users[i].email.cyan + " to the database with the ".white + "install key".cyan + " as the password.".white);
      }
    }

    if(next) {
      return next();
    }
  }

  /**
   * Remove an array of user schema objects from the database.
   */
  function removeUsersFromDatabase(users, next) {
    for(var i = users.length-1; i >=0; --i) {
      removeFromSchema(users[i]);
      if( ! next) {
        log.i("Removed user "+users[i].email+" from database.");
      }
    }

    if(next) {
      return next();
    }
  }

  /**
   * Add an array of user role schema objects to the database.
   */
  function removeUserRolesFromDatabase(roles, next) {
    for(var i = roles.length-1; i >=0; --i) {
      addToSchema(roles[i]);
      if( ! next) {
        log.i("Added user role "+roles[i].name+" to the database.");
      }
    }

    if(next) {
      return next();
    }
  }

  /**
   * Remove an array of user role schema objects from the database.
   */
  function removeUserRolesFromDatabase(roles, next) {
    for(var i = roles.length-1; i >=0; --i) {
      removeFromSchema(roles[i]);
      if( ! next) {
        log.i("Removed user role "+roles[i].name+" from database.");
      }
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
      if(err) {
        log.e(err);
        if(next !== undefined)
          return next(err);
      }

      if(next !== undefined)
        next(newSchemaObj);
    });
  }

  /**
   * Remove a schema object from the database.
   */
  function removeFromSchema(schemaObj, next) {
    schemaObj.remove(function(err, removedSchemaObj) {
      if(err) {
        if(next) {
          return next(err);
        }

        log.e(err);
      }

      if(next) {
        next(removedSchemaObj);
      }
    });
  }

  /**
   * Remove all data in the specified collection.
   */
  function dropCollectionByName(schema) {
    if(schema !== undefined && db.connection.collections[schema] !== undefined) {
      db.connection.collections[schema].drop();
    }
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

  /**
   * Create all the user roles to be added to the database
   * on an install.
   */
  function createUserRoleObjects(config) {
    var roles = [];

    var i = 0;
    roles.push(new UserRole({ name: 'all',         index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    roles.push(new UserRole({ name: 'self',        index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    
    roles.push(new UserRole({ name: 'super admin', index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    roles.push(new UserRole({ name: 'admin',       index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    roles.push(new UserRole({ name: 'moderator',   index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    roles.push(new UserRole({ name: 'user',        index: i, _id: ObjectId("5000000000000000000000a" + i++) }));
    roles.push(new UserRole({ name: 'guest',       index: i, _id: ObjectId("5000000000000000000000a" + i++) }));

    return roles;
  }

  /**
   * Create all the users to be added to the database on 
   * an install.
   */
  function createUserObjects(config) {
    users = [];
    
    // Super Admin
    users.push(new User({ 
      activated: true,
      email: "superadmin@localhost.com",
      firstName: "Super Admin",
      password: config.installKey,
      securityAnswer: config.installKey,
      roles: [ ObjectId("5000000000000000000000a2") ], 
      security_question: 'What is the install key?' }));
    
    if(config.debugSystem) {
      // Admin
      users.push(new User({ 
        activated: true,
        email: "admin@localhost.com",
        firstName: "Admin",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ ObjectId("5000000000000000000000a3") ], 
        security_question: 'What is the install key?' }));

      // Moderator
      users.push(new User({ 
        activated: true,
        email: "moderator@localhost.com",
        firstName: "Moderator",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ ObjectId("5000000000000000000000a4") ], 
        security_question: 'What is the install key?' }));

      // User
      users.push(new User({ 
        activated: true,
        email: "user@localhost.com",
        firstName: "User",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ ObjectId("5000000000000000000000a5") ], 
        security_question: 'What is the install key?' }));

      // Guest
      users.push(new User({ 
        activated: true,
        email: "guest@localhost.com",
        firstName: "Guest",
        password: config.installKey,
        securityAnswer: config.installKey,
        roles: [ ObjectId("5000000000000000000000a6") ], 
        security_question: 'What is the install key?' }));
    }

    return users;
  }

}