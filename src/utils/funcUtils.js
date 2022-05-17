const { SCRIPT_NAME } = require('../config');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { logConsole, boxText } = require('./logger');

const execCommand = async (cmd) => {
  try {
    await exec(cmd);
  } catch (e) {
    console.error(e);
  }
};

const genScriptName = () => {
  logConsole('#d1eded')(boxText(SCRIPT_NAME.toUpperCase(), 26, 5));
};

const delay = (ms) => new Promise((res, _) => setTimeout(() => res(), ms));

module.exports = { genScriptName, execCommand, delay };
