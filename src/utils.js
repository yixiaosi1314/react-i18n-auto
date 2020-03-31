
require('./options')

/**
 *
 * @param value
 * @param prefixKey
 * @returns {string}
 */

function genUuidKey (value, prefixKey) {
  let valArr = (value || '').trim().split(''), code = 0, total = 0
  valArr.forEach((val, index) => {
    let v = val.charCodeAt()
    total += v
    code += Math.log10(v) * (index + 1)
  })
  code += (value.length + total) * 100000
  let uniqueKey = parseInt(code).toString(36)
  return (prefixKey || process.$AI_OPTIONS.prefixKey ) + uniqueKey
}

/**
 *
 * @param val
 * @returns {boolean}
 */
function isChinese (val) {
  return /[\u4e00-\u9fa5]/.test(val)
}

/**
 *
 * @param key
 * @returns {string}
 */
function genPropertyKey (key) {
  return '$_' + (key || '')
}

/**
 *
 * @type {{}}
 */
let keysMap = {}

/**
 *
 * @param uuidKey
 * @param value
 */
function collectKeys (uuidKey, value) {
  if (!process.env.COLLECT_UUID) {
    return
  }

  value = (value || '').replace(/'/g, '"').trim()
  if (uuidKey && value && !keysMap[uuidKey]) {
    keysMap[uuidKey] = value
  }
}

/**
 *
 * @returns {{}}
 */
function getKeysMap () {
  return keysMap
}

/**
 *
 * @type {{isChinese: isChinese, genUuidKey: genUuidKey, getKeysMap: getKeysMap, collectKeys: collectKeys, genPropertyKey: genPropertyKey}}
 */
module.exports = {
  isChinese: isChinese,
  genUuidKey: genUuidKey,
  getKeysMap: getKeysMap,
  collectKeys: collectKeys,
  genPropertyKey: genPropertyKey
}
