const nunjucks = require("nunjucks");

const AssetsBundle = require('./AssetsBundle');

/**
 *
 * @param {*} viewPathRoot
 * @param {*} opts
 */
function createNunjucksEnv(viewPathRoot, opts) {
  opts = opts ? opts : {};
  const {
    autoescape = true,
    noCache = false,
    watch = false,
    throwOnUndefined = false
  } = opts;

  const nunjucksEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(viewPathRoot, {
      noCache: noCache,
      watch: watch
    }),
    {
      autoescape: autoescape,
      throwOnUndefined: throwOnUndefined
    }
  );

  nunjucksEnv.addGlobal('bundle', AssetsBundle.chunkFetcher(opts))

  if (opts.filters) {
    for (var f in opts.filters) {
      nunjucksEnv.addFilter(f, opts.filters[f]);
    }
  }

  console.log(`view root path is ${viewPathRoot}`);

  return nunjucksEnv;
}

function renderView(nunjucksEnv, viewPath, model) {
  return new Promise((resolve, reject) => {
    nunjucksEnv.render(
      viewPath,
      model,
      function (err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      }
    );
  });
}

/**
 * 适配koa的渲染函数
 * @param {*} viewPathRoot
 * @param {*} opts
 */
function nunjucksView(viewPathRoot, opts) {
  // 创建Nunjucks的env对象:
  var nunjucksEnv = createNunjucksEnv(viewPathRoot, opts);
  return async (ctx, next) => {
    // 给ctx绑定render函数:
    ctx.render = function (viewPath, model) {
      const idx = viewPath.indexOf('.');
      if (idx === -1) {
        viewPath += '.html';
      }

      const modelData = Object.assign({}, ctx.state || {}, model || {});
      return renderView(nunjucksEnv, viewPath, modelData)
        .then(htmlData => {
          // 把render后的内容赋值给response.body:
          ctx.response.body = htmlData;
          // 设置Content-Type:
          ctx.response.type = "text/html";
        })
    };
    // 继续处理请求:
    await next();
  };
}

module.exports.nunjucksView = nunjucksView
