// http请求
import { Injectable, EventEmitter } from "@angular/core";
import { HttpService } from "@core/services";
function formatResponse(res) {
    if ("0000" === res["code"]) {
      return res.data;
    } else {
      throw new Error(res.msg);
    }
  }

@Injectable()
export class ScheduleService {
  constructor(private http: HttpService) {
   
  }


  //脚本类型
  getScriptTypeList() {
    const url = `/act/scheduler/handlers`;
    return this.http.get(url).toPromise();
  }

  //报表类型
  getReportFormType(param) {
    const url = `/act/scheduler/email/reportsList`;
    return this.http.post(url, param).toPromise();
  }

  //提交
  Submit(param) {
    const url = `/act/scheduler`;
    return this.http.post(url, param).toPromise();
  }

  //更新
  Update(param, taskNumber) {
    const url = `/act/scheduler/${taskNumber}`;
    return this.http.post(url, param).toPromise();
  }

  //获取详情
  getData(taskNumber) {
    const url = `/act/scheduler/${taskNumber}`;
    return this.http.get(url).toPromise();
  }

  //删除
  Delete(param) {
    const url = `/act/scheduler/delete?taskNumber=${param}`;
    return this.http.post(url).toPromise();
  }


  //获取文件名
  getDuration(param) {
    const url = `/act/scheduler/email/getDuration`;
    return this.http.post(url, param).toPromise();
  }

  //获取文件名
  generateFileName(param) {
    const url = `/act/scheduler/email/generateReportFileName`;
    return this.http.post(url, param).toPromise();
  }
  

}