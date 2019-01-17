import Vue from 'vue'
import Router from 'vue-router'

import PageView from '@/layouts/PageView'
import MenuView from '@/layouts/MenuView'

import Login from '@/pages/login/Login'

import UserList from '@/pages/user/UserList2'
import RoleList from '@/pages/role/RoleList'
import SysCodeList from '@/pages/syscode/SysCodeList'
import ResourceList from '@/pages/resource/ResourceList'


Vue.use(Router)
export const constantRouterMap = [
    {
      path: '/login',
      name: '登录页',
      component: Login,
      invisible: true,
    },
    {
      path: '/',
      component: MenuView,
      redirect: '/login',
      icon: 'none',
      invisible: true,
      children: [
       {
          path: '/auth',
          name: '权限管理',
          component: PageView,
          icon: 'user',
          children: [
            {
              path: '/user/list',
                name: '用户列表',
              component: UserList,
              icon: 'none'
            },
            {
              path: '/role/list',
              name: '角色列表',
              component: RoleList,
              icon: 'none'
            },
             {
              path: '/resource/list',
              name: '资源列表',
              component: ResourceList,
              icon: 'none'
            }
          ]
        },
        {
          path: '/syscode',
          name: '码表管理',
          component: PageView,
          icon: 'appstore',
          children: [
            {
              path: '/syscode/list',
              name: '码表列表',
              component: SysCodeList,
              icon: 'none'
            }

          ]
        }

      ]
    }
]

export default new Router({
  mode: 'history',
  routes: constantRouterMap
})
