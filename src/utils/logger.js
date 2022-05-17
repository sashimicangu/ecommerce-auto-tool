const fs = require('fs/promises');
const path = require('path');
const { LOG_PATH } = require('./pathMng');
const moment = require('moment');
const chalk = require('chalk');
const Box = require('cli-box');

const TYPE = {
  MSG: 0,
  ERR: 1,
};

const logConsole = (color) => (text) => console.log(chalk.hex(color)(text));
const boxText = (msg, paddingH = 4, height = 1) =>
  Box(`${msg.length + paddingH}x${height}`, {
    text: msg,
    vAlign: 'center',
    hAlign: 'middle',
  });

const log = async (msg, path, type) => {
  const msgTime = moment().format('YYYY/MM/D - HH:mm:ss');
  const msgLog = `[${msgTime}]: ${msg}`;

  if (type == TYPE.ERR) logConsole('#e37164')(boxText(msgLog));
  else logConsole('#f5b778')(boxText(msgLog));

  try {
    let logRows = (await fs.readFile(path)).toString().split('\n');
    logRows.unshift(msgLog);
    await fs.writeFile(path, logRows.join('\n'));
  } catch (e) {}
};

const logErr = (msg) =>
  log(
    msg,
    path.join(LOG_PATH, `${process.env.SESSION_VER}/errLog.log`),
    TYPE.ERR
  );
const logMsg = (msg) =>
  log(
    msg,
    path.join(LOG_PATH, `${process.env.SESSION_VER}/scriptLog.log`),
    TYPE.MSG
  );

module.exports = {
  logMsg,
  logErr,
  boxText,
  logConsole,
};
