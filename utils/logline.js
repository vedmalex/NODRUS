// @ts-check
const { stdout } = require("process");
/**
 * outpus a string
 * @param {string} str string to output
 */
function logline(str) {
  stdout.clearLine(0);
  stdout.cursorTo(0);
  stdout.write(str);
}

exports.logline = logline;
