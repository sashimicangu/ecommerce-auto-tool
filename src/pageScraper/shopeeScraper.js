const { logMsg } = require('../utils/logger');
const { Input, Select, Form, Confirm } = require('enquirer');
const { capture } = require('../utils/puppeteerUtils');

const login = async (page, url) => {
  const loginData = await new Form({
    name: 'auth',
    message: `Login to ${url}`,
    choices: [
      { name: 'user', message: 'Username', initial: '' },
      { name: 'pass', message: 'Password', initial: '' },
    ],
  }).run();

  logMsg('Proceed to login...');
  await page.goto(
    'https://shopee.vn/buyer/login?next=https%3A%2F%2Fshopee.vn%2F'
  );

  await page.waitForSelector('input[type="text"]');

  await page.focus('input[type="text"]');
  await page.keyboard.type(loginData.user);

  await page.waitForTimeout(2000);
  await page.focus('input[type="password"]');
  await page.keyboard.type(loginData.pass);

  await page.waitForTimeout(1000);
  await page.evaluate((_) => {
    let button;
    document.querySelectorAll('button').forEach((item) => {
      if (item.textContent == 'Đăng nhập') button = item;
    });

    button.click();
  });
};

const session = async (page, urlProduct, listSelect = {}) => {
  logMsg(`Crawling product data...`);

  let listOption = {};
  await page.waitForSelector('div.flex.items-center label');
  listOption = await page.evaluate((listOption) => {
    document
      .querySelectorAll('div.flex.items-center label')
      .forEach((item, idx) => {
        const key = idx.toString();
        listOption[key] = { label: item.textContent, data: [] };
        item.nextSibling.childNodes.forEach((item, index) => {
          listOption[key].data = [
            ...listOption[key].data,
            {
              name: item.textContent,
              isDisable: item.className.includes('product-variation--disabled'),
              idx: index,
            },
          ];
        });
      });

    document.querySelectorAll('div');

    return listOption;
  }, listOption);

  const listOptionSelect = listSelect;
  const isListSelectDefault = !Object.keys(listSelect).length;
  if (isListSelectDefault)
    Object.keys(listOption).forEach((key) => {
      listOptionSelect[key] = { idx: 0, isDisable: false };
    });

  if (isListSelectDefault) {
    for (let idx in listOption) {
      const select = await new Select({
        name: 'option',
        message: `Select [${listOption[idx].label}]`,
        choices: listOption[idx.toString()].data.map((item) => item.name),
      }).run();

      const choice = listOption[idx.toString()].data.find(
        (item) => item.name == select
      );

      listOptionSelect[idx.toString()] = {
        idx: choice.idx,
        isDisable: choice.isDisable,
      };
    }
  } else {
    console.log(listOptionSelect);
    Object.values(listOptionSelect).forEach((item, index) => {
      const key = index.toString();

      const optionIdx = item.idx;
      const isDisable = listOption[key].data[optionIdx].isDisable;
      listOptionSelect[key].isDisable = isDisable;
    });
  }

  return {
    isReload: Object.values(listOptionSelect).some((item) => item.isDisable),
    optionSelect: listOptionSelect,
  };
};

const checkout = async (page, listOptionSelect, isHaveOption) => {
  if (isHaveOption) {
    await page.waitForSelector('div.flex.items-center label');

    await page.evaluate((listOptionSelect) => {
      document
        .querySelectorAll('div.flex.items-center label')
        .forEach((lb, index) => {
          const optionIdx = listOptionSelect[index.toString()].idx;
          let btnOption = lb.nextSibling.childNodes[optionIdx];
          if (!btnOption.className.includes('product-variation--selected'))
            btnOption.click();
        });
    }, listOptionSelect);
  }

  let isReload;
  await page.waitForSelector('.btn-tinted');
  isReload = await page.evaluate((isReload) => {
    let button = document.querySelector('.btn-tinted').nextSibling;
    // console.log(button.textContent);
    if (button.className.includes('btn-solid-primary--disabled')) return true;
    else {
      isReload = false;
      button.click();
    }
  }, isReload);

  return isReload;
};

const payment = async (page) => {
  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });
  await page.waitForSelector(
    '.shopee-button-solid.shopee-button-solid--primary'
  );
  await page.evaluate((_) => {
    document
      .querySelector('.shopee-button-solid.shopee-button-solid--primary')
      .click();
  });

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('.checkout-payment-setting__payment-methods-tab');
  await page.evaluate((_) => {
    document
      .querySelector('.checkout-payment-setting__payment-methods-tab')
      .lastChild.children[0].click();
  });

  await page.waitForSelector('.loading-spinner-popup', { hidden: true });
  await page.evaluate((_) => {
    document.querySelector('.stardust-button.stardust-button--primary').click();
  });

  let orderStatusImgName = 'order' + new Date().toISOString() + '.jpg';
  await capture(page, orderStatusImgName);
};

const scraperObject = {
  url: 'http://shopee.vn',
  async scrape(browser) {
    let loginPage = await browser.newPage();
    logMsg(`Preparing to redirect to host ${this.url}...`);

    await login(loginPage, this.url);

    let page = await browser.newPage();
    // page.on('console', (msg) => {
    //   for (let i = 0; i < msg._args.length; ++i)
    //     console.log(`${i}: ${msg._args[i]}`);
    // });
    await page.setViewport({ width: 1024, height: 800 });
    const urlProduct = await new Input({
      message: 'Shopee product url: ',
      validate: (input) => {
        return Boolean(input.length);
      },
    }).run();

    const isHaveOption = await new Confirm({
      name: 'question',
      message: 'Have category?',
    }).run();

    await page.waitForTimeout(1000);
    logMsg(`Navigating to product url...`);
    await page.goto(urlProduct);

    let listOptionSelect = null;

    if (isHaveOption) {
      let { isReload, optionSelect } = await session(page, urlProduct);
      listOptionSelect = optionSelect;

      while (isReload) {
        logMsg('Reload page after 0.25s...');
        await page.waitForTimeout(250);
        await page.goto(urlProduct);
        isReload = await session(page, urlProduct, listOptionSelect);
      }
    }

    let isReload = await checkout(page, listOptionSelect, isHaveOption);

    while (isReload) {
      logMsg('Reload page after 0.25s...');
      await page.waitForTimeout(250);
      await page.goto(urlProduct);
      isReload = await checkout(page, listOptionSelect, isHaveOption);
    }

    await payment(page);

    await page.waitForTimeout(20000);
    await browser.close();
  },
};

module.exports = scraperObject;
