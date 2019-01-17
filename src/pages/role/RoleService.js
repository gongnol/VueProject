
import { request } from "../../utils/RestClient";

//查询角色列表(分页)
export function fetchPageData(pageReq) {
  console.log("role page find = "+JSON.stringify(pageReq))
  return request("/dolphin/api/v1/t-sys-role/find-page", {
    method: "POST",
    data: pageReq
  });
}

//
export function getRoleById(roleId) {
  return  request("/dolphin/api/v1/t-sys-role/get?id=" + roleId, {
    method: "GET",
    data: {}
  });
}

export function updateRole(row) {
  return request("/dolphin/api/v1/t-sys-role/update", {
    method: "POST",
    data: row
  });
}


export function addRole(row) {
  console.log(JSON.stringify(row));
  return request("/dolphin/api/v1/t-sys-role/add", {
    method: "POST",
    data: row
  });
}

  export function deleteRole(roleIds) {
  return request("/dolphin/api/v1/t-sys-role/deleteByIds", {
    method: "POST",
    data: {roleIds:roleIds}
  });
}


//查询角色列表(分页) 已分配到某个资源下的角色
export function queryRolesByResourceId(pageReq) {
  return request("/dolphin/api/v1/t-sys-role/queryRolesByResourceId", {
    method: "POST",
    data: pageReq
  });
}
//查询角色列表(分页) 未分配到某个资源下的角色
export function findRolePagingNoAssign(pageReq) {
  return request("/dolphin/api/v1/t-sys-role/findRolePagingNoAssign", {
    method: "POST",
    data: pageReq
  });
}
