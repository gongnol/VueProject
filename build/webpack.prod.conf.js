'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin');

const entryFinder = require('./entry-finder');

const env = require('../config/prod.env')

const entries = entryFinder.findAllLevelEntries();

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  entry: entries,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  devServer: {
    contentBase: '../dist',
    hot: true
  },
  output: {
    path: config.common.buildDir,
    filename: utils.assetsPath('[name]/bundle-[hash:5].js'),
    publicPath: ""
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('[name]/bundle-[contenthash:5].css'),
      allChunks: true,
    }),

    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),

    // 使用服务端渲染, 不需要生成html
    // new HtmlWebpackPlugin({

    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),

    // 生成 webpack 文件chunk映射
    new ManifestPlugin({
      fileName: config.common.chunkMappingFileName,
      seed: config.common.chunkMappingSeed,
      filter: (file) => {
        return !file.name.endsWith('.map');
      },
      generate: utils.assetsManifest
    }),

    // 设置 webpack 引用 dll, 可以使得打包速度变快
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(config.common.manifestSrcFile)
    }),

    // copy custom static assets and assets-mapping and vendor-js
    new CopyWebpackPlugin([
      {
        from: config.common.staticSrcDir,
        to: config.common.staticDestDir,
        ignore: ['.*']
      },
      {
        from: config.common.vendorSrcFile,
        to: config.common.vendorDestFile,
        force: true
      }
    ]),

  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
