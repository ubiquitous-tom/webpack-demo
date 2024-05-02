import _ from 'underscore'

console.log(_.templateSettings)

_.templateSettings = {
  // escape: /\{\{\{([\s\S]+?)\}\}\}/g,
  // evaluate: /\{\{(.+?)\}\}/g,
  interpolate: /\{\{(.+?)\}\}/g,
}

console.log(_.templateSettings)

// original
// _.templateSettings = {
//   "escape": /<%=([\s\S]+?)%>/g,
//   "evaluate": /<%-([\s\S]+?)%>/g,
//   "interpolate": /<%([\s\S]+?)%>/g,
// }
