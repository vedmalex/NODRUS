// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const { getPage } = require("./getPage");
const { getToc } = require("./getToc");
const { getVerses } = require("./getVerses");
const { getBook } = require("./getBook");
const { logline } = require("./logline");

const site = "https://vedabase.io/";
exports.site = site;
const baseurl = `${site}/ru/library/`;
exports.baseurl = baseurl;
const htmlFolder = "./sources/";
exports.htmlFolder = htmlFolder;

fs.existsSync(path.join(htmlFolder, "dump.json"));

/** @type {Array<string>} */
const linkstoload = fs.existsSync(path.join(htmlFolder, "dump.json"))
  ? fs.readJSONSync(path.join(htmlFolder, "dump.json"))
  : ["https://vedabase.io/ru/library/sb/", "https://vedabase.io/ru/library/cc/"];

let url;
async function processPages() {
  while (linkstoload.length > 0) {
    url = linkstoload.shift();
    const text = await getPage(url, baseurl, htmlFolder);
    const links = [
      ...getToc(text, site),
      ...getVerses(text, site),
      ...getBook(text, site),
    ];
    links.forEach((link) => linkstoload.push(link.href));
  }
}

processPages()
  .then((_) => {
    console.log("done");
    if (fs.existsSync(path.join(htmlFolder, "dump.json"))) {
      fs.unlinkSync(path.join(htmlFolder, "dump.json"));
    }
  })
  .catch((err) => {
    console.log(err);
    linkstoload.unshift(url);
    fs.writeJSONSync(path.join(htmlFolder, "dump.json"), linkstoload);
  });

exports.logline = logline;
