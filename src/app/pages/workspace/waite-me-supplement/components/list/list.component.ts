import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { Router } from "@angular/router";
import { DictService, HttpService } from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "cos-waite-me-supplement-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class WaiteMeSupplementListComponent implements OnInit {
  @Input() tableData = [];
  @Input() total = 0;
  @Input() loading: any = false;
  @Input() type: any;
  @Input() flag: any;
  @Input() isHandle = 0;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  public userList = [];
  public entryModeList = [];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private dictService: DictService,
  ) {}

  ngOnInit() {
    // this.getTableData()
    this.getEntryModeList();
  }

  //重置分页
  resetPage() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
  }

  operate(data: any) {
    let applyType = data.applyType;
    let orderType = ["OIT_MAIN", "OIT_SUB"];
    let biddingType = ["BIDDING"];

    if (orderType.includes(applyType)) {
      const url = "/order-v3/oitcomplete";
      this.router.navigate([url], {
        queryParams: {
          id: data.id,
          needFileType: this.type,
          processInstanceTaskId: data.processInstanceTaskId,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId,
          isHandle: this.isHandle
        },
      });
    } else if (biddingType.includes(applyType)) {
      this.router.navigate(["/bidding-v3", data.id], {
        queryParams: {
          processInstanceTaskId: data.processInstanceTaskId,
          procInstId: data.procInstId,
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
          fromSupplement: true,
          isHandle: this.isHandle
        },
      });
      return;
    } else if (applyType === 'PREBOOK') {
      this.router.navigate(["/prebook-v3", data.id], {
        queryParams: {
          processInstanceTaskId: data.processInstanceTaskId,
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
          fromSupplement: this.isHandle,
          procInstId: data.procInstId
        },
      });
    } else {
      this.message.create("error", "不支持的申请类型:" + applyType);
    }
  }

  changePageIndex(pageNo: number) {
    if (pageNo == 0) {
      pageNo = 1;
    }
    this.pageParams.pageNo = pageNo;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  changePageSize(pageSize: number) {
    // console.log('pageSize', pageSize);
    this.pageParams.pageSize = pageSize;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData('ENTRY_MODEL').subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }))
    });
  }

  //翻译进单模式
  ProOitModeType(e: any) {
    for (let i = 0; i < this.entryModeList.length; i++) {
      if (this.entryModeList[i].code === e) {
        return this.entryModeList[i].label;
      }
    }
    return e;
  }

  /*********** 一期跳转操作 Start  *********/
  //待oit文件上传 SO# 第三方自采
  goCompleteOit(item, param) {
 
    this.router.navigate(["/pre-order/complete-oit"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag:  this.flag,
        status: item.taskStatus,
        param: param,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //待oit文件上传
  goCompleteOitFile(item) {    
      this.router.navigate(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.isHandle,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 待补充文件上传
  goSuppfile(item) {    
    this.router.navigate(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.flag,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //中标确认文件待补充
  goToSupportUp(item) {
    this.router.navigate(["/bidding/support-up"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.isHandle===0 ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.router.navigate(["/pre-order/con-sign"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.flag,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //preboo-om回填
  getPrebookom(item) {
    this.router.navigate(["/pre-book/prebook-so"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.flag,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //prebook-oa补充文件上传
  getPrebookSupplement(item) {
    this.router.navigate(["/pre-book/supplement-oa"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.flag,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
}
