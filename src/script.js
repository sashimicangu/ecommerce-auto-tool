const browserObj = require('./browser');
const pageController = require('./pageController');
const pageScraper = require('./pageScraper');

const { Select } = require('enquirer');
const { logMsg } = require('./utils/logger');
const { genScriptName } = require('./utils/funcUtils');

const script = async () => {
  const scriptNameArt = await genScriptName();
  console.log('\n' + scriptNameArt);

  const webName = await new Select({
    name: 'webName',
    message: 'Select web',
    choices: Object.keys(pageScraper).filter(
      (name) => !pageScraper[name].isDevelopment
    ),
  }).run();

  let browserInstance = browserObj.startBrowser();
  pageController(browserInstance, webName);
};

script();
