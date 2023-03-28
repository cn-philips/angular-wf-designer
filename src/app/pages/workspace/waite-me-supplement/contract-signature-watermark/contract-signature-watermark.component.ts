import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FileService, HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { forkJoin } from 'rxjs'

@Component({
  selector: 'contract-signature-watermark',
  templateUrl: './contract-signature-watermark.component.html',
  styleUrls: ['./contract-signature-watermark.component.scss']
})
export class ContractSignatureWatermarkComponent implements OnInit {
  //待上传正本合同
  @ViewChild('table') table;
  formValues:any = {
  }

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public total=0; //统计数量
  public totalOne = 0; //oa无需处理
  public totalTwo=0; //zsl处理
  public totalThree=0; //zsl admin
  public totalFour=0; //待oa处理
  public loading = true;
  public tableData = [];
  public userList = [];
  public isHandle = 0;   
  public zslSignSupplement=1;
  public type = 'contract'; // 补充文件类型-待上传正本合同 
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private servesiceService: ServesiceService
  ) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
  }
  @ViewChild("searchItem") searchItem;
  ngOnInit() {
    const roleCode=JSON.parse(localStorage.getItem("roles"));
    if(roleCode.includes('OA'))
    {
      this.zslSignSupplement=4;
    }
    else if(roleCode.includes('Contract Signatory'))
    {
      this.zslSignSupplement=2;
    }
    else{
      this.zslSignSupplement=3
    }
    this.formValues.zslSignSupplement=this.zslSignSupplement;
    this.getTableData();
  }

  updateParams(values: any) {     
    this.formValues = values;
    //this.isHandle = values.isHandle;
    this.zslSignSupplement=this.formValues.zslSignSupplement;
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.getTableData();
    this.table.resetPage();
  }

  updateDataList(pagination: any) {
    if (pagination.reload) {
      this.pageParams = {
        pageNo: 1,
        pageSize: 10,
      };
    }
    this.pageParams['pageNo'] = pagination.pageNo;
    this.pageParams['pageSize'] = pagination.pageSize;
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  getTableData() {
    this.formValues = {
      ...this.formValues,
     // oaSupplementContract: this.isHandle,
     // orderByClause: 'createTime desc',
    }
   
    // 待我补充
    const params = {
      ...this.formValues,
      ...this.pageParams
    }
    if(params.zslSignSupplement!=4)
    {
      params.zslSignSupplement=[params.zslSignSupplement]
    }
    else{
      params.zslSignSupplement=[4,5]
    }
    
    this.http.post(`/act/ecos/apply/todoZslSignature`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          item.processor = item.processor ? item.processor.toLowerCase() : "";
          item.processor = item.processor.split(",");
          const userList = this.userList.filter((val) => { return item.processor.indexOf(val.toLowerCase()) > -1 });
          item.operation = userList.length > 0 ? true : false;
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
              ite.processor = ite.processor ? ite.processor.toLowerCase() : "";
              ite.processor = ite.processor.split(",");
              const userList = this.userList.filter((val) => { return ite.processor.indexOf(val.toLowerCase()) > -1 });
              ite.operation = userList.length > 0 ? true : false;
              if (ite.children && ite.children.length === 0) {
                delete data[index].children[inde].children;
              }
            });
          }
        });
        
        this.tableData = data;
        this.getAllTotal(); 
        this.total=rest.data.total
        
      } else {
        this.message.create('error', `${rest.msg}`);
        this.servesiceService.myFormLoad.emit(false);
      }
    }), (error => {
      this.loading = false;
      this.servesiceService.myFormLoad.emit(false);
      this.message.create("error", "服务器异常")
    }));
  }
  getAllTotal()
  {
    forkJoin(
      this.getTabTotal(1),
      this.getTabTotal(2),
      this.getTabTotal(3),
      this.getTabTotal(4))
      .subscribe((data) => {
        
        this.loading = false;
        this.totalOne=data[0].data.total;
        this.totalTwo=data[1].data.total;
        this.totalThree=data[2].data.total;
        this.totalFour=data[3].data.total;
        this.formValues.zslSignSupplement=this.zslSignSupplement;
      }, (error) => {        
        console.log(error)
      });
  }
 getTabTotal(param)
 {
    this.formValues.zslSignSupplement=param;
    const params = {
      ...this.formValues,
      ...this.pageParams
    }
    if(params.zslSignSupplement!=4)
    {
      params.zslSignSupplement=[params.zslSignSupplement]
    }
    else{
      params.zslSignSupplement=[4,5]
    }
  return this.http.post(`/act/ecos/apply/todoZslSignature`, params)
 }

 loadWatermark(event)
 {
  this.searchItem.handleWatermark();
 }
 setAuthorizationMail(event)
 {
  this.searchItem.handleAuthorizationMail();
 }

}
