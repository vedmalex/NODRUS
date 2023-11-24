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
 * @param {string} backupFolder
 */
async function getPageCached(url, baseurl, htmlFolder, backupFolder) {
  let relativeUrl = path.relative(baseurl, url);
  const fileName = path.parse(relativeUrl);
  if (fileName.ext == "") relativeUrl = `${relativeUrl}.html`;
  const fileNameDest = path.join(htmlFolder, relativeUrl);
  const fileNameSource = path.join(backupFolder, relativeUrl);
  let text;
  if (fs.pathExistsSync(fileNameSource)) {
    text = fs.readFileSync(fileNameSource).toString();
  } else {
    text = await getPage(url, baseurl, backupFolder);
  }
  const $ = cheerio.load(text);
  const content = $("#content").html();
  if (content) {
    logline(` ${fileNameDest}`);
    text = content;
  }
  try {
    const result = prettier.format(text, {
      parser: "html",
      htmlWhitespaceSensitivity: "css",
    });
    if (result != text) {
      logline(`prettify ${fileNameDest}`);
      fs.writeFileSync(fileNameDest, result);
    } else {
      logline(`skipping ${fileNameDest}`);
    }
    return result;
  } catch (err) {
    logline(`error ${fileNameDest}`);
    throw err;
  }
}

exports.getPageCached = getPageCached;
