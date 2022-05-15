const fs = require('fs/promises');
const path = require('path');
const { LOG_PATH } = require('./pathMng');
const moment = require('moment');
const chalk = require('chalk');

const TYPE = {
  MSG: 0,
  ERR: 1,
};

const log = async (msg, path, type) => {
  if (type == TYPE.ERR) console.log(chalk.red(msg));
  else console.log(chalk.hex('#f5ad4e')(msg));

  const msgTime = moment().format('YYYY/MM/D HH:mm:ss');
  const msgLog = `[${msgTime}]: ${msg}`;

  try {
    let logRows = (await fs.readFile(path)).toString().split('\n');
    logRows.unshift(msgLog);
    await fs.writeFile(path, logRows.join('\n'));
  } catch (e) {}
};

const logErr = (msg) => log(msg, path.join(LOG_PATH, 'errLog.log'), TYPE.ERR);
const logMsg = (msg) => log(msg, path.join(LOG_PATH, 'scriptLog.log'), TYPE.MSG);

// const logMsg = async (msg) => {
//   console.log(msg);
//   const msgTime = moment().format('YYYY/MM/D HH:mm:ss')
//   const msgLog = `[${msgTime}]: ${msg}`;

//   const logFilePath = path.join(LOG_PATH, 'scriptLog.log');

//   try {
//     await fs.writeFile(logFilePath, msgLog, { flag: 'w+' });
//   } catch (e) {}
// };

module.exports = {
  logMsg,
  logErr,
};
