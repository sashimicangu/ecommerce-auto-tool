const art = require('ascii-art');
const { SCRIPT_NAME } = require('../config');

const genScriptName = () => {
  return art.font(SCRIPT_NAME, 'rusted').completed();
};

module.exports = { genScriptName };
