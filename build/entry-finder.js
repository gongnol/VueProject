let fs = require("fs");
let path = require("path");
const config = require('../config')

const entryFileName = 'entry.js';
const basePagesDir = path.resolve(__dirname, '../src/pages');

const pagePrefix = path.join(config.common.contextName, 'pages');

// console.log('CURRENT_PATH is ', CURRENT_PATH, ', basePagesDir is ', basePagesDir);

/**
 * 搜索 folder 目录下的 entry.js
 * @param {*} pageAbsoluteDir
 */
function searchEntryJs(pageAbsoluteDir) {
  var stat = fs.lstatSync(pageAbsoluteDir);
  if (!stat.isDirectory()) {
    return [];
  }
  let pages = [];
  let dirs = fs.readdirSync(pageAbsoluteDir);
  for (let dir of dirs) {
    if (dir.startsWith('.')) {
      continue;
    }

    // var subDir = `${pageAbsoluteDir}/${dir}`;
    // var entryJsFile = `${subDir}/${entryFileName}`;

    let subDir = path.join(pageAbsoluteDir, dir);
    let entryJsFile = path.join(subDir, entryFileName);

    if (fs.existsSync(entryJsFile)) {
      pages.push(entryJsFile);
      // var trunc = subDir.substring(basePagesDir.length + 1, subDir.length);
    }
  }
  return pages;
}

/**
 * 查找最多两级 entry.js 文件
 * @param {*} pageAbsoluteDir
 */
function findLevelEntryFiles(pageAbsoluteDir) {
  // 搜索 folder 目录下两级
  var s1 = new Date().getTime();
  var pages = searchEntryJs(pageAbsoluteDir);
  let directories = fs.readdirSync(pageAbsoluteDir);
  for (let dir of directories) {
    var subFullPath = path.join(pageAbsoluteDir, dir);
    pages = pages.concat(searchEntryJs(subFullPath));
  }

  var elasped = new Date().getTime() - s1;
  console.log(`getPages elasped ${elasped}ms`);

  return pages;
}

/**
 *
 */
exports.findAllLevelEntries = () => {
  let entryFiles = findLevelEntryFiles(basePagesDir);

  // console.log('entryFiles is ', entryFiles);

  if (!entryFiles || entryFiles.length === 0) {
    throw new Error("no entry files");
  }

  let entries = {};

  for (let filePath of entryFiles) {
    let relative = filePath.substring(basePagesDir.length + 1, filePath.length - entryFileName.length - 1);
    let key = path.join(pagePrefix, relative) ;
    entries[key] = filePath;
    // console.log(`entry ${key} to ${filePath}`);
  }

  return entries;
}
