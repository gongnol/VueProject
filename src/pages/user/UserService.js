
import { request } from "../../utils/RestClient";

export function fetchPageData(pageReq) {
  return request("/dolphin/api/v1/app-user/find-page", {
    method: "POST",
    data: pageReq
  });
}

export function getUserById(userId) {
  return  request("/dolphin/api/v1/app-user/get?id=" + userId, {
    method: "GET",
    data: {}
  });
}

export function updateUser(row) {
  return request("/dolphin/api/v1/t-sys-user/update", {
    method: "POST",
    data: row
  });
}

export function fetchUserListPageData(pageReq) {
  return request("/dolphin/api/v1/t-sys-user/find-tsysuser-page", {
    method: "POST",
    data: pageReq
  });
}


export function addUser(row) {
  return request("/dolphin/api/v1/t-sys-user/add", {
    method: "POST",
    data: row
  });
}

export function findUserTypes() {
  return request("/dolphin/api/v1/app-user/find-user-types", {
    method: "GET"
  });
}

//根据角色ID 获取该角色下的用户 信息
export function queryUserByRoleId(pageReq) {
  return request("/dolphin/api/v1/t-sys-user/queryUserByRoleId", {
    method: "POST",
    data: pageReq
  });
}
//查询没有绑定到该角色下的用户列表
export function findUserPagingNoAssign(pageReq) {
  return request("/dolphin/api/v1/t-sys-user/findUserPagingNoAssign", {
    method: "POST",
    data: pageReq
  });
}
//查询用户登录名是否存在
export function existLoginName(loginName) {
  return  request("/dolphin/api/v1/t-sys-user/existLoginName?loginName=" + loginName, {
    method: "GET",
    data: {}
  });
}

//根据userID分页查询用户角色
export function findRolePagingByUserId(pageReq) {
  return  request("/dolphin/api/v1/t-sys-role/findPagingByUserId", {
    method: "POST",
    data: pageReq
  });
}
//根据userID分页查询用户组
export function findGroupPagingByUserId(pageReq) {
  return  request("/dolphin/api/v1/sys-user-group/findPagingByUserId", {
    method: "POST",
    data: pageReq
  });
}
