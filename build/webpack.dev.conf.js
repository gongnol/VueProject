"use strict";
const path = require("path");
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");

const entryFinder = require("./entry-finder");

const env = require("../config/dev.env");

const entries = entryFinder.findAllLevelEntries();

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  entry: entries,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.sourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.dev.devtool,
  devServer: {
    contentBase: "../dist",
    hot: true,
    disableHostCheck: true
  },
  output: {
    path: config.common.buildDir,
    filename: "[name]/bundle.js",
    publicPath: ""
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      "process.env": env
    }),

    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: "[name]/bundle.css",
      allChunks: true
    }),

    // 生成 webpack 文件chunk映射
    new ManifestPlugin({
      fileName: config.common.chunkMappingFileName,
      seed: config.common.chunkMappingSeed,
      // filter: (file) => {
      //   return !file.name.endsWith('.map');
      // },
      generate: utils.assetsManifest
    }),

    // 设置 webpack 引用 dll, 可以使得打包速度变快
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(config.common.manifestSrcFile)
    }),

    new webpack.HotModuleReplacementPlugin(),

    // copy custom static assets and assets-mapping and vendor-js
    new CopyWebpackPlugin(
      [
        {
          from: config.common.staticSrcDir,
          to: config.common.staticDestDir,
          ignore: [".*"]
        },
        {
          from: config.common.vendorSrcFile,
          to: config.common.vendorDestFile,
          force: true
        }
      ]
    )
  ]
});

module.exports = webpackConfig;
