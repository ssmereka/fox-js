var messaging = {
  handle: function (server) {
    process.on('message', function(msg) {
  
      // Shutdown Message - The server process is going to be killed in 
      // 4 seconds.  Try to shutdown any open connections.
      // You can override the timeout by modifying PM2_GRACEFUL_TIMEOUT
      if (msg == 'shutdown') {
        console.log("Server shutdown in progress...");
        server.stop({}, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Server shutdown successfully.");
          }

          process.exit(0);
        });
      } else {
        console.log(msg);
      }
    });
  }
}

module.exports = messaging;