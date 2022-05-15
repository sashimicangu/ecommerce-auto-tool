const pageScraper = require('./pageScraper');
const { logErr } = require('./utils/logger');

async function scrapeAll(browserInstance, webName) {
  let browser;

  try {
    browser = await browserInstance;
    await pageScraper[webName].scrape(browser);
  } catch (err) {
    logErr(err)
  }
}

module.exports = (browserInstance, webName) => scrapeAll(browserInstance, webName);
