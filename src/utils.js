
require('./options')
const ora = require('ora')
const myOra = ora()
/**
 *
 * @param value
 * @param prefixKey
 * @returns {string}
 */

function genUuidKey(value, prefixKey) {
  let valArr = (value || '').trim().split(''), code = 0, total = 0
  valArr.forEach((val, index) => {
    let v = val.charCodeAt()
    total += v
    code += Math.log10(v) * (index + 1)
  })
  // 注此方法生成的key，存在重复的可能，概率极小
  // todo:待优化
  code += (value.length + total) * 1000000 //控制key的长度，值越大重复的概率越小
  let uniqueKey = parseInt(code).toString(36)
  return (prefixKey || process.$AI_OPTIONS.prefixKey) + uniqueKey
}

/**
 *
 * @param val
 * @returns {boolean}
 */
function isChinese(val) {
  return /[\u4e00-\u9fa5]/.test(val)
}

/**
 *
 * @param key
 * @returns {string}
 */
function genPropertyKey(key) {
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
function collectKeys(uuidKey, value) {
  if (!process.env.COLLECT_UUID) {
    return
  }

  value = (value || '').replace(/'/g, '"').trim()
  if (keysMap[uuidKey] && value && keysMap[uuidKey] !== value) {
    myOra.warn('存在重复的key：'+ uuidKey + ' ---> ' + keysMap[uuidKey] + ' ---> ' + value)
    myOra.info('请给其中之一添加自定义key值，example：$AI("xxx","'+value+'")')
  } else if (uuidKey && value && !keysMap[uuidKey]) {
    keysMap[uuidKey] = value
  }
}

/**
 *
 * @returns {{}}
 */
function getKeysMap() {
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
