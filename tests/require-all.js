/**
 * This is a workaround to have Istanbul include all src files in the coverage reports
 * Istanbul/nyc only calculates the coverage of require'ed files. So, here we require them all.
 */

var normalizedPath = require('path').join(__dirname, '../src') // eslint-disable-line no-undef

require('fs').readdirSync(normalizedPath).forEach(function(file) {
  require('../src/' + file)
})
