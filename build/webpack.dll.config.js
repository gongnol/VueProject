const path = require("path");
const webpack = require("webpack");
const config = require('../config')

var vendors = config.common.dllVendors

module.exports = {
  mode: 'production',
  entry: {
    vendor: vendors
  },
  output: {
    path: config.common.dllSrcDir,
    filename: config.common.vendorJsName,
    library: "[name]"
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  plugins: [
    new webpack.DllPlugin({
      path: config.common.manifestSrcFile,
      name: "[name]",
      context: __dirname
    }),

  ]
};
