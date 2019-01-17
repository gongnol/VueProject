
import { request } from "../../utils/RestClient";


//获取角色下所有的资源树状
export function findResourceTreeByRole(roleId) {
  return request("/dolphin/api/v1/sys-resource/findResourceTreeByRole?roleId="+roleId, {
    method: "GET",
    data: {}
  });
}



//获取所有的资源树状
export function findResourceTree() {
  return request("/dolphin/api/v1/sys-resource/findResourceTree", {
    method: "POST",
    data: {}
  });
}

//
export function getResourceById(resourceId) {
  return  request("/dolphin/api/v1/sys-resource/get?id=" + resourceId, {
    method: "GET",
    data: {}
  });
}


export function updateResource(row) {
  return request("/dolphin/api/v1/sys-resource/update", {
    method: "POST",
    data: row
  });
}


export function addResource(row) {
  console.log(JSON.stringify(row));
  return request("/dolphin/api/v1/sys-resource/add", {
    method: "POST",
    data: row
  });
}

  export function deleteResource(resourceIds) {
  return request("/dolphin/api/v1/sys-resource/deleteResourceByIds", {
    method: "POST",
    data: {resourceIds:resourceIds}
  });
}