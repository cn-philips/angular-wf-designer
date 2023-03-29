import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
// string code
export function codeString(id) {
  if (id != undefined && id != null && id != "") {
    const codeId = id.split('-').reverse().join('-');
    // console.log(id, 'id');
    // console.log(codeId, 'codeId');
    return codeId;
  }
}

// string decode
export function decodeString(id) {
  if (id != undefined && id != null && id != "") {
    const decodeId = id.split('-').reverse().join('-');
    return decodeId;
  }

}

// 格式化时间
export function formatDate(date)  // 格式
{
  if (date) {
    date = new Date(Date.parse(date.replace(/-/g, "/"))); // 转换成Data();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d
  }
}
//格式表达式
export function formatDates(date)  //格式
{
  if (date) {
    date = new Date(date); //转换成Data();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var min = date.getMinutes();
    min = min < 10 ? ('0' + min) : min;
    var sec = date.getSeconds();
    sec = sec < 10 ? ('0' + sec) : sec;
    return `${y}/${m}/${d} ${h}:${min}:${sec}`
  }
  else
  {
    return "";
  }

}
//格式表达式
export function formatDatesNow(date)  //格式
{
  date = new Date(date); //转换成Data();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let obj = `${y}-${m}-${d}`;
  return obj;
}
//格式年月
export function formatDatesNowMth(date)  //格式
{
  date = new Date(date); //转换成Data();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  let obj = `${y}-${m}`;
  return obj;
}

//正则表达式日期格式
export function cheakDate(control: FormControl): any {
  if (control.value) {
    let nowData = `${control.value.year}-${control.value.month}-${control.value.day}`;
    nowData = formatDate(nowData);
    let res = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
    const valid = res.test(nowData)
    return valid ? null : { dataform: true };
  }
}
//正则表达式时间
export function cheakNumber(control: FormControl) {
  let res = /^[0-9]*$/
  const valid = res.test(control.value);
  return valid ? null : { number: true };
}
export function getuuid() { //生成uuid
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}
/**
 * @array 数组， @parm 以那个为参数
 */
export function disreduce(arrays, parm) //除去重复的元素
{
  var obj = {};
  arrays = arrays.reduce(function (item, next) {
    obj[next[parm]] ? '' : obj[next[parm]] = true && item.push(next);
    return item;
  }, []);
  return arrays
}
/**
 *  file文件名称
 */
export function getType(file)  //取文件后缀
{
    var startIndex = file.name.lastIndexOf(".");
	if(startIndex != -1)
		return file.name.substring(startIndex+1, file.name.length).toLowerCase();
	else return ""
}

/**
 * 上传文件@file 表单获取到的file值
 */
 export function upLoadFileNew(file:any)
 {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    let fileList = [];
     const type = file.name.split('.');
     fileList.push(file);
     const formData = new FormData();
     // tslint:disable-next-line:no-shadowed-variable
     fileList.forEach((file: any) => {
       formData.append('file', file);
       formData.append('fileType', type[1]);
       formData.append('filename', file.name);
     });
     this.load = true;
     const url = '/act/system/upload';
     return new Promise((resolve,rejcet)=>{
      this.http.posts(url, formData).subscribe((res => {
        if (res.code === '0000') {
          this.load = false;
          fileList[0].fileId = res.data;
          let fileId=res.data;
          let obj={
            fileList:fileList,
            fileId:fileId,
          }
          resolve(obj);
          this.message.create('success', res.msg);
        } else {
          this.message.create('error', res.msg);
        }
      }),(error)=>{
           this.load=false;
           rejcet(this.load);
           this.message.create('error',"上传失败!");
      });
    })
 }

/**
 * 上传文件 @fileList 上传文件的回显参数 @file 表单获取到的file值 @fileId 保存后端返回来值
 */
