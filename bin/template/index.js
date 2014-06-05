// ~A Scott Smereka

/* Template
 * Manage client and server boilerplate code templates.
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
var async,
    config,               // Reference to fox server config.
    debug = false,        // Flag to show debug logs.
    fox,                  // Reference to current fox instance.
    log,                  // Reference to fox log object.
    trace = false,        // Flag to show trace logs.
    wrench;

var Templates;

// List of available templates.
var templates = {};

/* ************************************************** *
 * ******************** Constructor & Initalization
 * ************************************************** */

/**
 * Constructor to create the server object and load 
 * any other local modules that are required to manage
 * the server instance(s).
 */
var Template = function(_fox) {
  async = require("async");
  wrench = require('wrench');
  Templates = require("./templates.json");
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

  handleConfig();

  loadTemplates(fox.config, next);
}


/* ************************************************** *
 * ******************** Private API
 * ************************************************** */

/**
 * Load, verify, and update the template registry.
 */
var loadTemplates = function(_config, next) {
  next = (next) ? next : function(err) { if(err){ log.error(err["message"] || err); } };

  var checkIfInstalled = {},        // List of templates that should be verified as installed.
      createTemplateTasks = [],     // Stores functions to create new tempates to be run by async.
      isUpdated = false;            // Flag when true changes have been made to the template registry.

  // Load the current registry, aka the templates.json file.
  if(Templates) {
    templates = Templates;
  } else {
    templates = Templates = {};
    log.debug("Cannot load template database file.");
  }

  // Load list of templates that claim to be installed.
  for(var i in templates) {
    if(templates[i]["installed"] === true) {
      checkIfInstalled[i] = templates[i];
    }
  }

  // Create the template directory, if it doesn't exist.
  if( ! fs.existsSync(_config.foxTemplatePath)) {
    fs.mkdirSync(_config.foxTemplatePath, "0775");
  }

  // Load all the files in the template root directory.
  var files = fs.readdirSync(_config.foxTemplatePath);

  // Loop through each file checking for templates.  
  for(var i in files) {
    if(files[i].hasOwnProperty(i)) {

      // Get the file's path.
      var filePath = path.normalize(_config.foxTemplatePath+"/"+files[i]);     
     
      // If the file is a template
      if(fs.statSync(filePath).isDirectory()) {

        // Check if template is already registered, if it is update the entry.
        if(templates[files[i]]) { 

          // Ensure template is marked as installed.
          if( ! templates[files[i]]["installed"]) {
            templates[files[i]]["installed"] = true;
            isUpdated = true;
          }

          if(checkIfInstalled[files[i]] !== undefined) {
            // If the template needed to be verified as installed, then mark it as verified.
            delete checkIfInstalled[files[i]];
          }

          // Verify the file path is correct.
          if(templates[files[i]]["dir"] !== filePath) {
            templates[files[i]]["dir"] = filePath;
            isUpdated = true;
          }

          // Add the name field, if needed.
          if(templates[files[i]]["name"] !== files[i]) {
            templates[files[i]]["name"] = files[i];
            isUpdated = true;
          }
        } else {
          // If the template is installed but not registered, try to register it.
          createTemplateTasks.push(createTemplateFromDirFn(filePath));
        }
      }
    }
  }

  // Update templates that are improperly marked as installed.
  for(var i in checkIfInstalled) {
    if(checkIfInstalled.hasOwnProperty(i)) {
      templates[i]["installed"] = false;
      isUpdated = true;
    }
  }

  // Register installed templates that have not yet been registered.
  if(createTemplateTasks && createTemplateTasks !== []) {

    // Create the templates
    async.parallel(createTemplateTasks, function(err, newTemplates) {
      if(err) {
        log.error(err["message"] || err);
      } else {

        // Add each valid template to the existing registry.
        for(var i in newTemplates) {
          if(newTemplates.hasOwnProperty(i)) {
            templates[newTemplates[i]["name"]] = newTemplates[i];
            isUpdated = true;
          }
        }
      }

      // Save any changes made to the registry.
      if(isUpdated) {
        saveTemplates(_config, templates, function(err) {
          next(err, templates);
        });
      } else {
        // Otherwise return the template registry json.
        next(undefined, templates);
      }
    });
  } else if(isUpdated) {
    // If no new templates need to be registered, but changes were made
    // to the registry, save those changes.
    saveTemplates(_config, templates, function(err) {
      next(err, templates);
    });
  } else {
    // no changes made, return the json template registry.
    next(undefined, templates);
  }
};

