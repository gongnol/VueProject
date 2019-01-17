// import 'babel-polyfill';
import axios from 'axios';

/**
 * 处理输入选项
 * @param {*} options
 */
function pureOptions(options) {
  let opt = options ? { ...options } : {};
  opt.method = opt.method || 'GET';
  opt.headers = opt.headers || {};

  const newOptions = { ...opt };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
      if (!(newOptions.body instanceof FormData)) {
          newOptions.headers = {
              'Accept': 'application/json',
              'Content-Type': 'application/json; charset=utf-8',
              ...newOptions.headers,
          };
          newOptions.body = JSON.stringify(newOptions.body);
      } else {
          // newOptions.body is FormData
          newOptions.headers = {
              'Accept': 'application/json',
              ...newOptions.headers,
          };
      }
  }
  return opt;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 */
function request(url, options) {
  const newOptions = pureOptions(options);

  const promise = new Promise(function (resolve, reject) {
      axios({
        url: url,
        method: newOptions.method,
        data: newOptions.data,
        headers: newOptions.headers
      })
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });

  return promise;
}

// 此处不能使用 await, 因为需要 babel-polyfill 支持, 但需要在每一个页面的头部载入 polyfill.
// 不能保证每一个页面的头部有 polyfill, 所以去掉此函数
// /**
//  * Requests a URL, use await async
//  * @param {string} url
//  * @param {object} options
//  */
// async function requestAwait(url, options) {
//     return await request(url, options);
// }

export {request};
