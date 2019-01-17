
import { request } from "../../utils/RestClient";

export function deleteUserRoleByRoleId(roleId,userIds) {
  console.log(JSON.stringify(userIds))
  return request("/dolphin/api/v1/sys-user-role/deleteUserRoleByRoleId", {
    method: "POST",
    data: {userIds:userIds,roleId:roleId}
  });
}

export function assignUserToRole(roleId,userIds) {
  console.log(JSON.stringify(userIds))
  return request("/dolphin/api/v1/sys-user-role/assignUserToRole", {
    method: "POST",
    data: {userIds:userIds,roleId:roleId}
  });
}






