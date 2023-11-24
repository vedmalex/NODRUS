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

const dict = new Dict();
const quotes = new Dict();
const sanskrit = new Dict();

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

const delimiters = [".", ",", "!", "?", ":", ";", "—", "(", ")", " ", "\n", "\r"];
const sentenceDelim = [".", "!", "?"];
const sentenceDelimPartners = [" ", "\"", "'", "«", "»", "“", "„"];
/**
 * @param {string} str
 * @param {string[]} delimiters
 */
function splitString(str, delimiters) {
  let result = [];
  let currentWord = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (delimiters.includes(char)) {
      if (currentWord !== "") {
        result.push(currentWord);
        currentWord = "";
      }
      result.push(char);
    } else {
      currentWord += char;
    }
  }

  if (currentWord !== "") {
    result.push(currentWord);
  }

  return result;
}

/**
 * @param {string} str
 * @param {string[]} delimiters
 */
function splitSentence(str, delimiters) {
  let result = [];
  let currentWord = "";

  for (let i = 0; i < str.length; i++) {
    let delimiterFound = false;

    for (let j = 0; j < delimiters.length; j++) {
      const delimiter = delimiters[j];

      if (str.startsWith(delimiter, i)) {
        currentWord += delimiter;
        i += delimiter.length - 1;
        delimiterFound = true;
        result.push(currentWord);
        currentWord = "";
        break;
      }
    }

    if (!delimiterFound) {
      currentWord += str[i];
    }
  }

  if (currentWord) {
    result.push(currentWord);
  }

  result = result.reduce((/** @type {string[]}*/ res, cur) => {
    if (
      // А.
      (cur.length < 3 && res.length > 0)
      // А.Ч.
      || (res.length > 0 && res[res.length - 1].length < 7)
    ) {
      res[res.length - 1] += cur;
    } else {
      res.push(cur);
    }
    return res;
  }, []);
  return result;
}
/**
 * @param {string[]} arr
 * @param {string[]} delimiters
 */
function mergeDelimiters(arr, delimiters) {
  let result = [];
  let currentDelimiter = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (delimiters.includes(element)) {
      currentDelimiter += element;
    } else {
      if (currentDelimiter !== "") {
        if (currentDelimiter.trim() !== "" || result.length === 0) {
          result.push({ delim: currentDelimiter });
        } else {
          result.push(currentDelimiter);
        }
        currentDelimiter = "";
      }
      result.push(element);
    }
  }

  if (currentDelimiter !== "") {
    result.push({ delim: currentDelimiter });
  }

  return result;
}

/**
 * @param { Array<string|{delim:string}> } arr
 */
function mergeStringElements(arr) {
  let result = [];
  let currentString = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (typeof element === "string") {
      currentString += element;
    } else {
      if (currentString !== "") {
        result.push(currentString);
        currentString = "";
      }
      result.push(element);
    }
  }

  if (currentString !== "") {
    result.push(currentString);
  }

  return result;
}

/**
 * @param { Array<string|{delim:string}> } arr
 * @param {string} tag
 */
function createString(arr, tag) {
  let result = "";

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (typeof element === "string") {
      result += `<${tag}>${element}</${tag}>`;
    } else if (typeof element === "object" && "delim" in element) {
      result += element.delim;
    }
  }
  return result;
}

function formatString(/** @type {string}*/ inputString) {
  const punctuationRegex = /\s+[.,?!:;\)\n]+/g;
  let result = inputString.replace(punctuationRegex, match => match.trim());
  return result;
}

