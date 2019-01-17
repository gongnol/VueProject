const path = require('path')

bundleChunk = (options) => {
  let { staticServer, bundleMappings = {} } = options;

  return (context, next) => {
    context.bundle = function (name) {
      let ret = path.join(staticServer, bundleMappings[name]);
      console.log(`path is `, name, ', ret is ', ret);
      return ret;
    }
    return next()
  };
};

chunkFetcher = (options) => {
  let { staticServer, bundleMappings = {} } = options;

  return (name) => {
    let ret;
    if (typeof bundleMappings === 'function') {
      ret = bundleMappings(name);
    } else {
      ret = path.join(staticServer, bundleMappings[name]);
    }
    console.log(`chunkFetcher path is `, name, ', ret is ', ret);
    return ret;
  };
}

module.exports.bundleChunk = bundleChunk

module.exports.chunkFetcher = chunkFetcher
