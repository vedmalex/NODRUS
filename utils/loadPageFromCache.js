// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const { logline } = require("./logline");
const { getPage } = require("./getPage");
const cheerio = require("cheerio");
/**
 * @param {string} url
 * @param {string} baseurl
 * @param {string} htmlFolder
 */
async function loadPageFromCache(url, baseurl, htmlFolder) {
  let relativeUrl = path.relative(baseurl, url);
  const fileName = path.parse(relativeUrl);
  if (fileName.ext == "") relativeUrl = `${relativeUrl}.html`;
  const fullName = path.join(htmlFolder, relativeUrl);
  let text;
  if (fs.pathExistsSync(fullName)) {
    text = fs.readFileSync(fullName).toString();
  } else {
    text = await getPage(url, baseurl, htmlFolder);
  }
  const $ = cheerio.load(text);
  const content = $("#content").html();
  if (content) {
    logline(` ${fullName}`);
    text = content;
  }
  return { text, relativeUrl };
}

exports.loadPageFromCache = loadPageFromCache;