export function upLoadFile(fileList:any, file:any, fileId:any,dataBase='dataBase')
{
  this[fileList] = [];
    const type = file.name.split('.');
    this[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type[1]);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe(res => {
      if (res.code === '0000') {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this[dataBase][fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    });

}

/**
  * 用于多文件回上传回显使用
   * @param   fileList 回显数组
   * @param   name 接口返回数组
   */
 export function viewDatas(fileList,name:any) {
 if(name)
 {
  const bidWinningNotice = name
  if (bidWinningNotice != null&&bidWinningNotice!=""&&bidWinningNotice.length>0) {
    fileList= [];
    bidWinningNotice.map(vals=>{
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = vals.fileId;
      obj.fileId = vals.fileId;
      obj.name =vals.fileName?vals.fileName:"文件下载";
      fileList=fileList.concat(obj);
    })
    return  fileList;
  }
  else{
    return [];
  }
 }
 else{
   return [];
 }

}
/**
 * 多个文件上传
 * 上传文件 @fileList 上传文件的回显参数 @file 表单获取到的file值 @fileId 保存后端返回来值
 */
 export function upLoadFiles(fileList:any, file:any,dataBase?:any)
 {

     const type = getType(file);
     const formData = new FormData();
     // tslint:disable-next-line:no-shadowed-variable
    //  this[fileList].forEach((file: any) => {
       formData.append('file', file);
       formData.append('fileType', type);
       formData.append('filename', file.name);
    // });
     this.load = true;
     const url = '/act/system/upload';
     if(this[fileList].length<5)
     {
       return new Promise((resolve,rejcet)=>{
        this.http.posts(url, formData).subscribe((res => {
          if (res.code === '0000') {
            this.load = false;
            if(dataBase!=null&&dataBase!=undefined&&dataBase!="")
            {
              this[dataBase][fileList]=this[dataBase][fileList].concat(file);  //多文件
              this[dataBase][fileList].map(vals=>{
                vals.uid==file.uid&&(vals.fileId=res.data);
              });
                this[dataBase].contractDate=formatDates(new Date())
            }
            else
            {
            this[fileList]=this[fileList].concat(file);
            this[fileList].map(vals=>{
              vals.uid==file.uid&&(vals.fileId=res.data);
            });
             resolve(this[fileList])
            }
            this.message.create('success', res.msg);
          } else {
            this.message.create('error', res.msg);
          }
        }),(error=>{
          this.message.create('error',"上传失败请重新上传!");
          this.load = false;
        }));
       })
     }
     else
     {
       this.message.create('error','最多上传5个文件!');
       this.load = false;
     }
 }
//电话号码正则表达式验证
export function checkPhone(params)
{
  var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则

  var phoneNum = '15507621999';//手机号码

  var flag = reg.test(params); //true

}
// 千分位转换
export function NumberThousandth(value) {
    if (value != null && value != undefined && value !== '') {
      value = value.toString();
      const index = value.indexOf('.');
      if (index != -1) {
        value = value.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        return value;
      } else {
        value = value.replace(/(?=(?!(\b))(\d{3})+$)/g, '$1,');
        return value;
      }
    }

}
  // 截取数字保留两位小数
  export function chNumber(e) {
    if (e) {
      e = e.toString();
      let i = e.indexOf('.');
      if (i != -1 && i + 2 <= e.length) {
        return e.substring(0, i + 3);
      }
      if (i == -1 && e && e.length > 0) {
        return e + '.00';
      }
      return e;
    }
    return e;
  }
  //除去空格
  export function clearSpaces(e)
  {
    return e.replace(/\s+/g,"");
  }
//后端返时间差8小时
export function standardTime(value)
{
  if (value) {
    let currentZoneTime = new Date(value);
    let currentZoneHours = currentZoneTime.getHours();
     // currentZoneTime.setHours(currentZoneHours-8);
      return currentZoneTime
    }
}
Date.prototype.toLocaleString = function() {
  return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + "/" + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
};
//后端返时间差8小时
export function standardTimes(value)
{

  if (value && value.toString().indexOf('-') != -1) {
    let currentZoneTime = new Date(value);
    let currentZoneHours = currentZoneTime.getHours();
    //  currentZoneTime.setHours(currentZoneHours-8);
      return currentZoneTime
    }
}
//比较日期是否过期
export function isadopt(param)
{
  if (param) {
    let endDates = new Date(param);
    let year = endDates.getFullYear();
    let month = endDates.getMonth() + 1;
    let day = endDates.getDate();
    let overdue = `${year}/${month}/${day}`;
    let overDate = new Date(overdue).setHours(0, 0, 0, 0);
    let endDate = new Date(overDate).getTime();
    let nowDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    let iRemain: any = (endDate - nowDate) / 1000;
    iRemain = iRemain / 86400;
    iRemain = parseInt(iRemain) + 1;
    if (iRemain >= 1) {
      return "通过";
    }
    else {
      return "不通过";
    }
  }
  else {
    return null
  }
}

// 判断当前角色是否在数组内
export function haveRolesArr(arr) {
  const roles = JSON.parse(localStorage.getItem('roles'));
  if (roles && arr) {
    for (let i = 0; i < roles.length; i++) {
      if (arr.indexOf(roles[i]) !== -1) {
        return true;
      }
    }
  }
  return false;
}

