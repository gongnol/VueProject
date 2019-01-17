
import { request } from "../../utils/RestClient";


export function fetchPageData(pageReq) {
  return request("/dolphin/api/v1/t-sys-code-type/find-page", {
    method: "POST",
    data: pageReq
  });
}

export function addSysType(row) {
  return request("/dolphin/api/v1/t-sys-code-type/add", {
    method: "POST",
    data: row
  });
}


export function getItemsBytypeCode(typeCode) {
  return  request("/dolphin/api/v1/drop-down-list/type-code?typeCode=" + typeCode, {
    method: "GET",
    data: {}
  });
}

export function findSysUserTypes() {
  return getItemsBytypeCode('SYS_USER_TYPE');
}

export function findSysUserStatus() {
  return getItemsBytypeCode('SYS_USER_STATUS');
}
