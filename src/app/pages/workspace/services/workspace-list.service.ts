import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WorkspaceListService {
  public userList: any = [];
  public user: any = null;
  constructor(private http: HttpService, private message: NzMessageService) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    this.user = localStorage.getItem("ecom_ng_philips_code1");
  }
  getMyTodo(extParams?) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    const params = {
      pageNo: 1,
      pageSize: 1,
      taskAssignee: localStorage.getItem("ecom_ng_philips_code1"),
      orderByClause: "updateTime desc",
      ...extParams,
    };
    return this.http.post(`/act/ecos/apply/task/todo`, params).pipe(
      map((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          const total = rest.data.total;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val) > -1;
            });
            item.operation = userList.length > 0 ? true : false;
            if (item.children && item.children.length === 0) {
              delete data[index].children;
            } else if (item.children && item.children.length > 0) {
              item.children.map((ite, inde) => {
                ite.processor = ite.processor
                  ? ite.processor.toLowerCase()
                  : "";
                ite.processor = ite.processor.split(",");
                const userList = this.userList.filter((val) => {
                  return ite.processor.indexOf(val) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });
          return { data, total };
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      })
    );
  }
  getMyDone(extParams?) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    const params = {
      pageNo: 1,
      pageSize: 1,
      taskAssignee: localStorage.getItem("ecom_ng_philips_code1"),
      orderByClause: "updateTime desc",
      ...extParams,
    };
    return this.http.post(`/act/ecos/apply/task/approved`, params).pipe(
      map((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          const total = rest.data.total;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val) > -1;
            });
            item.operation = userList.length > 0 ? true : false;
            if (item.children && item.children.length === 0) {
              delete data[index].children;
            } else if (item.children && item.children.length > 0) {
              item.children.map((ite, inde) => {
                ite.processor = ite.processor
                  ? ite.processor.toLowerCase()
                  : "";
                ite.processor = ite.processor.split(",");
                const userList = this.userList.filter((val) => {
                  return ite.processor.indexOf(val) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });
          return { data, total };
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      })
    );
  }
  getMyTask(extParams?) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    const params = {
      pageNo: 1,
      pageSize: 1,
      applicant: localStorage.getItem("ecom_ng_philips_code1"),
      processStatusNotIn: ["ecos_status_draft"],
      orderByClause: "updateTime desc",
      ...extParams,
    };
    return this.http.post(`/act/ecos/apply/findApply`, params).pipe(
      map((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          const total = rest.data.total;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val) > -1;
            });
            item.operation = userList.length > 0 ? true : false;
            if (item.children && item.children.length === 0) {
              delete data[index].children;
            } else if (item.children && item.children.length > 0) {
              item.children.map((ite, inde) => {
                ite.processor = ite.processor
                  ? ite.processor.toLowerCase()
                  : "";
                ite.processor = ite.processor.split(",");
                const userList = this.userList.filter((val) => {
                  return ite.processor.indexOf(val) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });
          return { data, total };
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      })
    );
  }
  getMyDraft(extParams?) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    // 我的草稿
    const params = {
      pageNo: 1,
      pageSize: 1,
      applicant: localStorage.getItem("ecom_ng_philips_code1"),
      processStatusIn: ["ecos_status_draft"],
      orderByClause: "updateTime desc",
      ...extParams,
    };

    return this.http.post(`/act/ecos/apply/findDraft`, params).pipe(
      map((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          const total = rest.data.total;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val) > -1;
            });
            item.operation = userList.length > 0 ? true : false;
            if (item.children && item.children.length === 0) {
              delete data[index].children;
            } else if (item.children && item.children.length > 0) {
              item.children.map((ite, inde) => {
                ite.processor = ite.processor
                  ? ite.processor.toLowerCase()
                  : "";
                ite.processor = ite.processor.split(",");
                const userList = this.userList.filter((val) => {
                  return ite.processor.indexOf(val) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });
          return { data, total };
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      })
    );
  }
  getMyView(extParams?) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    const params = {
      pageNo: 1,
      pageSize: 1,
      applicant: localStorage.getItem("ecom_ng_philips_code1"),
      orderByClause: "updateTime desc",
      ...extParams,
    };
    return this.http.post(`/act/ecos/apply/viewable`, params).pipe(
      map((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          const total = rest.data.total;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val) > -1;
            });
            item.operation = userList.length > 0 ? true : false;
            item.key = item.id;
            if (item.children && item.children.length === 0) {
              delete data[index].children;
            } else if (item.children && item.children.length > 0) {
              item.children.map((ite, inde) => {
                ite.processor = ite.processor
                  ? ite.processor.toLowerCase()
                  : "";
                ite.processor = ite.processor.split(",");
                const userList = this.userList.filter((val) => {
                  return ite.processor.indexOf(val) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                ite.key = ite.id;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });
          return { data, total };
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      })
    );
  }
  getMyReport(extParams?) {}
  saveImage(param) {
    //保存水印图片 
    const url = `/act/ecos/signature/save/image`;
    return this.http.post(url, param).toPromise();
  }
  getImage()
  {
    //查询图片地址
    const url="/act/ecos/signature/find/image";
    return this.http.get(url).toPromise()
  }
  saveZsladmin(param)
  { //保存zsladmin
    const url=`/act/ecos/signature/save/zsladmin`;
    return this.http.post(url, param);
  }
  getZsladmin()
  {
    //查询zsladmin
    const url=`/act/ecos/signature/find/zsladmin`;
    return this.http.get(url).toPromise();
  }
  getCduser(seachParam)
  { //获取人员列表
    const url='/act/ecos/oit/cdUser/only';
    return this.http.post(url,seachParam)
  }  
  summitZsladmin(batchParam)
  { //批量转给zslAdmin
    const url=`/act/ecos/signature/batch/zsladmin`;
    return this.http.post(url,batchParam)
  }
}
