
const path = require('path')
const co = require('co')
const Router = require('koa-router')

const methodCacheOfController = new Map()

function loadRoutes(routeItems, controllerPathRoot, router) {
  routeItems.forEach((item) => {
    loadControllerMethod(item, controllerPathRoot);
    loadMethodRoute(item, router)
  })
}

function loadControllerMethod(item, controllerPathRoot) {
  const { match, controllerMethod } = item;
  const controllerFileName = controllerMethod.split('.')[0];
  const controllerMethodName = controllerMethod.split('.')[1];
  const controlerFilePath = path.join(controllerPathRoot, controllerFileName);
  const controller = require(controlerFilePath);
  const method = controller[controllerMethodName];
  methodCacheOfController.set(match, method);
}

function loadMethodRoute(item, router) {
  const { match, method = 'get' } = item;
  const smartRoute = (context, next) => {
    const method = methodCacheOfController.get(match);
    let methodWrapper = co.wrap(method).bind(context)
    return methodWrapper(context)
    // .then((res) => {
    //   console.log(`res is `, res);
    // })
    // .catch((err) => {
    //   console.log(`err is `, err);
    // })
    // return next();
  }
  const args = [match, smartRoute]
  router[method].apply(router, args)
  // console.log(`maping path#${match} with method#${method}`);
}


function createRouter(routeItems, controllerPathRoot) {
  let router = new Router()
  loadRoutes(routeItems, controllerPathRoot, router);
  return router;
}

module.exports.createRouter = createRouter
