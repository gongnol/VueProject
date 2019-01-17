'use strict'
require('./check-versions')()

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const util = require('./utils');
const fs = require('fs-extra')

const webpackConfig = require('./webpack.' + util.getNodeEnv() + '.conf')

const spinner = ora('building for production...')
spinner.start()

console.log(`\nconfig.common.buildDir is `, config.common.buildDir);
// debugger

rm(config.common.buildDir, err => {
  if (err) throw err

  util.mkDirs(config.common.destDir);

  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    // clean first
    let chunkMappingFile = config.common.chunkMappingSrcFile;

    if (fs.existsSync(chunkMappingFile)) {
      fs.removeSync(chunkMappingFile)
    }

    // 输出 chunk-mapping json
    const chunkJson = require(config.common.chunkMappingDestFile);
    // chunkJson[config.common.vendorAccessName] = config.common.vendorAccessName + "?v=2";
    fs.outputJsonSync(chunkMappingFile, chunkJson);

    // fs.copySync(config.common.vendorSrcFile, config.common.vendorDestFile);

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
