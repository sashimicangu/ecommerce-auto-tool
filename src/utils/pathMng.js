const path = require('path');

const DIR_PATH = path.resolve(process.env.NODE_PATH);
const SRC_PATH = path.join(DIR_PATH, 'src');
const LOG_PATH = path.join(DIR_PATH, 'log');
const RES_PATH = path.join(DIR_PATH, 'res');

module.exports = {
  DIR_PATH,
  SRC_PATH,
  LOG_PATH,
  RES_PATH,
};
