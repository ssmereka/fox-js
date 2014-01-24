/**
 * Default configuration object for the backend server.
 */
var config = {
  environment: 'local',

  daemon: {
    enabled: true
  }

  // Cluster - When enabled, multiple instances of your server 
  // will be created to handle the workload of a single port.
  cluster: {
    
    // Enabled - Turn on/off clustering.
    enabled: true,

    // Worker Per CPU - create a worker for each CPU up
    // to the maximum number of workers.  When disabled 
    // the maximum number of workers will attempt to be created.
    workerPerCpu: true,

    // Worker Max - Maximum number of workers to create.
    workerMax: 2
  },

  host: 'localhost',

  // Port - The port to have the server listen on.
  port: '3000',
  protocol: 'https',

  // Debug - when enabled additional logs, information, and/or
  // application options will be available.
  debug: true,

  title: 'Fox App',


  mongodb: {
    enabled: true,
    useAuthentication: false,
    host: 'localhost',
    port: '27017',
    database: 'fox_local'
  }
};

module.exports = config;