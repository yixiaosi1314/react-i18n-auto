const babel = require('@babel/core')
const fileUtils = require('./fs-utils')
const genUtils = require('./gen-utils')
const plugin = require('../plugin')
const utils = require('../utils')
const XLSX = require('xlsx')
const path = require('path')
const babelrc = require('./babelrc')
const ora = require('ora')
const fs = require('fs')
const myOra = ora()
process.env.COLLECT_UUID = true

/**
 *
 * @param options
 */
const transformCode = function (options) {
  let srcDir = options.src
  if (typeof srcDir === 'string') {
    srcDir = [srcDir]
  }
  srcDir.forEach(src => {
    let fileList = fileUtils.getFileList(src || '')
    fileList.forEach(filePath => {

      let isInclude = true, isExcluded = false
      if (options.include) {
        isInclude = options.include.test(filePath)
      }
      if (options.excluded) {
        isExcluded = options.excluded.test(filePath)
      }

      if (isInclude && !isExcluded) {
        let babelConfig = options.babelrc
          ? options.babelrc === true
            ? {babelrc: true}
            : Object.assign(options.babelrc, {babelrc: false,})
          : {
            babelrc: false,
            plugins: [].concat(babelrc.plugins, [[plugin, options.pluginOptions || {}]])
          }
        let babelObj = babel.transformFileSync(filePath, babelConfig)
        if (options._test) {
          let newFilePath = filePath.replace(src, '')
          let output = path.resolve(options.outputPath, './compile' + newFilePath)
          fileUtils.writeFile(output, babelObj.code)
        }

      }
    })
  })

}

/**
 *
 * @param options
 * @param oldKeysMap
 */
function genTranslateFile (options, oldKeysMap) {
  let tranKeys = Object.keys(options.translation || {})
  if (tranKeys && tranKeys.length) {
    myOra.info('翻译文件生成中')

    tranKeys.forEach(key => {

      let sourceFiles = options.translation[key].source
      if (typeof sourceFiles === 'string') {
        sourceFiles = [sourceFiles]
      }
      let translateObj = {}

      sourceFiles.forEach(path => {

        let workbook = XLSX.readFile(path)

        workbook.SheetNames.forEach(name => {

          let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[name])
          let tempObj = {}
          sheetData.forEach(item => {
            tempObj[item.key] = (item.text || '').replace(/(<\/?)\s*([a-zA-z])+\s*(>)/g, '$1$2$3')  //移除标签空格
          })
          Object.assign(translateObj, tempObj)
        })
      })

      let localeResult = {}
      let xlsxData = []
      let jsonData = {}

      Object.keys(oldKeysMap).map((key, index) => {

        if (translateObj[key]) {
          localeResult[key] = translateObj[key]
        }
        else {
          xlsxData.push({
            key: key,
            text: oldKeysMap[key],
          })
          jsonData[key] = oldKeysMap[key]
        }
      })
      let localeCode = 'module.exports = ' + JSON.stringify(localeResult)
      let tranPath = path.resolve(options.outputPath, './' + key + '/locale.js')
      fileUtils.writeFile(tranPath, localeCode)

      myOra.succeed(key + ' 语言包文件生成成功')

      let outputXlsxPath = path.resolve(options.outputPath, './' + key + '/待翻译内容.xlsx')
      let outputJsonPath = path.resolve(options.outputPath, './' + key + '/待翻译内容.json')
      if (xlsxData.length) {

        myOra.warn(xlsxData.length + '条待翻译')

        let buf = genUtils.genXLSXData(xlsxData)
        fileUtils.writeFile(outputXlsxPath, buf)
        fileUtils.writeFile(outputJsonPath, JSON.stringify(jsonData))

        myOra.info('待翻译文件保存目录：')
        myOra.info(' > ' + outputXlsxPath)
        myOra.info(' > ' + outputJsonPath)
      }
      else {
        fileUtils.deleteFile(outputXlsxPath)
        fileUtils.deleteFile(outputJsonPath)
      }
    })
  }
}

/**
 *
 * @param opt
 */
function genConfigFile (opt) {

  myOra.info('国际化配置生成中')
  let options = Object.assign({
    include: /(\.js|\.jsx)$/,
    excluded: /node_modules/,
  }, opt)
  if (!options.src) {
    myOra.fail('源文件目录 src 配置不可为空')
    return
  }
  if (!options.outputPath) {
    myOra.fail('输出目录 outputPath 配置不可为空')
    return
  }
  transformCode(options)
  myOra.succeed('文件解析完成')

  let keysMap = utils.getKeysMap(), oldKeysMap = {}
  let localeFilePath = path.resolve(options.outputPath, './zh_CN/locale.js')
  if (fs.existsSync(localeFilePath)) {
    oldKeysMap = require(localeFilePath)
  }
  let oldKeysMapKeys = Object.keys(oldKeysMap)
  let textKeyArr = [], newTextKeyArr = [], sortKeysMap = {}
  Object.keys(keysMap).map(key => {
    if (oldKeysMapKeys.length && !oldKeysMap[key]) {
      newTextKeyArr.push(key)
    }
    else {
      textKeyArr.push(key)
    }
  })
  if (oldKeysMapKeys.length) {
    textKeyArr.sort((a, b) => {
      return oldKeysMapKeys.indexOf(a) - oldKeysMapKeys.indexOf(b)
    })
  }
  let allTextKey = textKeyArr.concat(newTextKeyArr)

  let textArr = []
  let xlsxData = allTextKey.map(key => {
    textArr.push(keysMap[key])
    sortKeysMap[key] = keysMap[key]
    return {
      key,
      text: keysMap[key]
    }
  })

  let version = utils.genUuidKey(JSON.stringify(keysMap), 'v_')
  let i18nPolyfillCode = genUtils.genPolyfill(version)
  fileUtils.writeFile(path.resolve(options.outputPath, './localePolyfill.js'), i18nPolyfillCode)
  myOra.succeed('localePolyfill.js 生成完毕')

  fileUtils.writeFile(path.resolve(options.outputPath, './localeUtils.js'), genUtils.genLocale())
  myOra.succeed('localeUtils.js 生成完毕')

  let localeCode = 'module.exports = ' + JSON.stringify(sortKeysMap)
  fileUtils.writeFile(path.resolve(options.outputPath, './zh_CN/locale.js'), localeCode)

  let buf = genUtils.genXLSXData(xlsxData)
  fileUtils.writeFile(path.resolve(options.outputPath, './zh_CN/国际化语言包.xlsx'), buf)

  myOra.succeed('zh_CN 语言包文件生成成功')

  genTranslateFile(options, oldKeysMap)

  myOra.succeed('国际化配置及语言包文件生成完毕')
}

/**
 *
 * @type {genConfigFile}
 */
module.exports = genConfigFile

