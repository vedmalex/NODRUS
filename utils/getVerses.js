// @ts-check
const path = require("node:path");
const cheerio = require("cheerio");

/**
 * @returns { Array<{text:string, href: string}>}
 * @param {string} page
 * @param {string} site
 */
function getVerses(page, site) {
  const $ = cheerio.load(page);
  const list = $(".r-verse a");
  return [...list].map((item) => ({
    href: path.join(site, item.attribs.href),
    text: item.children.map((t) => t.data).join("\n"),
  }));
}
exports.getVerses = getVerses;
