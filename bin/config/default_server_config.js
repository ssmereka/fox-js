// ~>Config
// ~A Scott Smereka

/* Config
 * A file for configuring the fox server.
 */


/* ************************************************** *
 * ******************** Example Config
 * ************************************************** */

/**
 * Example configuration object fully explained and extended, 
 * however this is not currently used.  Use this as a guide to 
 * make new configurations.
 */
var config = {
  
  // Name of the server.
  name: 'fox',
  
  // Enviorment - Set the server's run enviorment
  //   Local - For development and testing on your local machine.
  //   Development - Displays additional logs and information.
  //   Production - Runs the server in a secure production enviorment.
  environment: 'local',
  
  // Daemon - Run the server as a daemon service in the background.
  daemon: true,

  // Cluster - When enabled, multiple instances of your server 
  // will be created to handle the workload of a single port.
  // Note:  This will only be enabled if daemon mode is enabled.
  cluster: {
    
    // Enabled - Turn on/off clustering.
    enabled: false,

    // Worker Per CPU - create a worker for each CPU up
    // to the maximum number of workers.  When disabled 
    // the maximum number of workers will attempt to be created.
    workerPerCpu: true,

    // Worker Max - Maximum number of workers to create.
    workerMax: 1
  },

  // Debug - when enabled additional logs, information, and/or
  // application options will be available.
  debug: true
};


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor
 * Initalize a new cryptography library object.
 */
var Config = function() {

  // Define Static key values

  // Enviorment values.
  this.key_enviorment_local = 'local';
  this.key_enviorment_development = 'development';
  this.key_enviorment_production = 'production';
  
  // Controller values.
  this.key_controller_pm2 = 'pm2';
  this.key_controller_node = 'node';
  this.key_controller_nodemon = 'nodemon';
}


/* ************************************************** *
 * ******************** Configurations
 * ************************************************** */

// Using node in local development mode.
var node = {
  name: 'fox',
  environment: 'local',
  controller: 'node',
  debug: true
};

// Use nodemon in local development mode.
var local = {
  name: 'fox',
  environment: 'local',
  controller: 'nodemon',
  debug: true
};

// Use pm2 in clustered development mode.
var development = {
  name: 'fox',
  environment: 'local',
  controller: 'pm2',
  daemon: true,
  cluster: {
    enabled: true,
    workerPerCpu: true,
    workerMax: 2
  },
  debug: true
};

// Use pm2 in full clustered production mode.
var production = {
  name: 'fox',
  environment: 'production',
  controller: 'pm2',
  daemon: true,
  cluster: {
    enabled: true,
    workerPerCpu: true
  },
  debug: false
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Config.prototype.default = node;
Config.prototype.node = node;
Config.prototype.local = local;
Config.prototype.development = development;
Config.prototype.production = production;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Config;

// Reveal the public API.
exports = Config;