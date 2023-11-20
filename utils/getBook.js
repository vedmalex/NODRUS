// @ts-check
const path = require("node:path");
const cheerio = require("cheerio");

/**
 * @returns { Array<{text:string, href: string}>}
 * @param {string} page
 * @param {string} site
 */
function getBook(page, site) {
  const $ = cheerio.load(page);
  const list = $(".book-item a");
  return [...list].map((item) => ({
    href: path.join(site, item.attribs.href),
    text: item.children.map((t) => t.data).join("\n"),
  }));
}
exports.getBook = getBook;
