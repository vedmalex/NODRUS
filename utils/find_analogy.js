// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const cheerio = require("cheerio");
const { loadPageFromCache } = require("./loadPageFromCache");

const { getToc } = require("./getToc");
const { getVerses } = require("./getVerses");
const { getBook } = require("./getBook");
const { logline } = require("./logline");

const site = "https://vedabase.io";
exports.site = site;
// const baseurl = `${site}/ru/library/`;
const baseurl = `${site}`;
const htmlFolder = "./sources/";

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
    const page = await loadPageFromCache(url, baseurl, htmlFolder);

    let ret = page.text;
    actions.forEach(action => {
      action(url, page.relativeUrl, ret);
    });

    const links = [...getToc(page.text, site), ...getVerses(page.text, site), ...getBook(page.text, site)];
    links.forEach((link) => linkstoload.push(link.href));
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

const analogies = new Dict();

processPages(
  (url, rel, text) => {
    // ангалогии
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-paragraph p").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const para = t.html();
        if (
          para
        ) {
          const ref = { url, id: t.parents(".r-paragraph").attr("id") };
          const key = ref.url + ref.id;
          let rating = 0;
          const prep = para.replaceAll("и т. д.,", ",").replaceAll("и т. д.", ".");
          prep.split(/[!\?\.]/ig).filter(i => i).forEach((sentence, i) => {
            // предложения в котором встречается слово
            let sRating = 0;
            let words = [];
            if (sentence.match(/аналог/ig)) {
              sRating += 1;
              words.push(...["аналог"]);
            }
            if (sentence.match(/например/ig)) {
              sRating += 1;
              words.push(...["например"]);
            }
            if (sentence.match(/подоб/ig)) {
              sRating += 1;
              words.push(...["подоб"]);
            }
            if ((sentence.match(/как/ig) && sentence.match(/так/ig))) {
              sRating += 1;
              words.push(...["как", "так"]);
            }
            if (sentence.match(/так же как/ig)) {
              sRating += 1;
              words.push(...["так же как"]);
            }
            if (sentence.match(/также/ig)) {
              sRating += 1;
              words.push(...["также"]);
            }
            if (sentence.match(/такого же/ig)) {
              sRating += 1;
              words.push(...["такого же"]);
            }
            if (sentence.match(/такой же/ig)) {
              sRating += 1;
              words.push(...["такой же"]);
            }
            if (sentence.match(/такая же/ig)) {
              sRating += 1;
              words.push(...["такая же"]);
            }
            if (sentence.match(/такие же/ig)) {
              sRating += 1;
              words.push(...["такие же"]);
            }
            if (sentence.match(/такое же/ig)) {
              sRating += 1;
              words.push(...["такое же"]);
            }
            if (sentence.match(/разни/ig)) {
              sRating += 1;
              words.push(...["разни"]);
            }
            if (sentence.match(/сравн/ig)) {
              sRating += 1;
              words.push(...["сравн"]);
            }
            if (sentence.match(/это тоже/ig)) {
              sRating += 1;
              words.push(...["это тоже"]);
            }
            if (sentence.match(/ рода /ig)) {
              sRating += 1;
              words.push(...[" рода "]);
            }
            if (sentence.match(/так называ/ig)) {
              sRating += 1;
              words.push(...["так называ"]);
            }
            if (sentence.match(/похож/ig)) {
              sRating += 1;
              words.push(...["похож"]);
            }
            if (sentence.match(/ оба /ig)) {
              sRating += 1;
              words.push(...["оба"]);
            }
            if (sentence.match(/ равно как /ig)) {
              sRating += 1;
              words.push(...["равно как"]);
            }
            if (sentence.match(/столько/ig)) {
              sRating += 1;
              words.push(...["столько"]);
            }
            if (sentence.match(/так..(.)? же/ig)) {
              sRating += 1;
              words.push(...["столько"]);
            }
            if (sentence.match(/таким образом/ig)) {
              sRating += 1;
              words.push(...["таким образом"]);
            }
            if (sentence.match(/заключить/ig)) {
              sRating += 1;
              words.push(...["заключить"]);
            }
            if (sentence.match(/вывод /ig)) {
              sRating += 1;
              words.push(...["вывод"]);
            }

            if (sRating > 0) {
              // добавить предложение к абзаца

              analogies.ensure(key);
              const it = analogies.dict.get(key);
              rating += sRating;
              if (it) {
                it.items.push({
                  rating: sRating,
                  words: words.join(),
                  i,
                  sentence,
                });
              }
            }
          });
          const it = analogies.dict.get(key);
          if (it) {
            it.rating = rating;
            it.text = t.text();
            it.ref = ref;
          }
        }
      });
    }
    return text;
  },
)
  .then((_) => {
    console.log("done");
    fs.writeFileSync("result.txt", Bun.inspect(analogies.dict.entries()));
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
