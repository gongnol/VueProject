
module.exports = [
 {
      match: "/login",
      controllerMethod: "login.index"
  },

// 用户
  {
      match: "/user/index",
      controllerMethod: "user.index"
  },

  {
    match: "/user/list",
    controllerMethod: "user.index"
  },
  {
    match: "/user/list2",
    controllerMethod: "user.index"
  },
//角色
  {
        match: "/role/index",
        controllerMethod: "role.index"
    },
   {
      match: "/role/list",
      controllerMethod: "role.index"
    },

//资源
  {
        match: "/resource/index",
        controllerMethod: "resource.index"
    },
   {
      match: "/resource/list",
      controllerMethod: "resource.index"
    },

    //码表
  {
        match: "/syscode/index",
        controllerMethod: "syscode.index"
    },
   {
      match: "/syscode/list",
      controllerMethod: "syscode.index"
    },


  {
    match: "/user/login",
    controllerMethod: "user.login",
    method: 'post'
  },



]
