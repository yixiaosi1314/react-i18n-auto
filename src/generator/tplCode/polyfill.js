window.LOCALE_VERSION = '${version}'
window.LOCALE = {}
window.$AI = function (key, val) {
  if (key && typeof val === 'string') {return window.LOCALE[key] || val}
  return val
}
window.$$AI = function (val) {return val}