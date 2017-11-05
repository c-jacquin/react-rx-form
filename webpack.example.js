const webpack = require('webpack')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
    entry: {
        app: './src/example.tsx'
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/'
    },
    resolve: {
        modules: ['src', 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            },
            {
                test: /\.tsx?$/,
                exclude: /^.\/src\/.*\/__tests__\/.*$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: '/example',
        hot: false,
        inline: false,
        stats: 'errors-only',
        host: process.env.HOST,
        port: process.env.PORT
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
        new HtmlWebpackPlugin({
            filename: 'example/index.html',
            template: 'example/index.html',
            inject: true
        }),
        new CheckerPlugin()        
    ]
}
