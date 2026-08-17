const cheerio = require("cheerio");
const { askCheck, askDelete, timeout } = require("./utils");

module.exports.scrape = async (fanficContext, props, page) => {    
  let hotArticles = 0,
  name = fanficContext.name,
  link = fanficContext.url,
  noFic = "";

  const getLastPage = async () => {
    await page.goto(`${link}?p=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // await page.screenshot({ path: 'adblocker.png', fullPage: true });
    // console.log(await page.title());        
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // await timeout(1000);
    
    if (!$(".main-holder").length && !link.includes("pairings")) {          
      throw new Error("Возникла непредвиденная ошибка в getLastPage!");
    }

    const lastPage =
      Number($(".pagination a:nth-last-child(2)").html()) || 1;

    // проверить наличие блока с "горячими работами"
    const blockSeparator = $(".block-separator");

    if (blockSeparator.length) {
      hotArticles = blockSeparator
        .parent("section")
        .children("article").length;
    }
    
    return lastPage;
  };

  const getArticles = async (lastPage) => {
    await page.goto(`${link}?p=${lastPage}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);

    await timeout(1000);
    
    if (!$(".main-holder").length && !link.includes("pairings")) {
      throw new Error("Возникла непредвиденная ошибка в getArticles!");
    }

    // вычислить количество фанфиков
    const articlesOnLastPage = $(".fanfic-inline").length;
    
    let articles = (lastPage - 1) * 20 + articlesOnLastPage;

    if (lastPage === 1) {
      articles = articles - hotArticles;
    }

    if (articles === 2000) {
      const lastArticleName = $(".fanfic-inline-title a")
        .last()
        .text()
        .trim();

      if (fanficContext.oldLastArticleName !== lastArticleName) {
        if (fanficContext.oldLastArticleName) {
          console.log(
            `${fanficContext.name}\n${fanficContext.url}\nесть изменения\n`,
          );
        }

        fanficContext.setLastArticleName(lastArticleName);
      }
    }

    // если нет фанфиков, но до этого они были,
    // спрашиваем об изменении количества фанфиков в бд
    if (!articles && fanficContext.oldArticleCount ||  fanficContext.oldArticleCount - articles > 20) {
      await askCheck(fanficContext);
      const answer = await askDelete();

      if (answer === "н") {
        articles = fanficContext.oldArticleCount;
      }
    }

    if (!articles) {
      noFic = [fanficContext.name, fanficContext.url];
    }

    return articles;
  };

  const saveData = async () => {
    const lastPage = await getLastPage();
    const articles = await getArticles(lastPage);

    fanficContext.setArticleCount(articles); // установить значение в свойство articleCount
    fanficContext.checkNew(); // проверить разницу между oldArticleCount и articleCount
    await fanficContext.saveLocalData(props.changedFanfics); // сохранить данные
    await fanficContext.saveDataBase(props.collection); // сохранить кол-во новых работ      
    return true;
  };

  let res, ms = 10000;
  
  setTimeout(() => !res && console.warn(`Ожидание больше ${ms / 1000} секунд\n${name}: ${link}\n`), ms);
  res = await saveData();

  return noFic;
};