processPages(
  (url, rel, text) => {
    // чистим текст от странных символов и случайных ошибок форматирования
    return text
      .replaceAll(new RegExp("&lt;&amp;&gt;", "g"), "")
      .replaceAll(new RegExp("&nbsp;", "g"), " ");
  },
  (url, rel, text) => {
    // удаляем ссылки на внешние источники там, где они не должны быть
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-synonyms > p a").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        t.removeAttr("href");
        t.replaceWith(t.children());
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы перевода
    const $ = cheerio.load(text, {}, false);
    let count = 0;
    let item = $(".wrapper-translation > div").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const id = `tr-${++count}`;
        t.attr("id", id);
        const st = t.find("strong");
        st.each((i, elem) => {
          const item = $(elem);
          const o = item?.html();
          if (o) {
            const res = prepareSentences(o, id, sentenceDelim);
            item.replaceWith(`<strong>${res}</strong>`);
          }
        });
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы комментария
    const $ = cheerio.load(text, {}, false);
    let count = 0;
    let item = $(".wrapper-puport > div").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const id = `purp-${++count}`;
        t.attr("id", id);
        const st = t.find("p");
        st.each((i, elem) => {
          const item = $(elem);
          const o = st?.html();
          if (o) {
            const res = prepareSentences(o, id, sentenceDelim);
            item.replaceWith(`<p>${res}</p>`);
          }
        });
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы основного текста
    const $ = cheerio.load(text, {}, false);
    let count = 0;
    let item = $(".col-12 > div");
    if (item.length > 0) {
      item.each((i, item) => {
        const t = $(item);
        const id = `text-${++count}`;
        t.attr("id", id);
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы основного текста
    const $ = cheerio.load(text, {}, false);
    let count = 0;
    let item = $(".wrapper-synonyms > div").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        t.attr("id", `syn-${++count}`);
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // правим содержимое em внутри комментариев, чтобы было проще сделать набор терминов
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-paragraph p em").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const o = t.html();
        if (o) {
          const result = createString(
            mergeStringElements(mergeDelimiters(splitString(o, delimiters), delimiters)),
            "em",
          );
          t.replaceWith(result);
        }
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // готовим термины внутри перевода текста
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-translation p em").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const o = t.html();
        if (o) {
          const result = createString(
            mergeStringElements(mergeDelimiters(splitString(o, delimiters), delimiters)),
            "em",
          );
          t.replaceWith(result);
        }
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // внутри параграфов убираем не правильные знаки препинания и лишние пробелы,
    // которые могли возникнуть в результате форматирования
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-paragraph p").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const o = t.html();
        if (o) {
          const result = formatString(o);
          t.replaceWith(`<p>${result}</p>`);
        }
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы основного текста
    const $ = cheerio.load(text, {}, false);
    let item = $(".col-12 > div > p");
    if (item.length > 0) {
      item.each((i, item) => {
        const st = $(item);
        const id = st.parents("div").attr("id");
        st.each((i, elem) => {
          const item = $(elem);
          const o = item?.html();
          if (o) {
            const res = prepareSentences(o, id, sentenceDelim);
            item.replaceWith(`<p>${res}</p>`);
          }
        });
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // перенумеровываем абзацы основного текста
    const $ = cheerio.load(text, {}, false);
    let count = 0;
    let item = $(".wrapper-verse-text > div").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const id = `verse-${++count}`;
        t.attr("id", id);
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // проставляем создаем ссылки на предложения в шлоках
    const $ = cheerio.load(text, {}, false);
    let st = $(".r-verse-text em");
    if (st.length > 0) {
      st.each((i, elem) => {
        const item = $(elem);
        const o = item?.html();
        if (o) {
          const id = $(elem).parents(".r-verse-text").attr("id");
          if (id) {
            const res = prepareSentences(o, id, ["<br />", "<br/>", "<br>"]);
            item.replaceWith(`${res}`);
          }
        }
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    // чистим текст от странных символов и случайных ошибок форматирования
    // в первом блоке не обрабатывается
    return text
      .replaceAll(new RegExp("([^\\s])-[\n\\s\\r]*(.)", "g"), "$1-$2");
  },
  (url, rel, text) => {
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-paragraph p em").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const term = t.text().split(" ").length === 1;
        const content = t.text().toLocaleLowerCase();
        const store = term ? dict : quotes;
        store.ensure(content);
        store.dict.get(content)?.items.push({ file: rel, url: `${url}#${t.parents(".r-paragraph").attr("id")}` });
        t.attr("id", `${store.ids[content]}`);
        t.addClass(term ? "term" : "quot");
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-translation p em").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const term = t.text().split(" ").length === 1;
        const content = t.text().toLocaleLowerCase();
        const store = term ? dict : quotes;
        store.ensure(content);
        store.dict.get(content)
          ?.items.push({ file: rel, url: `${url}#${t.parents(".r-translation").attr("id")}` });
        t.attr("id", `${store.ids[content]}`);
        t.addClass(term ? "term" : "quot");
      });
      return $.html();
    } else {
      return text;
    }
  },
  (url, rel, text) => {
    const $ = cheerio.load(text, {}, false);
    let item = $(".r-synonyms p em").toArray();
    if (item.length > 0) {
      item.forEach(item => {
        const t = $(item);
        const content = t.text().toLocaleLowerCase();
        sanskrit.ensure(content);
        sanskrit.dict.get(content)?.items.push({ file: rel, url: `${url}#${t.parents(".r-synonyms").attr("id")}` });
        t.attr("id", `${sanskrit.ids[content]}`);
        t.addClass("sanskrit");
      });
      return $.html();
    } else {
      return text;
    }
  },
)
  .then((_) => {
    console.log("done");
  })
  .catch((err) => {
    console.log();
    console.log(url);
    console.log(err);
    linkstoload.unshift(url);
    fs.writeJSONSync(path.join(htmlFolder, "dump.json"), linkstoload);
  });

exports.logline = logline;

/**
 * @param {string} o
 * @param {string} id
 * @param {string[]} sentenceDelim
 * @returns {string}
 */
function prepareSentences(o, id, sentenceDelim) {
  let prep = o
    .replaceAll("и т. д.,", "____,")
    .replaceAll("и т. д.", "____.")
    .replaceAll(/(\d)[.](\d)/ig, "$1[dot]$2")
    .replaceAll(/(\d)[,](\d)/ig, "$1[comma]$2");

  const sp = splitSentence(prep, [...sentenceDelim, ":"]);

  prep = sp.map((sentence, index) =>
    sentence ? `<span id="${id}-${index + 1}" class="sentense">${sentence}</span>` : sentence
  ).join(
    "",
  );

  prep = prep.replaceAll("____,", "и т. д.,")
    .replaceAll("____.", "и т. д.")
    .replaceAll(/(\d)\[dot\](\d)/ig, "$1.$2")
    .replaceAll(/(\d)\[comma\](\d)/ig, "$1,$2");

  return prep;
}
