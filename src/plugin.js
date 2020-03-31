const _options = require('./options')
const utils = require('./utils')
const types = require('@babel/types')
const babel = require('@babel/core')
const pluginUtils = require('./plugin-utils')
const ora = require('ora')
const myOra = ora()
/**
 *
 * @param api
 * @param config
 * @returns {{visitor: {StringLiteral: (function(*=)), ObjectProperty: (function(*=)), JSXText: (function(*)), TemplateElement: (function(*)), CallExpression: (function(*=))}}}
 */
const plugin = function (api, config) {
  let options = Object.assign({}, _options, config)
  options.excludedCall = _options.excludedCall.concat(config.excludedCall)
  process.$AI_OPTIONS = options

  return {
    visitor: {
      /**
       *
       * @param path
       * @constructor
       */
      StringLiteral (path) {
        let {node} = path
        let excludedReg = new RegExp(options.excludedPattern)
        let value = node.value

        if (utils.isChinese(value) && !excludedReg.test(value)) {

          let parentNode = path.parent
          let callName = pluginUtils.getCallExpressionName(parentNode)
          let ignoreExpression = types.isImportDeclaration(parentNode)
            || parentNode.key === node
            || types.isCallExpression(parentNode) && options.excludedCall.indexOf(callName) >= 0

          if (!ignoreExpression) {

            if (types.isJSXAttribute(parentNode)) {

              let expression = pluginUtils.genAIExpression(node.value, true)
              let newNode = types.JSXExpressionContainer(expression)
              path.replaceWith(newNode)

            }
            else if (types.isObjectProperty(parentNode)) {

              let parentObjNode = pluginUtils.findPropertyParent(path)
              let addKey = utils.genPropertyKey(parentNode.key.name || parentNode.key.value)
              let keyValue = ''

              if (parentObjNode && parentObjNode.node) {

                let keyNode = pluginUtils.getKeyProperty(parentObjNode.node.properties, addKey)

                if (keyNode) {
                  keyValue = keyNode.value.value
                }
              }

              let parentCallNode = pluginUtils.findParentFunctionLikeExpression(path)

              if (parentCallNode) {

                let replaceNode = pluginUtils.genAIExpression(value, true, keyValue)
                path.replaceWith(replaceNode)
              }
              else if (!keyValue) {

                let uuidKey = utils.genUuidKey(node.value.value)
                let keyNode = pluginUtils.genObjectKeyNode(addKey, uuidKey, node.value.value)
                parentObjNode.node.properties.push(keyNode)
              }
            }
            else {

              let replaceNode = pluginUtils.genAIExpression(value, true)
              path.replaceWith(replaceNode)
            }
          }
        }

      },
      /**
       *
       * @param path
       * @constructor
       */
      ObjectProperty (path) {
        let {node} = path
        let parentNode = path.parent, val = node.key.name || node.key.value
        let excludedReg = new RegExp(options.excludedPattern)

        if (types.isObjectExpression(parentNode)
          && utils.isChinese(node.value.value)
          && !excludedReg.test(node.value.value)) {

          let addKey = utils.genPropertyKey(val)
          let keyNode = pluginUtils.getKeyProperty(parentNode.properties, addKey)
          let parentCallNode = pluginUtils.findParentFunctionLikeExpression(path)

          if (!keyNode && !parentCallNode) {

            let uuidKey = utils.genUuidKey(node.value.value)
            let keyNode = pluginUtils.genObjectKeyNode(addKey, uuidKey, node.value.value)
            path.insertAfter(keyNode)

          }
        }
      },
      /**
       *
       * @param path
       * @constructor
       */
      JSXText (path) {
        let {node} = path
        let value = node.value
        let excludedReg = new RegExp(options.excludedPattern)

        if (utils.isChinese(value) && !excludedReg.test(value)) {

          let expression = pluginUtils.genAIExpression(value, true)
          let newNode = types.JSXExpressionContainer(expression)
          path.replaceWith(newNode)
        }
      },
      /**
       *
       * @param path
       * @constructor
       */
      TemplateElement (path) {
        let {node} = path
        let value = node.value.raw || node.value.cooked
        let excludedReg = new RegExp(options.excludedPattern)

        if (utils.isChinese(value) && !excludedReg.test(value)) {
          let parentNode = path.parent
          let callName = pluginUtils.getCallExpressionName(parentNode)
          let ignoreExpression = types.isCallExpression(parentNode)
            && options.excludedCall.indexOf(callName) >= 0

          if (!ignoreExpression) {

            let tplStr = `\${${pluginUtils.genAIExpression(value)}}`
            node.value.raw = tplStr
            node.value.cooked = tplStr
          }
        }
      },
      /**
       *
       * @param path
       * @constructor
       */
      CallExpression (path) {
        let {node} = path
        let parentNode = path.parent
        if (node.callee.name === options.$AI) {

          let arg = node.arguments || []
          let uuidKey = (arg[0] || {}).value

          if (!(uuidKey && arg[1] && types.isStringLiteral(arg[1]))) {

            let astProgram = types.program([types.expressionStatement(node)])
            let fnCode = babel.transformFromAst(astProgram).code
            myOra.warn('方法：' + fnCode + ' 参数必须为字符串，请检查')
          }
          else {

            if (arg[1].value) {
              utils.collectKeys(uuidKey, arg[1].value)
            }

            if (types.isObjectProperty(parentNode)) {

              let parentObjNode = pluginUtils.findPropertyParent(path)

              if (parentObjNode && parentObjNode.node) {

                let addKey = utils.genPropertyKey(parentNode.key.name || parentNode.key.value)
                let keyNode = pluginUtils.getKeyProperty(parentObjNode.node.properties, addKey)
                let parentCallNode = pluginUtils.findParentFunctionLikeExpression(path)

                if (!keyNode && !parentCallNode) {
                  let keyNode = pluginUtils.genObjectKeyNode(addKey, uuidKey)
                  parentObjNode.node.properties.push(keyNode)
                }
              }
            }
          }
        }
      },
    }
  }
}

/**
 *
 * @type {plugin}
 */
module.exports = plugin
