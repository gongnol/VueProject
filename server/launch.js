const static = require('koa-static');
const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const compress = require('koa-compress')
const proxy = require('koa-proxies')
const path = require("path");

// const Webpack = require('webpack');
// const middleware = require('koa-webpack');
// const packConf = require('../build/webpack.prod-multiple.conf');

const config = require('../config')

const nunjucksView = require("./lib/NunjucksView").nunjucksView
const JsonView = require('./lib/JsonView')
const createRouter = require("./lib/ControllerRoute").createRouter
const bundleChunk = require('./lib/AssetsBundle').bundleChunk

const bundleMappings = require('../config/mapping/assets-mappings.json')


// 记录日志
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// 设置响应时间
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// 设置静态资源路由查找
app.use(static(path.resolve(__dirname, '../dist'), { maxage: 12 * 30 * 24 * 60 * 60 * 1000 }));//静态资源服务器

// 返回json
app.use(JsonView());

// 设置 nunjunk 渲染html模板
let rootViewPath = path.resolve(__dirname, "./views");
app.use(nunjucksView(rootViewPath,
  {
    noCache: true,
    watch: true,
    staticServer: config.build.staticServer,
    bundleMappings: bundleMappings
  }
)
);

// 解析json
app.use(koaBody({
  jsonLimit: '1kb'
}));

app.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

// 设置路由
const routeItems = require("./route")
const rootControllerPath = path.resolve(__dirname, "./controllers");
const router = createRouter(routeItems, rootControllerPath);

app.use(router.routes())
  .use(router.allowedMethods())

// 开始
app.listen(config.build.port, function () {
  console.log(`koa server launch at port#${config.build.port}`);
});

