/**
 *
 * @type {{prefixKey: string, $AI: string, excludedCall: [string,string,string,string,string], excludedPattern: RegExp}}
 */
let options = {
  // uuidKey 前缀
  prefixKey: 'I_',
  $AI: '$AI',
  // 排除不需要国际化配置的调用方法
  excludedCall: ['$AI', 'require', '$$AI', 'console.log'],// $$AI('key','value') 标记不翻译字符
  // 排除不需要配置的字符串，
  excludedPattern: /\.\w+$/, // 默认文件名
}
/**
 *
 * @type {{prefixKey: string, $AI: string, excludedCall: (string|string|string|string|string)[], excludedPattern: RegExp}}
 */
process.$AI_OPTIONS = options
/**
 *
 * @type {{prefixKey: string, $AI: string, excludedCall: (string|string|string|string|string)[], excludedPattern: RegExp}}
 */
module.exports = options