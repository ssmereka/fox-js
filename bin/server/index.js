// ~> Bin
// ~A Scott Smereka

/* Command Line Interface
 * Interact with fox using the command line.
 */


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

var Node = required("./node.js"),
    Nodemon = required("./nodemon.js"),
    Pm2 = required("./pm2.js");

var argv,
    config,
    debug = false,
    fox,
    log,
    node,
    nodemon,
    pm2,
    trace = false;

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

var Server = function(_fox) {
  // Handle parameters
  fox = _fox;

  // Load internal modules.
  log = fox.log;

  node = new Node(_fox);
  nodemon = new Node(_fox);
  pm2 = new Pm2(_fox);


  loadExternalModules();

  // Configure message instance.
  handleConfig(fox["config"]);
}

/**
 * Setup the module based on the config object.
 */
var handleConfig = function(_config) {
  if(_config) {
    config = _config;
    if(config["system"]) {
      debug = (config.system["debug"]) ? config.system["debug"] : debug;
      trace = (config.system["trace"]) ? config.system["trace"] : trace;
    }
  }
}

function loadExternalModules() {

}

/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

var start = function(config, next) {
  //return startWithNode(config, next);

  switch(_config["controller"]) {
    case "node":
      node.start(config, next);
      break;

    case "nodemon":
      nodemon.start(config, next);
      break;

    case "pm2":
      pm2.start(config, next);
      break;

    case "fox":
      break;

    default:
      log.error("The controller type of '" + controllerType +"' in the config is unrecognized.");
      break;
  }
}


var defaultNextMethod = function(err) {
  if(err) {
    log.error(err);
  }
}

var isLogIndicationServerStarted = function(str) {
  return (str.indexOf("Listening on port") != -1);
}




/**
 * Start the server using nodemon.  This will deamonize the 
 * process and perform automatic restarts when files change.
 */
function startWithNodemon(config, next) {
  var onStdOutput,
      isNextCalled = false;

  // If next is not defined, create a method to print errors.
  // Otherwise create a method to call next after the server
  // has started successfully.
  if( ! next) {
    next = defaultNextMethod;
  } else {
    onStdOutput = function(data) {
      if( ! isNextCalled) {
        if(data && isLogIndicationServerStarted(data.toString())) {
          next();
          isNextCalled = true;
        }
      }
    };
  }

  // Setup the nodemon configuration object.
  var nodemonConfig = {
    // Node server index location.
    "script": config["serverPath"],
    
    // Restart command.
    "restartable":"rs",

    // Ignore these files when watching for changes.
    "ignore": [
      ".git",
      "node_modules/**/node_modules"
    ],

    // Turn off verbose log messages.
    "verbose": false,
    
    /*    
    "execMap": {
      "py": 'python',
      "rb": 'ruby'
    }, */
    
    // Watch these files/folders for changes.
    "watch" : [
      config["serverPath"],
      path.resolve(fox.config["serverPath"], "../configs")
    ],

    // Node enviorment (local, development, production)
    "env": {
      "NODE_ENV": config.environment
    },

    // Not sure.. but default settings.
    "ext": "js json",

    // Hook up the standard input to the processes' stdin.
    stdin: true,

    // Hook up the standard output to the processes' stdout.
    // If a custom stdout method is defined, then we will 
    // hook up the stdout to that method instead.
    stdout: ( ! onStdOutput) ? true : false
  };

  // Start the server using nodemon.
  nodemon(nodemonConfig);

  // Listen for events.
  nodemon.on('start', function() {
  }).on('quit', function() {
  }).on('restart', function(files) {
  }).on('log', function(log) {
  }).on('stdout', (onStdOutput) ? onStdOutput : function(data) {});
}





/**
 * Create a new server.
 */
var create = function(name, _config, next) {
  if( ! next) {
    next = defaultNextMethod;
  }

  _config = (_config) ? _config : config;

  name = (name === undefined) ? "server" : name;

  var newServerPath = path.normalize(_config.userPath + "/" + name);

  // Check if the new server location is taken
  if(fs.existsSync(newServerPath)) {
    return next(new Error("Server already exists at " + newServerPath));
  }

  // Check for a collision of server resources.
  if(_config.serverPath && _config.serverPath.indexOf(_config.userPath) !== -1) {

    // Check for index file at current directory
    if(fs.existsSync(path.resolve(newServerPath, "../index.js"))) {
      return next(new Error("Server already exists at " + path.resolve(newServerPath, "../index.js"));
    }

    var serverSplitPath = _config.serverPath.replace(_config.userPath, "").split(path.sep);

    if(serverSplitPath[1] === "name" || serverSplitPath[1] === "app") {
      return next(new Error("Server already exists at " + fox.config.serverPath));
    }
  }

  log.info("5. Creating " + name + "...");
  wrench.copyDirSyncRecursive(_config.foxServerPath, newServerPath, {
    forceDelete: true, 
    preserveFiles: true, 
    inflateSymlinks: false, 
    excludeHiddenUnix: true
  });

  log.info("4. Configuring...");
  // TODO: this...

  log.info("3. Installing modules...");
  fox.execute("npm --prefix " + newServerPath + " install", function(err, stdout, stderr) {

    log.info("2. Starting server...");
    fox.fork(_config["foxBinPath"]+"/fox", ["start", "-l", "-i"], { cwd: '.' }, next);
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

// Expose the public methods available.
Server.prototype.start = start;
Server.prototype.startWithNode = startWithNode;
Server.prototype.startWithNodemon = startWithNodemon;

Server.prototype.create = create;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Server;

// Reveal the public API.
exports = Server;