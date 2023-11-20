// @ts-check
const { default: axios } = require("axios");
const fs = require("fs-extra");
const path = require("node:path");
const { logline } = require("./logline");

/**
 * @param {string} url
 * @param {string} baseurl
 * @param {string} htmlFolder
 */
async function getPage(url, baseurl, htmlFolder) {
  let relativeUrl = path.relative(baseurl, url);
  const fileName = path.parse(relativeUrl);
  if (fileName.ext == "") relativeUrl = `${relativeUrl}.html`;
  const fullName = path.join(htmlFolder, relativeUrl);
  if (!fs.pathExistsSync(fullName)) {
    logline(`loading ${fullName}`);
    const page = await axios.get(url);
    fs.ensureDirSync(path.join(htmlFolder, fileName.dir));
    fs.writeFileSync(fullName, page.data);
    return page.data.toString();
  } else {
    logline(`skipping ${fullName}`);
    return fs.readFileSync(fullName).toString();
  }
}
exports.getPage = getPage;
