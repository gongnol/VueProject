'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const env = process.env;
const path = require('path')

const NODE_ENV = env.NODE_ENV || 'prod';

const PACK_ENV = NODE_ENV === 'dev' ? 'development' : 'production';

const contextName = 'dolphin';
const contextPath = '/' + contextName;

const staticName = 'static';

// 工作目录
const workingDir = path.resolve(__dirname, '../');

// 编译后的目录
const buildDir = path.resolve(__dirname, '../dist');

// 编译后带context的目录
const destDir = path.resolve(buildDir, contextName);

// 编译后的静态目录
const staticDestDir = path.resolve(destDir, staticName);
const staticSrcDir = path.resolve(workingDir, staticName);

// 需要汇总的dll vendor js array
// 此处加入 ant-design-vue, 会有问题
// TODO: 需要修复
const dllVendors = [
  '@antv/data-set',
  'ant-design-vue',
  'axios',
  'clipboard',
  'co',
  'date-fns',
  'object-assign',
  // 'nunjucks',
  'viser-vue',
  'vue',
  'vue-router',
  'vuex',
  'vuedraggable',
  // 'mockjs',
  'core-js',
  'lodash',
  'dom-align',
  'dom-scroll-into-view',
  'shallowequal',
  'classnames',
  'enquire.js'
];

// const dllVendors = [
//   // "@antv/data-set",
//   // "ant-design-vue",
//   // "axios",
//   // "clipboard",
//   // "co",
//   // "date-fns",
//   // "enquire.js",
//   // "viser-vue",
//   "vue",
//   "vue-router",
//   "vuedraggable",
//   "vuex"
// ]


// 编译后的 dll vendor.js for http access
const dllSrcDir = path.resolve(__dirname, './dll');
const vendorJsName = 'vendor.js';
const vendorAccessName = path.join(contextPath, staticName, 'vendor/', vendorJsName);

const vendorSrcFile = path.resolve(dllSrcDir, vendorJsName);
const vendorDestFile = path.resolve(staticDestDir, './vendor', vendorJsName);

// dll vendor 编译后的 manifest
const manifestFileName = 'manifest.json';
const manifestSrcFile = path.resolve(dllSrcDir, manifestFileName);
const manifestDestFile = path.resolve(destDir, manifestFileName);

// assets chunk 映射
const chunkMappingSrcDir = path.resolve(__dirname, './mapping');
const chunkMappingFileName = 'assets-mappings.json';
const chunkMappingSrcFile = path.resolve(chunkMappingSrcDir, chunkMappingFileName);
const chunkMappingDestFile = path.resolve(buildDir, chunkMappingFileName);
const chunkMappingSeed = { [vendorAccessName]: vendorAccessName + '?v=3' };

const apiPrefix = '/dolphin/api/';


module.exports = {

  common: {

    NODE_ENV,
    PACK_ENV,

    workingDir,
    buildDir,
    destDir,

    staticDestDir,
    staticSrcDir,

    manifestSrcFile,
    manifestDestFile,

    chunkMappingSrcDir,
    chunkMappingFileName,
    chunkMappingSrcFile,
    chunkMappingDestFile,
    chunkMappingSeed,

    dllSrcDir,
    vendorJsName,
    vendorAccessName,
    vendorSrcFile,
    vendorDestFile,

    contextName,
    contextPath,
    dllVendors,

    apiHost: 'http://127.0.0.1:8080',
    // apiHost: 'http://192.168.11.22:8080',
    apiPrefix,

  },

  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    contextPath: contextPath,
    proxyTable: {},

    staticServer: 'http://127.0.0.1:7002/',

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 7002, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: false,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: destDir,
    assetsSubDirectory: './' + staticName + '/',
    assetsPublicPath: './' + contextName + '/',
    staticServer: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report,

    // for koa server
    host: '0.0.0.0',
    port: 7002,

  }
}
