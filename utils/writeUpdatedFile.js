// @ts-check
const fs = require("fs-extra");
const path = require("node:path");
const { logline } = require("./logline");
const cheerio = require("cheerio");
const prettier = require("prettier");
/**
 * @param {string} url
 * @param {string} baseurl
 * @param {string} htmlFolder
 * @param {string} text
 */
async function writeUpdatedFile(url, baseurl, htmlFolder, text) {
  if (text) {
    let relativeUrl = path.relative(baseurl, url);
    const fileName = path.parse(relativeUrl);
    if (fileName.ext == "") relativeUrl = `${relativeUrl}.html`;
    const fullName = path.join(htmlFolder, relativeUrl);
    const $ = cheerio.load(text);
    const content = $("#content").html();
    if (content) {
      logline(` ${fullName}`);
      text = content;
    }
    try {
      const result = prettier.format(text, {
        parser: "html",
        htmlWhitespaceSensitivity: "css",
      });
      // const result = text;
      fs.ensureDirSync(path.dirname(fullName));
      fs.writeFileSync(fullName, result);
      return result;
    } catch (err) {
      logline(`error ${fullName}`);
      throw err;
    }
  }
}

exports.writeUpdatedFile = writeUpdatedFile;
