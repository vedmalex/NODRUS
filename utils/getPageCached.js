// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const { logline } = require("./logline");
const { getPage } = require("./getPage");
const cheerio = require("cheerio");
const prettier = require("prettier");
/**
 * @param {string} url
 * @param {string} baseurl
 * @param {string} htmlFolder
 */
async function getPageCached(url, baseurl, htmlFolder) {
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
    debugger;
    fs.writeFileSync(fullName, content);
    text = content;
  }
  try {
    const result = prettier.format(text, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    });
    if (result != text) {
      logline(`prettify ${fullName}`);
      fs.writeFileSync(fullName, result);
    } else {
      logline(`skipping ${fullName}`);
    }
    return result;
  } catch (err) {
    logline(`error ${fullName}`);
    throw err;
  }
}

exports.getPageCached = getPageCached;
