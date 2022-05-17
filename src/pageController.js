const pageScraper = require('./pageScraper');
const { logErr } = require('./utils/logger');
const { Toggle } = require('enquirer');
const { execCommand } = require('./utils/funcUtils');
const path = require('path');
const { LOG_PATH } = require('./utils/pathMng');

async function scrapeAll(browserInstance, webName) {
  let browser;

  try {
    browser = await browserInstance;
    await pageScraper[webName].scrape(browser);
  } catch (err) {
    logErr(err);
    const openLog = await new Toggle({
      message: 'Want to open error log file?',
      enabled: 'Yep',
      disabled: 'Nope, exit now',
    }).run();

    if (openLog) {
      let plf = process.platform;
      const errLogPath = path.join(
        LOG_PATH,
        `${process.env.SESSION_VER}/errLog.log`
      );

      if (plf == 'win32') await execCommand(errLogPath);
      else await execCommand(`open ${errLogPath}`);
    }

    process.exit();
  }
}

module.exports = (browserInstance, webName) =>
  scrapeAll(browserInstance, webName);
