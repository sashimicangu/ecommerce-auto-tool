const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const { logMsg } = require('./utils/logger');

// plugin
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const startBrowser = async () => {
  let browser;

  try {
    logMsg('Opening the browser...');
    browser = await puppeteer.launch({ headless: true });
  } catch (err) {}

  return browser;
};

module.exports = { startBrowser };
