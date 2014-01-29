
/**
 * Module dependencies.
 */
var loading = require("./loading.js");



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