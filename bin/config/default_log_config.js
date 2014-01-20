/**
 * Default configuration object for fox logging.
 */

/***
 * Colors
 * @description Print console messages in color.
 * @repo https://github.com/Marak/colors.js
 * @License MIT
 */
var colors = require('colors');

var config = {

  /**
   * Set the Fox color theme with any of these 
   * possible colors: yellow, cyan, white, magenta, 
   * green, red, grey, blue, rainbow, zebra, random.
   */
  theme: {
    success: 'green',
    ok: 'green',
    warn: 'yellow',
    error: 'red',
    debug: 'magenta',
    info: 'cyan'
  }
};

module.exports = config;