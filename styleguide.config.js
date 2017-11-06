const path = require('path')
const glob = require('glob')

module.exports = {
    title: 'react-rx-form',
    styleguideDir: 'docs',
    components: 'src/**/*.tsx',
    highlightTheme: 'material',    
    resolver: require('react-docgen').resolver.findAllComponentDefinitions,
    propsParser: require('react-docgen-typescript').withDefaultConfig().parse
}
