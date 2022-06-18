const { delay, genScriptName } = require('./utils/funcUtils');
const path = require('path');
const fs = require('fs');
const script = require('./script');
const { logMsg } = require('./utils/logger');
const moment = require('moment');

(async () => {
  genScriptName();

  process.env.SESSION_VER =
    'v' + moment().format('HH.mm.ss_DD.MM.YY').toString();
  const cwd = process.cwd();
  process.env.NODE_PATH = process.cwd();

  // check log folder exist
  let logDirPath = path.join(cwd, 'log');
  let logSessionPath = path.join(logDirPath, `${process.env.SESSION_VER}`);
  let logScriptPath = path.join(logSessionPath, `scriptLog.log`);
  let logErrorPath = path.join(logSessionPath, `errLog.log`);

  const listLogDirPath = [logDirPath, logSessionPath];
  const listLogFilePath = [logScriptPath, logErrorPath];

  for (let path of listLogDirPath) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  for (let path of listLogFilePath) {
    if (!fs.existsSync(path)) {
      fs.writeFile(path, '', { flag: 'wx' }, function (err) {
        if (err) throw err;
      });
    }
  }

  // check res folder
  let resDirPath = path.join(cwd, 'res');
  if (!fs.existsSync(resDirPath)) {
    fs.mkdirSync(resDirPath);
  }

  logMsg('Preparing to run the script...');
  await delay(500);
  await script();
})();
