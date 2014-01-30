
/**
 * Module dependencies.
 */
var auth = require("./auth.js"),
	config = require("./config.js"),
	date = require("./date.js"),
	hash = require("./hash.js"),
	loading = require("./loading.js"),
	log = require("./log.js"),
	messaging = require("./messaging.js"),
	model = require("./model.js"),
	send = require("./send.js");




/**
 * Fox constructor.
 * @api public
 */
function Fox() {

};


Fox.prototype.start = function(config, next) {
	return loading.start(config, next);
};

Fox.prototype.stop = function(config, next) {
	return loading.stop(config, next);
};

Fox.prototype.handleMessages = function(server, next) {
	return messaging.handle(server, next);
};


Fox.prototype.authentication = auth;
Fox.prototype.date = date;
Fox.prototype.hash = hash;
Fox.prototype.logging = log;
Fox.prototype.model = model;
Fox.prototype.send = send;



/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Fox();

/**
 * Framework version.
 */
//require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Fox = Fox;