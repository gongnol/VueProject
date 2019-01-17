/**
 * Created by Administrator on 2019/1/8.
 */
export function copyReqObj(reqObj){
  let resultObj = {};
  for(let key in reqObj){
    let value = reqObj[key];
    if(Object.prototype.toString.call(value) === "[object String]"){
      if(value.trim()!=="") {
        resultObj[key] = value;
      }
    }else{
      resultObj[key]= value;
    }
  }
  return resultObj;
}
export function isMobile(mp){
  return /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/.test(mp);
}
