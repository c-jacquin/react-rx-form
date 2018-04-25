const glob = require('glob')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  title: 'react-rx-form',
  styleguideDir: 'docs',
  components: 'src/**/*.tsx',
  resolver: require('react-docgen').resolver.findAllComponentDefinitions,
  propsParser: require('react-docgen-typescript').withDefaultConfig().parse,
  webpackConfig: {
    entry: {
      app: path.resolve(__dirname, 'src/index.ts')
    },
    resolve: {
      extensions: [".ts", ".tsx"],
      modules: ['node_modules']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /^.\/src\/.*\/__tests__\/.*$/,
          loader: 'awesome-typescript-loader'
        }
      ]
    }
  }
}
