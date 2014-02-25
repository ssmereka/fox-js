# Fox JS [![Build Status](https://secure.travis-ci.org/ssmereka/fox-js.png)](http://travis-ci.org/ssmereka/fox-js)

Light-framework and boilerplate code to quickly build scalable web apps using javascript.  The backend is a standalone node server with authenticaiton, users, and anything else all API's need.  The frontend is a standalone angular framework already setup to communicate with the backend.

## Getting Started

1. Install fox-js

    sudo npm -g install foxjs

2. Create a new project

    fox new "My Project Name"

3. Start the server in local mode and start coding!  No need to restart the server, changes will be live after saving a file.

    fox start -l


## Fox CLI

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

## Configuration




# Libraries

* [Access Token](#accessToken)
* [Authorization](#authorization)
* [Config](#config)
* [Cryptography](#cryptography)
* [Date](#date)
* [Load](#load)
* [Log](#log)
* [Message](#message)
* [Model](#model)
* [Send](#send)


<a name="accessToken" />
## Access Token

<a name="authorization" />
## Authorization

<a name="config" />
## Config

<a name="cryptography" />
## Cryptography

Simplifies encryption and decryption of data while also providing helper methods for common cryptography tasks.

### Methods
* [Hash](#cryptographyHash)
* [Hash Synchronous](#cryptographyHashSync)
* [Generate Key](#cryptographyGenerateKey)
* [Generate Key Synchronous](#cryptographyGenerateKeySync)
* [Generate Hashed Key](#cryptographyGenerateHashedKey)
* [Generate Hashed Key Synchronous](#cryptographyGenerateHashedKeySync)

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
---------------------------------------


<a name="date" />
## Date

<a name="load" />
## Load

<a name="log" />
## Log

<a name="message" />
## Message

<a name="model" />
## Model

<a name="send" />
## Send

Send JSON responses or errors in a unified format so they can be easily parsed by a requestor.  Additional methods, such as emailing, are also provided.

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
---------------------------------------




## [MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")
