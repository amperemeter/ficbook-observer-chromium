const { proto } = require("./proto");
const { scrape } = require("./scrape");
const { timeout } = require("./utils");
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

module.exports.readCollection = async (fanfics, props) => {
  console.time("Время работы");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fanficsCopied = [],
    emptyFandoms = [];

  fanfics.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));

  for (let i = 0; i < fanfics.length; i++) {
    const fanfic = Object.assign({}, proto);
    fanfic.id = fanfics[i]._id;
    fanfic.name = fanfics[i].name;
    fanfic.url = fanfics[i].url;
    fanfic.oldArticleCount = fanfics[i].count;
    fanfic.oldLastArticleName = fanfics[i].article;
    fanficsCopied.push(fanfic);
  }

  for (let i = 0; i < fanficsCopied.length; i++) {
    try {
      await timeout(1000);
      const res = await scrape(fanficsCopied[i], props, page);

      if (res) {
        emptyFandoms.push(res);
      }
    } catch (err) {
      console.error(`${err.message}\n${fanficsCopied[i].name}: ${fanficsCopied[i].url}\n`);
    }
  }

  if (emptyFandoms.length) {
    console.log(`Нет работ: ${emptyFandoms.length}\n`);

    // const obj = {};
    // emptyFandoms.forEach((item) => (obj[item[0]] = item[1]));
    // console.log(obj);
    // console.log("\n");
  }

  await browser.close();   
  console.timeEnd("Время работы");
};
