module.exports = {
  start: function(config, next) {

    var app = require(fox.config.serverPath);

    var isCluster = (fox.config["cluster"] && fox.config.cluster.enabled);


    if(isCluster && cluster.isMaster) {
      var cpuCount = require('os').cpus().length;
      var workerMax = (fox.config.cluster["workerMax"]) ? fox.config.cluster["workerMax"] : cpuCount;
      
      // Determine the number of workers to create based 
      // on the number of CPUs and the max number of workers.
      var workerCount = (fox.config.cluster["workerPerCpu"] && cpuCount <= workerMax) ? cpuCount : workerMax;

      // Create the workers.
      for(; workerCount > 0; workerCount--) {
        cluster.fork();
      }

      // Respawn workers when they die.
      cluster.on('exit', function(worker) {
        fox.log.warn("Master - Worker " + worker.id + " is dead.  Creating a new worker.");
        cluster.fork();
      });
    } else {
      // Start the application.
      app.start(fox.config, function(err, success) {
        var tag = (isCluster) ? "Worker " + cluster.worker.id + " - " : "";

        // Check if the server encountered an error while starting.
        if(err) {
          fox.log.error(tag + err);
        } else {
          fox.log.info(tag + success);
        }

        if(next) {
          next(err);
        }
      });
    }
  }
}