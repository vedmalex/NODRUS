// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const cheerio = require("cheerio");
const { loadPageFromCache } = require("./loadPageFromCache");
const { writeUpdatedFile } = require("./writeUpdatedFile");

const { getToc } = require("./getToc");
const { getVerses } = require("./getVerses");
const { getBook } = require("./getBook");
const { logline } = require("./logline");

const site = "https://vedabase.io";
exports.site = site;
const baseurl = `${site}`;
const htmlFolder = "./sources/";

fs.existsSync(path.join(htmlFolder, "dump.json"));

/** @type {Array<string>} */
const linkstoload = [
  // "https://vedabase.io/ru/library/cc/",
  // "https://vedabase.io/ru/library/sb/",
  "https://vedabase.io/ru/library/noi/",
  "https://vedabase.io/ru/library/nod/",
  "https://vedabase.io/ru/library/iso/",
  "https://vedabase.io/ru/library/bg/",
];

// предоположительно работать будет из кэша

/**
 * @type {string}
 */
let url;
/**
 * @param {Array<{ (url: string, rel: string, text: string ): string }>} actions
 */
async function processPages(...actions) {
  while (linkstoload.length > 0) {
    url = linkstoload.shift();
    const page = await loadPageFromCache(url, baseurl, htmlFolder);

    const links = [...getToc(page.text, site), ...getVerses(page.text, site), ...getBook(page.text, site)];
    links.forEach((link) => linkstoload.push(link.href));

    let ret = page.text;
    actions.forEach(action => {
      ret = action(url, page.relativeUrl, ret);
    });
    writeUpdatedFile(url, baseurl, htmlFolder, ret);
  }
}

class Dict {
  /** @type {Map<string, {id: number, items:any, [key:string]:any}>} */
  dict = new Map();
  /** @type Record<string,number> */
  ids = {};
  count = 0;
  ensure(/** @type {string}*/ content) {
    if (!this.dict.has(content)) {
      this.count += 1;
      this.ids[content] = this.count;
      this.dict.set(content, { id: this.count, items: [] });
    }
  }
}

const quotes = new Dict();

// TODO: переписать под новую версию
// const loadCheerio = (self, selector) => {
//   // если селектора нет, тогда нужно проинициализировать cheerio
//   if (!selector) return cheerio(self);
//   // если передан селектор, тогда нужно пойти по коду и выбрать данные
//   if (typeof self === "object") {
//     return cheerio.load(self)(selector);
//   }
//   return self(selector);
// };

processPages(
  (url, rel, text) => {
    const $ = cheerio.load(text, {}, false);
    let item = $("em.quot");
    if (item.length > 0) {
      item.each((i, item) => {
        const t = $(item);
        const content = t.text().toLocaleLowerCase();
        quotes.ensure(content);
        quotes.dict.get(content)?.items.push({ file: rel, url: `${url}#${t.parents(".sentence").attr("id")}` });
        t.attr("id", `${quotes.ids[content]}`);
      });
      return $.html();
    } else {
      return text;
    }
  },
)
  .then((_) => {
    console.log();
    console.log("done");
    fs.writeFileSync("quotes.txt", Bun.inspect(quotes.dict.entries()));
  })
  .catch((err) => {
    console.log();
    console.log(url);
    console.log(err);
    linkstoload.unshift(url);
    fs.writeJSONSync(path.join(htmlFolder, "dump.json"), linkstoload);
  });

exports.logline = logline;
