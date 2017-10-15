const fs = require('fs')
const loadCoverage = require('remap-istanbul/lib/loadCoverage')
const remap = require('remap-istanbul/lib/remap')
const writeReport = require('remap-istanbul/lib/writeReport')

const coverageFile = './.temp/coverage-final.json'

if (fs.existsSync(coverageFile)) {
    const collector = remap(loadCoverage(coverageFile))

    writeReport(collector, 'html', {}, './coverage')
}
