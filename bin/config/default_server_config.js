/**
 * Default configuration object for the backend server.
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
    enabled: true,

    // Worker Per CPU - create a worker for each CPU up
    // to the maximum number of workers.  When disabled 
    // the maximum number of workers will attempt to be created.
    workerPerCpu: true,

    // Worker Max - Maximum number of workers to create.
    workerMax: 1
  },

  // Debug - when enabled additional logs, information, and/or
  // application options will be available.
  debug: true,
};

module.exports = config;