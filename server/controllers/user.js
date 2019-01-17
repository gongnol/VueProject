
module.exports = {

  index: function* (ctx) {
    yield ctx.render("user/index", { title: 'test-test' });
  },

  login: function* (ctx) {
    let result = {}
    const { name, password } = ctx.request.body
      console.log("name is ",name ,"password is ",password);
    const user = {
      name: '@ADMIN',
      avatar: '@AVATAR',
      address: '@CITY',
      welcome: '@WELCOME',
      timefix: '@TIMEFIX',
      position: '@POSITION'
    }

    if (name !== 'admin' || password !== '888888') {
      result.code = -1
      result.message = '账户名或密码错误（admin/888888）'
    } else {
      result.code = 0
      result.message = '大大，欢迎回来'
      result.data = {}
      result.data.user = user
    }

    ctx.renderJson(result)
  }

}