/**
 * Save the current templates to a json file.
 */
var saveTemplates = function(_config, templates, next) {
  fs.writeFile(path.normalize(_config.foxBinPath + "/template/templates.json"), JSON.stringify(templates, null, 4), next);
}

/**
 * Add a template to the template folder by cloning the repo.
 */
var add = function(_config, str, next, silent) {
  // Check for valid argument
  if( ! str) {
    return next(new Error("Invalid template '"+str+"'"));
  }
  var repo;

  // Check if we have the template in our list.
  var template = getTemplate(str);
  if(template) {
    repo = template["git"];
  } else {
    repo = str;
  }

  gitClone(repo, _config.foxTemplatePath, function(err) {
    if(err) {
      return next(err);
    }

    loadTemplates(_config, next);
  }, silent);
}

var update = function(_config, next, silent) {

}

/**
 * Remove a template from the template folder by um, well... 
 * deleting the template's folder.
 */
var remove = function(_config, str, next) {
  var template = getTemplate(str);
  if(fs.existsSync(template["dir"])) {
    wrench.rmdirSyncRecursive(template["dir"]);
    loadTemplates(_config, next);
  }
}

var ensureTemplateIsInstalled = function(_config, templateName, next) {
  if( ! templates || ! templates[templateName]) {
    return next(new Error("The template " + templateName + " is unknown.  Try adding the template first using:\n\n  fox template add <git-repo-url>\n"));
  }

  if( ! templates[templateName]["installed"]) {
    log.info("5. Installing " + templateName + "...");
    gitClone(templates[templateName]["git"], _config.foxTemplatePath, function(err) {
      if(err) {
        return next(err);
      }
      
      loadTemplates(_config, function(err) {
        next(err, templates[templateName]);
      });
    }, false);
  } else {
    log.info("5. Checking and installing updates for " + templateName + "...");

    // Template is already installed, make sure it is up-to-date.
    gitPull(templates[templateName]["dir"], function(err) {
      if(err) {
        return next(err);
      }

      next(undefined, templates[templateName]);
    }, true);
  }
}

/**
 * Create a function that will create a template based on an 
 * existing repo directory.
 */
var createTemplateFromDirFn = function(dir) {
  return function(next) {

    // Get the repo url from the existing git directory.
    getRepoFromPath(dir, function(err, gitRepo) {
      if(err) {
        return next(err);
      }

      // Get the name from the repo from the repo url.
      name = getNameFromRepo(gitRepo);
      if( ! name) {
        return next(new Error("Cannot get name from create template with invalid name "));
      }

      // Crate and return the template.
      return next(undefined, {
        "name": name,
        "git": gitRepo,
        "dir": dir,             // Set the directory.
        "installed": true       // Since we are given the directory, it is obvisouly already installed.
      });
    });
  }
}

/**
 * Create and return a new template object given at least a repository or
 * a path to an existing repo clone.
 */
var createTemplate = function(_config, name, dir, repo, isInstalled, next) {
  getRepoFromPath(dir, function(err, gitRepo) {
    if(err) {
      return next(err);
    }

    // Get the name from the repo.
    name = (name) ? name : getNameFromRepo(repo);
    if( ! name) {
      return next(new Error("Cannot create template with invalid name and repo."));
    }

    // Get the dir from the repo.
    if( ! dir) {
      dir = path.normalize(_config.foxTemplatePath + "/" + name);
    }

    // Get if the repo is installed.
    if(isInstalled === undefined) {
      isInstalled = fs.existsSync(dir);
    }

    return next(undefined, {
      "name" : name,
      "git": gitRepo,
      "dir": dir,
      "installed": isInstalled
    });
  }, repo);
}

