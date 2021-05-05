const currentTask = process.env.npm_lifecycle_event;
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

class RunAfterCompile {
    apply(compiler) {
        compiler.hooks.done.tap('copy images', () => {
            fse.copySync('./app/assets/images', './docs/assets/images');
        });
    }
}

let pages = fse.readdirSync('./app').filter(page => {
    return page.endsWith('.html')
}).map(page => {
    return new HtmlWebpackPlugin({
        filename: page,
        scriptLoading: 'defer', 
        template: `./app/${page}`
    })
});

if(currentTask == 'dev') {
    module.exports = {
        entry: [ './app/assets/scripts/main.js' ],
        output: {
            filename: '[name].[chunkhash].js',
            path: path.resolve(__dirname, 'app')
        },
        devServer: {
            before: function(app, server) {
                server._watch('app/**/*.html')
            },
            contentBase: path.join(__dirname, 'app'),
            hot: true,
            port: 3000,
            host: '0.0.0.0'
        },
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.s[ac]ss/i,
                    use: ['style-loader', 'css-loader?url=false', {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [ 'autoprefixer' ]
                            }
                        }
                    }, 'sass-loader']
                }
            ]
        },
        plugins: pages,
        devtool: 'source-map' 
    }
}

if(currentTask == 'build') {
    module.exports = {
        entry: [ './app/assets/scripts/app.js' ],
        output: {
            filename: '[name].[chunkhash].js',
            chunkFilename: '[name].[chunkhash].js',
            path: path.join(__dirname, 'docs')
        },
        mode: 'production',
        module: {
            rules: [
                {
                    test: /\.js$/i,
                    exclude: /(node_modules)/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: [ '@babel/preset-env' ]
                        }
                    }]
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [ MiniCssExtractPlugin.loader, 'css-loader?url=false', {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [ 'autoprefixer' ]
                            }
                        }
                    }, 'sass-loader']
                }
            ]
        }, 
        plugins: pages.concat(
            new MiniCssExtractPlugin({ filename: '[name].[chunkhash].css' }),
            new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', '!CNAME'] }),
            new RunAfterCompile()
        ),
        optimization: {
            splitChunks: { chunks: 'all' },
            minimize: true,
            minimizer: [ new TerserWebpackPlugin(), new CssMinimizerWebpackPlugin() ]
        }
    }
}