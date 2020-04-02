const fileUtils = require('./fs-utils')
const path = require('path')
const XLSX = require('xlsx')
/**
 *
 * @param version
 * @returns {string|*|XML|void}
 */
const genPolyfill = function (version) {
  return fileUtils.readCodeText(path.resolve(__dirname, './tplCode/polyfill.js')).replace('${version}', version)
}
/**
 *
 * @param version
 * @returns {*}
 */
const genLocale = function (version) {
  return fileUtils.readCodeText(path.resolve(__dirname, './tplCode/locale.js'))
}

/**
 *
 * @param data
 * @returns {Number|*}
 */
function genXLSXData(data) {
  let ws = XLSX.utils.json_to_sheet(data)
  let wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

/**
 *
 * @type {{genPolyfill: genPolyfill, genLocale: genLocale, genXLSXData: genXLSXData}}
 */
module.exports = {
  genPolyfill: genPolyfill,
  genLocale: genLocale,
  genXLSXData: genXLSXData
}