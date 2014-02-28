# Fox JS 

Light-framework and boilerplate code to quickly build scalable web apps using javascript.  The backend is a standalone node server with authenticaiton, users, and anything else all API's need.  The frontend is a standalone angular framework already setup to communicate with the backend.

**Current Status:** In Development.

# Getting Started

1. Install fox-js

    `sudo npm -g install foxjs`

2. Create and start a new project.

   `fox new "My Project Name"`
    
Your server is now started and you can start coding.  As you save changes the server will automatically restart!

<a name="cliIndex" />
## Command Line Interface
* [Commands]()
* [Enviorment Modes]()
* [Options]()

<a name="libraryIndex" />
## Server Libraries

* [Access Token](#libraryAccessToken) - API authentication tokens
* [Authorization](#libraryAuthorization) - Authorization authenticated users with user roles.
* [Config](#libraryConfig) - Methods to help configure the server.
* [Cryptography](#libraryCryptography) - Portable crypto methods for keeping data safe.
* [Date](#libraryDate) - Utility method for working with javascript dates.
* [Load](#libraryLoad) - Load models and controllers in the correct order and start your server.
* [Log](#libraryLog) - Utility to help log messages.
* [Message](#libraryMessage) - Handle control messages sent to your server from the command line or other.
* [Model](#libraryModel) - Utility and helper methods to make working with schema models easier.
* [Send](#librarySend) - Respond to a request in a uniform way.  Also helper methods for sending things, like email.


<a name="configIndex" />
## Server Config

* [CRUD](#configCrud) - Auto generated create, read, update, and delete methods
    * [Authorization](#configCrudAuth) - Auth for generated crud methods.
    * [Query](#configCrudQuery) - Query lookups for generated crud methods.
    * [Method](#configCrudMethod) - Schema methods for generated crud methods.
* [Express](#configExpress)
* [Paths](#configPaths)
* [Mongo DB](#configMongoDb)
* [Routes](#configRoutes)
* [System](#configSystem)

<a name="cli" />
# Command Line Interface

You can control your server using the command line interface.  After fox is installed, you can type fox to show a list of commands.
```bash
info: Usage:  fox <command> <options>

info: Commands:
info:   new <name>               Create a new server with a specified name.
info:   start                    Start the server.
info:   stop                     Stop the server.
info:   restart                  Restart the server.
info:   reload                   Restart the server with zero downtime.
info:   clear                    Stop the server and clear all logs and history.
info:   logs                     Show server logs

info: Options:
info:   -v                       Enable verbose or debug mode.
info:   -n                       Start server using plain old node.js and local mode.
info:   -l                       Start in local environment mode.
info:   -d                       Start in development environment mode.
info:   -p                       Start in production environment mode.

info: Info:
info:   Author                   Scott Smereka
info:   Version                  0.1.0
```
[Back to Index](#cliIndex)

<a name="config" />
# Config

// TODO: Description of config file.

<a name="configCrud" />
## CRUD Config

Create, read, update, and delete routes can be automagically created for any schema model defined by your server.  Each route can contain authorization, a query, and a schema method or operation.  Each route can be individually configured or you can just leave it with the default settings.  The position of the route, when the route will be executed, can also be configured.  The generation of CRUD routes should save you the hassel of laying a bunch of ground work before you can get started with your real project needs.  The next few sections explain all the ways you can configure the CRUD routes to your liking.

<a name="configCrudAuth" />
### Authorization
Authorization ensures only specific users have access to the CRUD routes that are created.  Like all configurations a default configuration exists and can be overriden.  Authorization can be based on a user's role, simply whether or not the user is logged in, or turned off completely.

The default config object can be found [here](https://github.com/ssmereka/fox-js/blob/master/libs/Config/config.js).

#### Authorization Properties
Description of the first level of auth configurable properties.

| Property Name | Description | Value Type |
| --- | --- | --- |
| enabled | Enable/disable all authorization for generated CRUD methods. | boolean |
| ignoreHandledRequests | When enabled, forces the authorization routes to ignore requests that have already been handled by previous routes. | boolean |
| name | A string used to place the authorization route in the routes array.  This allows you to place the authorization step where ever you want it in your chain of routes. | string |
| routeRoleAuth | An object to configure authorization based on the schema and its methods. | Object |

```js
crud: {
    auth: {
        enabled: true,
        ignoreHandledRequests: true,
        name: "crud-auth",
        routeRoleAuth: {
            // TODO:  Place non-default authorization configs here...
        }
    }
}
```

##### Route Role Authorization Properties
You can configure authorization for each schema and for each schema method.  For example, you can configure the user schema "read" and "update" routes to be more permissive than its other routes.  Each property of the routeRoleAuth object has the name of a schema as the key and an object as its value.  Each property listed gives the named schema special authorization settings.  An exception to this rule is the word "default" whose configurations are applied to all schemas without special authorization settings.  The object value contains properties for each different type of method such as read, update, create, etc.

| routeRoleAuth Properties | Description | Value Type |
| --- | --- | --- |
| schemaName | An all lowercase name that matches a schema object defined by the server. | Object |
| "default" | A special case where all configurations are applied by default to all schemas who do not have special cases listed in the config object. | Object |

The property key/value pairs in the schemaName object identify authorization rules for each CRUD method.  Each method that you define overrides the default method for that schema type.  For example if you only provide read and update configurations, then create, delete, readAll, and etc. are not affected.  Here is a list of possible property values.

| schemaName Properties | Description | Value Type |
| --- | --- | --- |
| read | Reading a single object of a single schema type.  For example getting a user by ID. | Object |
| readAll | Reading multiple objects of a single schema type.  For example getting all users. | Object |
| create | Create a single object of a single schema type. For example creating a new user. | Object |
| update | Update a single object of a single schema type.  For example updating a user by ID. | Object |
| updateAll | Update all object of a single schema type.  For example updating all users with newly generated api tokens. | Object |
| remove | Remove a single object of a single schema type.  For example removing a user by ID from the database. | Object |
| removeAll | Remove all objects of a single schema type.  For example removing all users from the database. | Object |

```js
crud: {
    auth: {
        routeRoleAuth: {
            "user": {
                read: {
                    // TODO: Define more permissive read options.
                },
                update: {
                    // TODO: Define more permissive update options.
                }
            },
            "default": {
                create:     { /* TODO: Define default options here */ },
                remove:     { /* TODO: Define default options here */ },
                removeAll:  { /* TODO: Define default options here */ },
                read:       { /* TODO: Define default options here */ },
                readAll:    { /* TODO: Define default options here */ },
                update:     { /* TODO: Define default options here */ },
                udpateAll:  { /* TODO: Define default options here */ }
            },
        }
    }
}
```

The value of every schema method property is another object that defines the authorization rules for that method.

| Method Properties | Description | Value Type |
| --- | --- | --- |
| enabled | Turn on/off authorization for a schema's method. | Boolean |
| method | Describes how to authorize a request based on a user's role. See the table below. | String |
| roles | The roles that are evaluated by the authorization method. |

**Method**
There are several methods to authorize a request.  Each method takes in and evaluates the roles property value.
| Method Options | Description |
| --- | --- |
| ">" | Roles greater than the lowest role list are authorized. |
| ">=" | Roles greater than or equal to the lowest role listed are authorized. |
| "!>=" | Roles less than the lowest role are authorized. |
| "<" | Roles less than the highest role are authorized. |
| "<=" | Roles less than or equal to the highest role are authorized. |
| "!<=" | Roles greater than the highest role are authorized. |
| "==" | Roles equal to any of the roles are authorized. |
| "!=" | Roles not equal to any of the roles are authorized. |

```js
crud: {
    auth: {
        enabled: true,
        ignoreHandledRequests: true,
        name: "crud-auth",
        routeRoleAuth: {
            "user": {
                read: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin", "self" ]
                },
                update: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin", "self" ]
                }
            },
            "default": {
                create: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                },
                remove: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                },
                removeAll: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                },
                read: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                },
                readAll: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                },
                update: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                }
                udpateAll: {
                    enabled: true,
                    method: ">=",
                    roles: [ "admin" ]
                }
            },
        }
    }
}
```

[Back to Config Index](#configIndex)

<a name="configCrudQuery" />
### Query

[Back to Config Index](#configIndex)

<a name="configCrudMethod" />
### Method

[Back to Config Index](#configIndex)



<a name="libraryAccessToken" />
## Access Token

<a name="libraryAuthorization" />
## Authorization

<a name="AuthorizationMethods" />
### Methods
* [Allow Roles](#authorizationAllowRoles)
* [Allow All Roles](#authorizationAllowAllRoles)
* [Allow Roles or Higher](#authorizationAllowRolesOrHigher)
* [Allow Roles or Lower](#authorizationAllowRolesOrLower)
* [Allow Higher Roles](#authorizationAllowHigherRoles)
* [Allow Lower Roles](#authorizationAllowLowerRoles)
* [Allow Keys](#authorizationAllowKeys)
* [Allow Keys Once](#authorizationAllowKeysOnce)
* [Deny Roles](#authorizationDenyRoles)
* [Deny All Roles](#authorizationDenyAllRoles)
* [Deny Roles or Higher](#authorizationDenyRolesOrHigher)
* [Deny Roles or Lower](#authorizationDenyRolesOrLower)
* [Deny Higher Roles](#authorizationDenyHigherRoles)
* [Deny Lower Roles](#authorizationDenyLowerRoles)
* [Refresh Cached Roles](#authorizationRefreshCachedRoles)

[Back to Libraries](#libraryIndex)

---------------------------------------
<a name="authorizationAllowRoles" />
### allowRoles(roles)

Creates a route method allowing only users with specific user roles to perform further actions.  If a user does not have a role listed in the roles list, then they will receive a permission denied error.

A route method should be placed in an express route where it accepts paramters for request, response, and next.

__Arguments__

* roles is an array, or object, of user role schema object(s) that are authorized to proceed.

__Example__
```js
module.exports = function(app, db, config) {
    var fox = require("foxjs"),     // Require foxjs module.
        sender = fox.send,          // Grab the send library.
        auth = fox.auth;            // Grab the authorization library.
        
    var Users = db.model("Users");  // Grab the user model
    
    // Lookup the admin role by query name.
    var adminRole = auth.queryRoleByName("admin");

    // Add a route where an authenticated admin user can lookup all the users.
    app.get("/users.json", auth.allowRoles(adminRole), users);

    // Users route method to return all users.
    function users(req, res, next) {
        // Because of allowAllRoles() only authenticated admin users can reach this method.
    
        // Query for all users.
        Users.find({}, function(err, users) {
            // Pass errors along...
            if(err) {
                return next(err);
            }
                
            // Send the result to the caller.
            sender.send(users, req, res, next);
        });
    }
}
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowAllRoles" />
### allowAllRoles()

Creates a route method that allows all authenticated users to proceed.  An unauthenticated user will receive a permission denied error.

A route method should be placed in an express route where it accepts paramters for request, response, and next.

__Arguments__

No arguments accepted.

__Example__
```js
module.exports = function(app, db, config) {
    var fox = require("foxjs"),     // Require foxjs module.
        sender = fox.send,          // Grab the send library.
        auth = fox.auth;            // Grab the authorization library.

    // Grab the user model
    var Users = db.model("Users");

    // Add a route where an authenticated user can lookup all the users.
    app.get("/users.json", auth.allowAllRoles(), users);

    // Users route method to return all users.
    function users(req, res, next) {
        // Because of allowRoles() only authenticated users can reach this method.
    
        // Query for all users.
        Users.find({}, function(err, users) {
            // Pass errors along...
            if(err) {
                return next(err);
            }
                
            // Send the result to the caller.
            sender.send(users, req, res, next);
        });
    }
}

```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowRolesOrHigher" />
### allowRolesOrHigher(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowRolesOrLower" />
### allowRolesOrLower(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowHigherRoles" />
### allowHigherRoles(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowLowerRoles" />
### allowLowerRoles(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowKeys" />
### allowKeys(keys)

__Arguments__

* keys is an array, or object, of fading key schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationAllowKeysOnce" />
### allowKeysOnce(keys)

__Arguments__

* keys is an array, or object, of fading key schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyRoles" />
### denyRoles(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are not authorized to proceed.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyAllRoles" />
### denyAllRoles(roles)

__Arguments__

No arguments accepted.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyRolesOrHigher" />
### denyRolesOrHigher(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyRolesOrLower" />
### denyRolesOrLower(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyHigherRoles" />
### denyHigherRoles(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationDenyLowerRoles" />
### denyLowerRoles(roles)

__Arguments__

* roles is an array, or object, of user role schema object(s) that are evaluated to allow or deny access to users.

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------
<a name="authorizationRefreshCachedRoles" />
### refreshCachedRoles()

__Arguments__

__Example__
```js
```
[Back to Authorization Methods](#authorizationMethods)

---------------------------------------


<a name="libraryConfig" />
## Config

[Back to Libraries](#libraryIndex)

<a name="libraryCryptography" />
## Cryptography

Simplifies encryption and decryption of data while also providing helper methods for common cryptography tasks.

<a name="cryptographyMethods" />
### Methods
* [Hash](#cryptographyHash)
* [Hash Synchronous](#cryptographyHashSync)
* [Generate Key](#cryptographyGenerateKey)
* [Generate Key Synchronous](#cryptographyGenerateKeySync)
* [Generate Hashed Key](#cryptographyGenerateHashedKey)
* [Generate Hashed Key Synchronous](#cryptographyGenerateHashedKeySync)

[Back to Libraries](#libraryIndex)

---------------------------------------
<a name="cryptographyHash" />
### hash(string, rounds, next)

Hash a string asynchronously using a salt and number of salt rounds.  If salt rounds are not specified, then the default number of rounds will be used.

Before storing sensitive user information, like a password, you should first hash the string.  

__Arguments__
* string - a string to be hashed.
* rounds - number of hashing rounds to perform. (optional)
* next - callback for the send method. (optional)

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setUserPassword(user, password, next) {
    // Hash the user's new password
    crypto.hash(password, 10, function(err, hash){
        // Check for and return any errors.
        if(err) {
            return next(err);
        }
        
        user.password = hash;  // Set the new password
        user.save();           // Save the updated user.
        next();                // Call the callback.
    });
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------
<a name="cryptographyHashSync" />
### hashSync(string, rounds)

Hash a string synchronously using a salt and number of salt rounds.  If salt rounds are not specified, then the default number of rounds will be used.

Before storing sensitive user information, like a password, you should first hash the string.  

__Arguments__
* string - a string to be hashed.
* rounds - number of hashing rounds to perform. (optional)

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setUserPasswordSync(user, password) {
    // Hash the user's new password
    var hashedPassword = crypto.hash(password, 10);
    
    // Check for any errors that may have occurred.
    if( ! hashedPassword) {
        return false;
    }
    
    user.password = hash;   // Set the new password
    user.save();            // Save the updated user.
    return true;            // Return the result.
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------
<a name="cryptographyGenerateKey" />
### generateKey(keyLength, next)

Asynchronously generate a random string key of a given length.

__Arguments__
* keyLength - length of the string key to be generated.
* next - callback for the send method. (optional)

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setUserResetPasswordToken(user, next) {
    // Create a random key and hash it.
    crypto.generateKey(24, function(err, hash) {
        
        // Check for and return any errors.
        if(err) {
            return next(err);
        }
        
        user.resetPasswordToken = hash;  // Set the new reset password token
        user.save();                     // Save the updated user.
        next(undefined, hash);           // Return the generated key in the callback.
    });
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------
<a name="cryptographyGenerateKeySync" />
### generateKeySync(keyLength, next)

Synchronously generate a random string key of a given length.

__Arguments__
* keyLength - length of the string key to be generated.

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setUserResetPasswordTokenSync(user) {
    // Create a random key and hash it.
    var hash = crypto.generateKey(24);
    
    // Check for errors.
    if( ! hash) {
        return undefined;
    }
        
    user.resetPasswordToken = hash;   // Set the new password
    user.save();            // Save the updated user.
    return hash;            // Return the generated key.
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------
<a name="cryptographyGenerateHashedKey" />
### generateHashedKey(keyLength, next)

Asynchronously generate a random string key of a given length, then hash that key and return the results.

__Arguments__
* keyLength - length of the string key to be generated.
* next - callback for the send method. (optional)

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setDefaultUserPassword(user, next) {
    // Create a random key and hash it.
    crypto.generateHashedKey(24, function(err, hash) {
    
        // Check for and return any errors.
        if(err) {
            return next(err);
        }
        
        user.password = hash;  // Set the new password
        user.save();           // Save the updated user.
        next();                // Call the callback.
    });
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------
<a name="cryptographyGenerateHashedKeySync" />
### generateHashedKeySync(keyLength)

Synchronously generate a random string key of a given length, then hash that key and return the results.

__Arguments__
* keyLength - length of the string key to be generated.

__Example__
```js
var crypto = fox.crypto;  // Load the crypto library.

function setDefaultUserPassword(user) {
    // Create a random key and hash it.
    var hash = crypto.generateHashedKey(24);
    
    // Check for errors.
    if( ! hash) {
        return false;
    }
        
    user.password = hash;   // Set the new password
    user.save();            // Save the updated user.
    return true;            // Return the result.
}
```
[Back to Cryptography Methods](#cryptographyMethods)

---------------------------------------


<a name="libraryDate" />
## Date

<a name="libraryLoad" />
## Load

<a name="libraryLog" />
## Log

<a name="libraryMessage" />
## Message

<a name="libraryModel" />
## Model

<a name="librarySend" />
## Send

Send JSON responses or errors in a unified format so they can be easily parsed by a requestor.  Additional methods, such as emailing, are also provided.

<a name="sendMethods" />
### Methods
* [Send](#sendSend)
* [Send Error](#sendSendError)
* [Create Error](#sendCreateError)
* [Create and Send Error](#sendCreateAndSendError)
* [Create Success Object](#sendCreateSuccessObject)
* [Create and Send Success Object](#sendCreateAndSendSuccessObject)
* [Set Response](#sendSetResponse)
* [Get Response](#sendGetResponse)
* [Set Request Handled](#sendSetRequestHandled)
* [Get Request Handled](#sendSetRequestHandled)

[Back to Libraries](#libraryIndex)

---------------------------------------
<a name="sendSend" />
### send(obj, req, res, next)

Send an object or array to the requestor.  Send will format the object or array so it can be easily parsed.

__Arguments__
* obj - an object or array to send.
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/user/:id.:format', user);

function user(req, res, next) {
    // Find or get a user object.
    user = { name: "Robocop", occupation: "Being Robocop" }

    // Send the object to the requestor.
    sender.send(user, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendSendError" />
### sendError(err, req, res, next)

Send an error or array of errors to the requestor.  SendError will format the object or array so it can be easily parsed.

__Arguments__
* err - an error or array of errors.  The error should contain a status to indicate the type of error (such as 500 or 404).
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);

function users(req, res, next) {
    // Error occurred finding the users.
    var error = new Error("Oh crap, um... a, I can't do that.");
    error.status = 500;  // Internal Server Error.

    // Send the error to the requestor.
    sender.sendError(error, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendCreateError" />
### createError(msg, status)

Create an error to send to a requestor.  This will handle formatting the error so it can be used by other Send methods.

__Arguments__
* msg - an error string message.
* status - error status code indicating the type of error. For example 500 stands for internal server error.

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);

function users(req, res, next) {
    // Error occurred finding the users.
    var error = sender.createError("Oh crap, um... a, I can't do that.", 500);

    // Send the error to the requestor.
    sender.sendError(error, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendCreateAndSendError" />
### createAndSendError(msg, status, req, res, next)

Create and send an error to a requestor.  This will handle creating, formatting, and sending the error.

__Arguments__
* msg - an error string message.
* status - error status code indicating the type of error. For example 500 stands for internal server error.
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);

function users(req, res, next) {
    // Create and send an internal server error to the requestor.
    sender.createAndSendError("Oh crap", 500, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendCreateSuccessObject" />
### createSuccessObject(success)

Create a success or failure message to send to a requestor.  Instead of simply sending true or false, this method handles formatting the success or failure in a easy to parse json message.

__Arguments__
* success - a boolean value, true or false, indicating success or failure.

__Example__
```js
var sender = fox.send;
app.get('/doIt.:format', doIt);

function doIt(req, res, next) {
    // Construct a success object
    var successObject = sender.createSuccessObject(true);
    
    // Send the success object to the requestor.
    sender.send(successObject, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendCreateAndSendSuccessObject" />
### createAndSendSuccessObject(success, req, res, next)

Create and send a success or failure message to a requestor.  Instead of just sending true or false, this method handles formatting the success or failure in a easy to parse json message.

__Arguments__
* success - a boolean value, true or false, indicating success or failure.
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/doIt.:format', doIt);

function doIt(req, res, next) {
    // Construct a success object and send it to the requestor.
    sender.createAndSendSuccessObject(true, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendSetResponse" />
### setResponse(obj, req, res, next)

Set the local response object or array.  The response is the result to be returned to the requestor.  Use this method when more than one route needs to be executed before returning the response to the requestor.  Simply set the response object in any route and access it in another route using the getResponse(res) method.

__Arguments__
* obj - an response object or array.
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);
app.get('/trackRequests.:format', trackRequests);

function users(req, res, next) {
    // Find all the users.
    users = [ 
    	{ name: "Robocop", occupation: "Being Robocop" },
    	{ name: "John Malkovich", occupation: "Being John Malkovich" }
    ]
    
    // Set the response object.
    sender.setResponse(users, req, res, next);
}

function trackRequests(req, res, next) {
    // Get the response object
    var response = sender.getResponse(res);
    
    // Track the request
    console.log("Request made, result is " + JSON.stringify(response));
    
    // Send the response to the requestor.
    sender.send(response, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendGetResponse" />
### getResponse(obj, req, res, next)

Get the local response object or array.  The response is the result to be returned to the requestor.  Use this method to obtain a stored response from a previous route.

__Arguments__
* obj - a response object or array.
* req - request object passed into the route method.
* res - response object passed into the route method.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);
app.get('/trackRequests.:format', trackRequests);

function users(req, res, next) {
    // Find all the users.
    users = [ 
    	{ name: "Robocop", occupation: "Being Robocop" },
    	{ name: "John Malkovich", occupation: "Being John Malkovich" }
    ]
    
    // Set the response object.
    sender.setResponse(users, req, res, next);
}

function trackRequests(req, res, next) {
    // Get the response object
    var response = sender.getResponse(res);
    
    // Track the request
    console.log("Request made, result is " + JSON.stringify(response));
    
    // Send the response to the requestor.
    sender.send(response, req, res, next);
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendSetRequestHandled" />
### setRequestHandled(req, isHandled)

Set a flag indicating that the request object has been handled by a route.  This is used as an indication to later routes that the request has been taken care of and there is no need for further action.  Use the getRequestHandled method to retrieve the isHandled flag in later routes.  The setRequestHandled method should not need to be used directly since the flag is handled for you internally in the send library.

A request is considered handled when the response has been set using the setResponse() method or when a response has been sent using any of the send methods.

__Arguments__
* req - request object passed into the route method.
* isHandled - boolean value indicating whether or not the request has been handled.
* next - callback for the send method. (optional)

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);
app.get('/users.:format', doSomethingElse);

function users(req, res, next) {
    // Do some stuff
    // ...
    console.log("Request has been handled!");
    
    sender.setRequestHandled(req, true, next);
}

function trackRequests(req, res, next) {
    // Check if request has been handled in previous route.
    if(sender.getRequestHandled(req)) {
        return next();
    }
    
    // Do something with unhandled request.
    // ...
    console.log("Request has been handled!");
    
    next();
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------
<a name="sendGetRequestHandled" />
### getRequestHandled(req)

Get a flag indicating whether or not the request object has been handled by a previous route.  You can use this information to decided if further action on a request is required.  The request handled flag is controlled internally by the send library, so you should not need to manually set it.

A request is considered handled when the response has been set using the setResponse() method or when a response has been sent using any of the send methods.

__Arguments__
* req - request object passed into the route method.

__Return__

Synchronously returns a boolean value of true or false.

__Example__
```js
var sender = fox.send;
app.get('/users.:format', users);
app.get('/users.:format', doSomethingElse);

function users(req, res, next) {
    // Do some stuff
    // ...
    console.log("Request has been handled!");
    
    sender.setRequestHandled(req, true, next);
}

function doSomethingElse(req, res, next) {
    // Check if request has been handled in previous route.
    if(sender.getRequestHandled(req)) {
        return next();
    }
    
    // Do something with unhandled request.
    // ...
    console.log("Request has been handled!");
    
    next();
}
```
[Back to Send Methods](#sendMethods)

---------------------------------------




## [MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")
