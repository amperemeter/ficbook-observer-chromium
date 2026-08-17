module.exports.proto = {
  id: "",
  name: "",
  url: "",
  lastArticleName: "",
  oldArticleCount: 0,
  articleCount: 0,
  setLastArticleName(lastArticleName) {
    this.lastArticleName = lastArticleName;
  },
  setArticleCount(count) {
    this.articleCount = count;
  },
  isNew() {
    return this.articleCount - this.oldArticleCount;
  },
  checkNew() {
    const diff = this.isNew();

    if (diff > 0) {
      console.log(`${this.name}\n${this.url}\nновых ${diff}\n`);
    } else if (diff < 0) {
      console.log(`${this.name}\nудалено ${diff}\n`);
    } else {
      // console.log('нет новых'); // для проверки
    }
  },
  async saveLocalData(changedFanfics) {
    if (!changedFanfics) return;

    const item = {
      name: this.name,
      url: this.url,
      count: this.articleCount,
    };

    if (!!this.lastArticleName) {
      item.article = this.lastArticleName;
    }

    changedFanfics.push(item);
  },
  async saveDataBase(collection) {
    try {
      if (!collection) return;

      if (this.isNew()) {
        await collection.updateOne(
          { url: this.url },
          { $set: { count: this.articleCount } },
        );
      }

      if (!!this.lastArticleName) {
        await collection.updateOne(
          { url: this.url },
          { $set: { article: this.lastArticleName } },
        );
      }
    } catch (err) {
      throw new Error(err);
    }
  },
};
