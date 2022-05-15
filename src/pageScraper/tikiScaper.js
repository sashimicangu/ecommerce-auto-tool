const scraperObject = {
  url: 'https://tiki.vn/',
  isDevelopment: true,
  async scrape(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
  },
};

module.exports = scraperObject;
