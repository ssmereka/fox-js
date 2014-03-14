// ~A Scott Smereka

/* Template
 */


/* ************************************************** *
 * ******************** Node.js Core Modules
 * ************************************************** */

/***
 * Path
 * @stability 3 - Stable
 * @description Handles tranforming file paths.
 * @website http://nodejs.org/api/path.html
 */
var path = require('path');

/***
 * FS
 * @stability 3 - Stable
 * @description access the file system
 * @website http://nodejs.org/api/fs.html
 */
var fs = require('fs');


/* ************************************************** *
 * ******************** Library Variables
 * ************************************************** */

// Local variables
var config,               // Reference to fox server config.
    debug = false,        // Flag to show debug logs.
    fox,                  // Reference to current fox instance.
    log,                  // Reference to fox log object.
    trace = false;        // Flag to show trace logs.


/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor to create the server object and load 
 * any other local modules that are required to manage
 * the server instance(s).
 */
var Template = function(_fox) {
  updateFoxReference(_fox);
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

/**
 * Update this instances reference to the fox object.  Also update
 * any other modules initalized by this module.
 */
var updateFoxReference = function(_fox, next) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  if( ! _fox) {
    next(new Error("Client Module: Cannot update fox with an invalid fox object."));
  }

  fox = _fox;
  log = fox.log;

  handleConfig(fox["config"]);
  
  next();
}

/* ************************************************** *
 * ******************** Template List
 * ************************************************** */

var templates = {
  "mean" : {
    "git": "https://github.com/ssmereka/fox-mean-template.git",
    "version": "",
    "installed": true,
    "description": "A template based on the MEAN (Mongo DB, Express, Angular.js, and Node.js) stack.",
  }
};
//https://ssmereka_livio@bitbucket.org/livio/sdl_auth_server.git


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 */
var add = function(_config, str, next) {
  // Check for valid argument
  if( ! str) {
    return next(new Error("Invalid template argument."));
  }

  // Check if we have the template in our list.
  var templateName = str;
  var template = getTemplate(str);

  // If the template is not in the list, create a new one.
  if( ! template) {
    templateName = addTemplateToList(str);
    if( ! templates[templateName]) {
      return next(new Error("Template name '"+str+"' is unknown."));
    }
    template = templates[templateName];
  } else if(template && template["installed"] === true) {
    // If the template is already installed, send error.
    return next(new Error("Template is already installed."));
  }

  console.log(template["git"]);
  console.log(_config.foxTemplatePath);
  return next();
  fox.worker.execute("git", ["clone", template["git"]], { cwd: _config.foxTemplatePath }, true, function(err, code, stdout, stderr) {
    return next();
  });
}

var addTemplateToList = function(repo) {
  // Check if we have a url
  if( ! repo || repo.length < 5 || repo.substr(0, 4) !== "http") {
    return undefined;
  }

  var name = (repo.substr(repo.lastIndexOf("/") + 1));
  name = name.substr(0, name.length-4);
  
  templates[name] = {
    "git": repo
  };

  return name;
}

var update = function(_config, template, next) {

}

/**
 */
var remove = function(_config, folderName, next) {
  console.log("remove");
  return next();
  var template = path.normalize(_config.foxTemplatePath + folderName);
  if(fs.existsSync(template)) {
    fs.rmdir(path.normalize(_config.foxTemplatePath + folderName), next);
  }
}

var list = function() {
  return templates;
}

var printList = function(_config, next) {
  if( ! templates) {
    log.info("No templates");
    return;
  }

  for(var key in templates) {
    if(templates.hasOwnProperty(key)) {
      log.info(templates[key].name);
    }
  }
}

var getTemplate = function(str) {
  var template = getTemplateFromName(str);
  return (template) ? template : getTemplateFromGit(str);
}

var getTemplateFromName = function(name) {
  return templates[name];
}

var getTemplateFromGit = function(gitRepo) {
  for(var key in templates) {
    if(templates.hasOwnProperty(key) && templates[key]["git"] === gitRepo) {
      return templates[key]["git"];
    }
  }

  return undefined;
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Template.prototype.add = add;
Template.prototype.remove = remove;
Template.prototype.list = remove;
Template.prototype.getTemplate = getTemplate;
Template.prototype.getTemplateFromName = getTemplateFromName;
Template.prototype.getTemplateFromGit = getTemplateFromGit;


/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Template;

// Reveal the public API.
exports = Template;