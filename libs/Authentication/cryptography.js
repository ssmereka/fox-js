// ~> Library
// ~A Scott Smereka

/* Cryptography
 * Library for encrypting and decrypting data.
 *
 * NOTE: Crypto is unstable and API chanages are being 
 * made in future versions: http://nodejs.org/api/crypto.html
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */
 
var bcrypt,             // Used to hash strings and things.
    crypto,             // Used to generate random keys
    debug = false,      // Display additional logs when enabled.
    fox,                // Instance of the fox module.
    hexKeyLength = 24,  // Default length of generated hex keys.
    log,                // Handles logging.
    saltRounds = 10,    // Default number of rounds to hash data for.
    trace = false;      // Displays trace or flow-related log messages when enabled.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new cryptography library object.
 */
var Cryptography = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules
  log = fox.log;

  // Load external modules
  bcrypt = require("bcrypt");
  crypto = require("crypto");

  // Configure the cryptography instance.
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

    // Set cryptography specific settings.
    if(config["cryptography"]) {
      saltRounds = (config.cryptography["defaultSaltRounds"]) ? config.cryptography["defaultSaltRounds"] : saltRounds;
      hexKeyLength = (config.cryptography["defaultHexKeyLength"]) ? config.cryptography["defaultHexKeyLength"] : hexKeyLength;
    }
  }
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Hash a string asynchronously using a specific number of salt rounds.
 * @param string is the string to be hashed.
 * @param rounds is the number of rounds to process the data.
 * @param next is the callback method that contains error and result parameters.
 * @return the hashed string or error to the callback method.
 */
var hash = function(string, rounds, next) {
  // Check for valid callback method.
  if(!next) {
    return log.e(new Error("Cryptography.hash(*****, "+rounds+", undefined): cannot perform hash asynchronously without a callback."));
  }

  // Check for valid string.
  if(! string) {
    err = new Error("Cryptography.hash("+string+", "+rounds+", next): cannot hash an invalid string.");
    log.e(err);
    return next(err);
  }

  // Check for valid number of rounds to process the data.
  rounds = (rounds === undefined || rounds < 0) ? saltRounds : rounds;

  // Create a salt and use it to hash a string.
  bcrypt.hash(string, rounds, function(err, hash) {
    if(err) {
      return next(err);
    }

    return next(undefined, hash);
  });
};

/**
 * Hash a string synchronously using a specific number of salt rounds.
 * @param string is the string to be hashed.
 * @param rounds is the number of rounds to process the data.
 * @return the hashed string or undefined if an error occurred.
 */
var hashSync = function(string, rounds) {
  // Check for valid string.
  if(! string) {
    err = 
    log.e(new Error("Cryptography.hashSync("+string+","+rounds+", next): cannot hash an invalid string."));
    return undefined;
  }

  // Check for valid number of rounds to process the data.
  rounds = (rounds === undefined || rounds < 0) ? saltRounds : rounds;

  try {
    // Create a salt and use it to hash a string, then return the results.
    return bcrypt.hashSync(string, rounds);
  } catch(ex) {
    // Log any errors we encounter and return undefined.
    log.e(new Error("Cryptography.hashSync(*****, "+rounds+"): error hashing the string.  "+ ex.toString()));
    return undefined;
  }
};

/**
 * Generate a random key of a given length, hash that key, and then 
 * return the results asynchronously.
 * @param keyLength is the length, greater than zero, of the key to be generated and hashed.
 * If an invalid keyLength is given, the default key length will be used.
 * @param next is the callback method that contains error and result parameters.
 * @return the generated key of the given length hashed or error to the callback method.
 */
var generateHashedKey = function(keyLength, next) {
  // Check for valid callback method.
  if(!next) {
    return log.e(new Error("Cryptography.generateHashedKey("+keyLength+", undefined): cannot generate a hashed key asynchronously without a callback."));
  }

  // Check for valid key length.
  keyLength = (keyLength === undefined || keyLength <= 0) ? hexKeyLength : keyLength;

  // Generate a key of the given length.
  generateKey(keyLength, function(err, key) {
    if(err) {
      return next(err);
    }

    // Make sure the key is valid.
    if(! key || key === "") {
      return next(new Error("Cryptography.generateHashedKey("+keyLength+", next): Key generation failed."));
    }

    // Hash the key asynchronously and return the results.
    hash(key.toLowerCase(), saltRounds, next);
  });
};

/**
 * Generate a random key of a given length, hash that key, and then 
 * return the results synchronously.
 * @param keyLength is the length, greater than zero, of the key to be generated and hashed.
 * If an invalid keyLength is given, the default key length will be used.
 * @return the generated key of the given length hashed or undefined if
 * an error occurred.
 */
var generateHashedKeySync = function(keyLength) {
  // Check for valid key length.
  keyLength = (keyLength === undefined || keyLength <= 0) ? hexKeyLength : keyLength;

  // Generate a hex key
  var key = generateKeySync(keyLength);
  
  // Make sure the key is valid.
  if(! key || key === "") {
    return log.e(new Error("Cryptography.generateHashedKeySync("+keyLength+"): Key generation failed.")); 
  }

  // Hash and return the key.
  return hashSync(key);
};

/**
 * Generate a cryptographically strong pseudo-random hex key of a given length asynchronously.
 * @param keyLength is the length, greater than zero, of the key to be generated and hashed.
 * If an invalid keyLength is given, the default key length will be used.
 * @param next is the callback method that contains error and result parameters.
 * @return the generated hex key of the given length or error to the callback method.
 */
var generateKey = function(keyLength, next) {
  // Check for valid callback method.
  if( ! next) {
    return log.e(new Error("Cryptography.generateKey("+keyLength+", undefined): cannot generate a random key asynchronously without a callback."));
  }

  // Check for valid key length.
  keyLength = (keyLength === undefined || keyLength <= 0) ? hexKeyLength : keyLength;

  // Generate a cryptographically strong pseudo-random string.
  crypto.randomBytes(keyLength, function(err, buf) {
    if(err) {
      return next(err);
    }

    next(null, buf.toString('hex').toLowerCase());
  });
};

/**
 * Generate a cryptographically strong pseudo-random hex key of a given length synchronously.
 * @param keyLength is the length, greater than zero, of the key to be generated and hashed.
 * If an invalid keyLength is given, the default key length will be used.
 * @return the generated hex key of the given length or undefined if an error occurred.
 */
var generateKeySync = function(keyLength) {
  // Check for valid key length.
  keyLength = (keyLength === undefined || keyLength <= 0) ? hexKeyLength : keyLength;

  try {
    // Generate a cryptographically strong pseudo-random string.
    return crypto.randomBytes(keyLength).toString('hex').toLowerCase();
  } catch(ex) {
    log.e(new Error("Cryptography.generateKey("+keyLength+"): Error generating random key.  " + ex.toString()));
    return undefined;
  }
};

var compare = function(value1, value2, next) {
  bcrypt.compare(value1, value2, next);
}

var compareSync = function(value1, value2) {
  return bcrypt.compareSync(value1, value2);
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Cryptography.prototype.hash = hash;
Cryptography.prototype.hashSync = hashSync;
Cryptography.prototype.generateHashedKey = generateHashedKey;
Cryptography.prototype.generateHashedKeySync = generateHashedKeySync;
Cryptography.prototype.generateKey = generateKey;
Cryptography.prototype.generateKeySync = generateKeySync;
Cryptography.prototype.compare = compare;
Cryptography.prototype.compareSync = compareSync;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Cryptography;

// Reveal the public API.
exports = Cryptography;