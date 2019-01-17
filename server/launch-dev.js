const static = require('koa-static');
const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const compress = require('koa-compress')
const proxy = require('koa-proxies')
const path = require("path");

const config = require('../config')

const nunjucksView = require("./lib/NunjucksView").nunjucksView
const JsonView = require('./lib/JsonView')
const createRouter = require("./lib/ControllerRoute").createRouter

const bundleMappings = (name) => { return name; }

// ------------------------- below for koa-dev

const webpack = require('webpack'); // webpack模块

const configPack = require('../build/webpack.dev.conf'); // 开发环境模块
// 中间件容器，把webpack处理后的文件传递给一个服务器
const devMiddleware = require('./lib/devMiddleware');
// 在内存中编译的插件，不写入磁盘来提高性能
const hotMiddleware = require('./lib/hotMiddleware');
const compiler = webpack(configPack);

app.use(devMiddleware(compiler, {
  publicPath: configPack.output.publicPath // '/'
}));
app.use(hotMiddleware(compiler));

// ------------------------- above for koa-dev

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

// 设置Dolphin API代理
app.use(proxy(config.common.apiPrefix, {
  target: config.common.apiHost,
  changeOrigin: true,
  rewrite: path => path.substring(config.common.apiPrefix.length),
  logs: true
}))

// 返回json
app.use(JsonView());

// 设置 nunjunk 渲染html模板
let rootViewPath = path.resolve(__dirname, "./views");
app.use(nunjucksView(rootViewPath,
  {
    noCache: true,
    watch: true,
    staticServer: config.dev.staticServer,
    bundleMappings: bundleMappings
  }
)
);

// 解析json
app.use(koaBody({
  jsonLimit: '1kb'
}));

// 设置路由
const routeItems = require("./route")
const rootControllerPath = path.resolve(__dirname, "./controllers");
const router = createRouter(routeItems, rootControllerPath);

app.use(router.routes())
  .use(router.allowedMethods())

// 开始
app.listen(config.build.port, function () {
  console.log(`launch koa server at port#${config.build.port}`);
});