/**
 * Get the git repo url from an existing git repo directory.
 */
var getRepoFromPath = function(filePath, next, repo) {
  if(repo !== undefined) {
    return next(undefined, repo);
  }

  if(filePath === undefined) {
    return next(new Error("Cannot get repository url from an empty file path."));
  }

  gitRemote(filePath, next);
}

/**
 * Get a git repo's name from the repo url.
 */
var getNameFromRepo = function(repo) {
  // Check if we have a url
  if( ! repo || repo.length < 5 || repo.substr(0, 4) !== "http") {
    console.log(repo + " is invalid");
    return undefined;
  }

  var name = (repo.substr(repo.lastIndexOf("/") + 1));
  return name.substr(0, name.length-4);
}


/**
 * Return a list of all the templates.
 */
var list = function() {
  return templates;
}

/**
 * Get a template from the local registry using the 
 * template's name or git repo url.
 */
var getTemplate = function(str) {
  var template = getTemplateFromName(str);
  return (template) ? template : getTemplateFromGit(str);
}

/**
 * Get a template from the local registry using the 
 * template's name.
 */
var getTemplateFromName = function(name) {
  return templates[name];
}

/**
 * Get a template from the local registry using the 
 * template's git repo url.
 */
var getTemplateFromGit = function(gitRepo) {
  for(var key in templates) {
    if(templates.hasOwnProperty(key) && templates[key]["git"] === gitRepo) {
      return templates[key];
    }
  }

  return undefined;
}


/* ************************************************** *
 * ******************** Git Commands
 * ************************************************** */

/**
 * Clone a git repo into a target directory.
 */
var gitClone = function(repo, dir, next, silent) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };
  if( ! repo) {
    return next(new Error("Cannot clone invalid repo '"+repo+"'"));
  }

  fox.worker.execute("git", ["clone", repo], { cwd: (dir) ? dir : "." }, (silent !== undefined) ? ! silent : true, function(err, code, stdout, stderr) {
    return next();
  });
}

/**
 * Perform an update using git pull for a target directory.
 */
var gitPull = function(dir, next, silent) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  fox.worker.execute("git", ["pull"], { cwd: (dir) ? dir : "." }, (silent !== undefined) ? ! silent : true, function(err, code, stdout, stderr) {
    return next();
  });
}

/**
 * Lookup a git url of an existing repo.
 */
var gitRemote = function(dir, next) {
  next = (next) ? next : function(err) { if(err) { log.error(err["message"] || err); } };

  fox.worker.execute("git", ["remote", "-v"], { cwd: (dir) ? dir : "." }, false, function(err, code, stdout, stderr) {
    var lines = stdout.split(/\n/);
    for(var i in lines) {
      if(lines.hasOwnProperty(i)) {
        var fetch = lines[i].indexOf("(fetch)");
        if( fetch !== -1) {
          lines[i] = lines[i].substring(0, fetch-1);
          return next(undefined, lines[i].split(/\t/)[1]);        
        }
      }
    }
    return next();
  });
}


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Template.prototype.add = add;
Template.prototype.update = update;
Template.prototype.remove = remove;
Template.prototype.list = list;

Template.prototype.getTemplate = getTemplate;
Template.prototype.getTemplateFromName = getTemplateFromName;
Template.prototype.getTemplateFromGit = getTemplateFromGit;
Template.prototype.ensureTemplateIsInstalled = ensureTemplateIsInstalled;

/* ************************************************** *
 * ******************** Export the Public API
 * ************************************************** */

// Reveal the method called when required in other files. 
exports = module.exports = Template;

// Reveal the public API.
exports = Template;