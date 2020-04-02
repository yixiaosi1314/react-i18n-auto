const plugin = require('../src/index')
const path = require('path')

plugin.config({
  _test: true,
  excluded: /node_modules|output/, //排除文件选项（默认为：/node_modules/）

  src: path.resolve(__dirname, './code'), //源文件目录（必选）

  outputPath: path.resolve(__dirname, './output'), //国际化配置输出目录（必选）

  // 生成本地化语言包（可选）
  translation: {

    // en_US 语言包目录
    en_US: {
      source: [
        // path.resolve(__dirname, './output/en_US/翻译文件.xlsx'),  //翻译文件excel
        /*,'...'*/
      ]
    }
  },
  // babel插件配置（以下为默认配置）
  pluginOptions: {
    prefixKey: 'I_', // uuidKey 前缀

    $AI: '$AI', //全局方法$AI，参考localePolyfill.js

    // 排除不需要国际化配置的调用方法
    // $AI('key','value') key将取代自动生成的uuidKey
    excludedCall: ['$AI', 'require', '$$AI', 'console.log', 'chalk.yellow'],//$$AI('value') 标记不翻译字符

    excludedPattern: /\.\w+$/, // // 排除不需要配置的字符串，默认文件名
  }
})
