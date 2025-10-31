import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FileService, HttpService, ServesiceService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
import { forkJoin } from "rxjs";

@Component({
  selector: "pod-contract-electronic-signature",
  templateUrl: "./pod-contract-electronic-signature.component.html",
  styleUrls: ["./pod-contract-electronic-signature.component.scss"],
})
export class PodContractElectronicSignatureComponent implements OnInit {
  //待上传正本合同

  @Input() from = "";

  @ViewChild("table") table;
  formValues: any = {
    queryType: "todo",
  };

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
    signType:'POD'
  };
  public total = 0; //统计数量
  public totalOne = 0; //oa无需处理
  public totalTwo = 0; //zsl处理
  public totalThree = 0; //zsl admin
  public totalFour = 0; //待oa处理
  public loading = true;
  public tableData = [];
  public userList = [];
  public isHandle = 0;
  public queryType = "todo";
  public type = "contract"; // 补充文件类型-待上传正本合同
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private servesiceService: ServesiceService
  ) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
  }
  @ViewChild("electronicSearchItem") electronicSearchItem;
  ngOnInit() {
    if (this.from === "my-done") {
      this.formValues.queryType = "done";
    }
    this.getTableData();
  }

  updateParams(values: any) {
    this.formValues = values;
    //this.isHandle = values.isHandle;
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
      signType:'POD'
    };
    this.getTableData();
    this.table.resetPage();
  }

  handleBatchSignContract() {
    this.table.handleBatchSignContract();
  }

  updateDataList(pagination: any) {
    if (pagination.reload) {
      this.pageParams = {
        pageNo: 1,
        pageSize: 10,
      signType:'POD'
      };
    }
    this.pageParams["pageNo"] = pagination.pageNo;
    this.pageParams["pageSize"] = pagination.pageSize;
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  getTableData() {
    console.log("this.formValues", this.formValues);
    this.formValues = {
      ...this.formValues,
      // oaSupplementContract: this.isHandle,
      // orderByClause: 'createTime desc',
    };

    // 待我补充
    const params = {
      ...this.formValues,
      ...this.pageParams,
    };

    this.http.post(`/act/contractSign/list`, params).subscribe(
      (rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          data.map((item, index) => {
            item.processor = item.processor ? item.processor.toLowerCase() : "";
            item.processor = item.processor.split(",");
            const userList = this.userList.filter((val) => {
              return item.processor.indexOf(val.toLowerCase()) > -1;
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
                  return ite.processor.indexOf(val.toLowerCase()) > -1;
                });
                ite.operation = userList.length > 0 ? true : false;
                if (ite.children && ite.children.length === 0) {
                  delete data[index].children[inde].children;
                }
              });
            }
          });

          this.tableData = data;
          if (!this.from) {
            this.getAllTotal();
          } else {
            this.loading = false;
          }
          // this.getAllTotal();
          this.total = rest.data.total;
        } else {
          this.message.create("error", `${rest.msg}`);
          this.servesiceService.myFormLoad.emit(false);
        }
      },
      (error) => {
        this.loading = false;
        this.servesiceService.myFormLoad.emit(false);
        this.message.create("error", "服务器异常");
      }
    );
  }
  getAllTotal() {
    const role = JSON.parse(localStorage.getItem("roles"));
    if (role.includes("OA")) {
      forkJoin(
        this.getTabTotal("todo"),
        this.getTabTotal("handled"),
        this.getTabTotal("draft"),
        this.getTabTotal("done")
      ).subscribe(
        (data) => {
          this.loading = false;
          this.totalOne = data[0].data.total;
          this.totalTwo = data[1].data.total;
          this.totalThree = data[2].data.total;
          this.totalFour = data[3].data.total;
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      forkJoin(this.getTabTotal("todo"), this.getTabTotal("handled")).subscribe(
        (data) => {
          this.loading = false;
          this.totalOne = data[0].data.total;
          this.totalTwo = data[1].data.total;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
  getTabTotal(queryType) {
    const params = {
      ...this.formValues,
      ...this.pageParams,
      queryType,
    };
    return this.http.post(`/act/contractSign/list`, params);
  }

  loadWatermark(event) {
    this.electronicSearchItem.handleWatermark();
  }
  setAuthorizationMail(event) {
    this.electronicSearchItem.handleAuthorizationMail();
  }
}
