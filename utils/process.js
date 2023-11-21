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
// const baseurl = `${site}/ru/library/`;
const baseurl = `${site}`;
const htmlFolder = "./sources/";
const backupFolder = "./backup/";

fs.existsSync(path.join(htmlFolder, "dump.json"));

/** @type {Array<string>} */
const linkstoload = [
  "https://vedabase.io/ru/library/bg/",
  // "https://vedabase.io/ru/library/iso/",
  // "https://vedabase.io/ru/library/nod/",
  // "https://vedabase.io/ru/library/noi/",
  // "https://vedabase.io/ru/library/sb/",
  // "https://vedabase.io/ru/library/cc/",
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
    const page = await loadPageFromCache(url, baseurl, backupFolder);

    let ret = "";
    actions.forEach(action => {
      ret = action(url, page.relativeUrl, page.text);
    });
    if (ret !== page.text) {
      writeUpdatedFile(url, baseurl, htmlFolder, ret);
    }
    const links = [...getToc(page.text, site), ...getVerses(page.text, site), ...getBook(page.text, site)];
    links.forEach((link) => linkstoload.push(link.href));
  }
}

const dict = new Map();
/** @type Record<string,number> */
let ids = {};
let count = 0;

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

processPages((url, rel, text) => {
  const $ = cheerio.load(text, {}, false);
  let item = $(".r-paragraph > p > em").toArray();
  if (item.length > 0) {
    item.forEach(item => {
      const t = $(item);
      const content = t.text();
      if (!dict.has(content)) {
        count += 1;
        ids[content] = count;
        dict.set(content, { id: count, items: [] });
      }
      dict.get(content).items.push({ file: rel, url: `${url}#${t.parents(".r-paragraph").attr("id")}` });
      t.attr("id", `${ids[content]}`);
      t.addClass("decide-term");
    });
    return $.html();
  } else {
    return text;
  }
}, (url, rel, text) => {
  const $ = cheerio.load(text, {}, false);
  let item = $(".r-synonyms > p > em").toArray();
  if (item.length > 0) {
    item.forEach(item => {
      const t = $(item);
      const content = t.text();
      if (!dict.has(content)) {
        count += 1;
        ids[content] = count;
        dict.set(content, { id: count, items: [] });
      }
      dict.get(content).items.push({ file: rel, url: `${url}#${t.parents(".r-paragraph").attr("id")}` });
      t.attr("id", `${ids[content]}`);
      t.addClass("decide-term");
    });
    return $.html();
  } else {
    return text;
  }
})
  .then((_) => {
    console.log("done");
    console.log(dict);
    if (fs.existsSync(path.join(htmlFolder, "dump.json"))) {
      fs.unlinkSync(path.join(htmlFolder, "dump.json"));
    }
  })
  .catch((err) => {
    console.log();
    console.log(url);
    console.log(err);
    linkstoload.unshift(url);
    fs.writeJSONSync(path.join(htmlFolder, "dump.json"), linkstoload);
  });

exports.logline = logline;
