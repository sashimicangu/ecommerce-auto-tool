const path = require('path');
const { logMsg } = require('./logger');
const { RES_PATH } = require('./pathMng');

const capture = async (page, fileName) => {
  logMsg('Taking screenshot...');
  await page.screenshot({
    path: path.join(RES_PATH, fileName),
    fullPage: true,
  });
};

module.exports = {
  capture,
};
