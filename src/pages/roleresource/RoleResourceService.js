import { request } from "../../utils/RestClient";


//更新该角色下的资源信息
export function updateRoleResrouces(roleId,deleteResources,addResources) {
  return request("/dolphin/api/v1/sys-role-res/updateRoleResrouces", {
    method: "POST",
    data: {roleId:roleId,deleteResources:deleteResources,addResources:addResources}
  });
}

//更新该资源信息下的角色
export function assignRolesToResource(resourceId,roleIds) {
  return request("/dolphin/api/v1/sys-role-res/assignRolesToResource", {
    method: "POST",
    data: {resourceId:resourceId,roleIds:roleIds}
  });
}


//更新资源下的角色（批量删）
export function deleteRolesByResId(resourceId,roleIds) {
  return request("/dolphin/api/v1/sys-role-res/deleteRolesByResId", {
    method: "POST",
    data: {resourceId:resourceId,roleIds:roleIds}
  });
}

