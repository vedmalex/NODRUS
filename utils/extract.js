// @ts-check
const fs = require('fs-extra')
const path = require('node:path')
const { getPageCached } = require('./getPageCached')
const { getToc } = require('./getToc')
const { getVerses } = require('./getVerses')
const { getBook } = require('./getBook')
const { logline } = require('./logline')

const site = 'https://vedabase.io'
exports.site = site
const baseurl = `${site}/ru/library/`
const htmlFolder = './sources/'

fs.existsSync(path.join(htmlFolder, 'dump.json'))

/** @type {Array<string>} */
const linkstoload = [
  'https://vedabase.io/ru/library/bg/',
  'https://vedabase.io/ru/library/iso/',
  'https://vedabase.io/ru/library/nod/',
  'https://vedabase.io/ru/library/noi/',
  'https://vedabase.io/ru/library/sb/',
  'https://vedabase.io/ru/library/cc/',
]

// предоположительно работать будет из кэша

async function processPages() {
  while (linkstoload.length > 0) {
    let url = linkstoload.shift()
    const text = await getPageCached(url, baseurl, htmlFolder)
    const links = [...getToc(text, site), ...getVerses(text, site), ...getBook(text, site)]
    links.forEach((link) => linkstoload.push(link.href))
  }
}

processPages()
  .then((_) => {
    console.log('done')
    if (fs.existsSync(path.join(htmlFolder, 'dump.json'))) {
      fs.unlinkSync(path.join(htmlFolder, 'dump.json'))
    }
  })
  .catch((err) => {
    console.log(err)
    linkstoload.unshift(url)
    fs.writeJSONSync(path.join(htmlFolder, 'dump.json'), linkstoload)
  })

exports.logline = logline
