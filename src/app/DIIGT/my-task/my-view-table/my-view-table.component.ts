import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
//import {TreeNodeInterface} from '../myTaskTable/MyTaskTable.component';
import {Router} from '@angular/router';
import {HttpService} from '../../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {codeString} from '../../../../assets/js/tools';
import {ProcessStatusPipe} from '../../../pipes/process-status.pipe';
import {ProcessBtn} from '../../../pipes/process-btns.pipe';
import {ProcessModel} from '../../../pipes/process-model.pipe';
import {proceessAuthor} from '../../../pipes/proceess-author.pipe';
import {TimeFormatePipe} from '../../../pipes/time-formate.pipe';

export interface TreeNodeInterface {
  key: string;
  taskStatus: string;
  treeName: string;
  tenderApplication: string;
  preparationSheet: string;
  contractSummary: string;
  histiryContractSummary: string;
  sale: string;
  bidding_name: string;
  bidding_no: string;
  product_name: string;
  bidding_name1: string;
  hospital_name: string;
  projectIformations: [];
  processTime: string;
  BusinessModel: string;
  entryMode: string;
  entryStatus: string;
  applyType: string;
  BiddingAuthorizationMode: string;
  BiddingAuthorizationStatus: string;
  tender_authorization: string;
  preFP: string;
  oitrealTime: string;
  thirdPartySelfProcurementVerification: string;
  operations: [];
  level: number;
  expand: boolean;
  children?: TreeNodeInterface[];
}

@Component({
  selector: 'app-my-view-table',
  templateUrl: './my-view-table.component.html',
  styleUrls: ['./my-view-table.component.scss'],
  providers: [
    ProcessStatusPipe,
    ProcessBtn,
    ProcessModel,
    proceessAuthor,
    TimeFormatePipe
  ]
})
export class MyViewTableComponent implements OnInit {

  @Input() listOfMapData: []; // decorate the property with @Input()
  @Input() total: 0;
  @Input() loading: false;
  @Input() flag: any;
  // ZBSQ 招标授权
  // task_status 待提交 DTJ  编辑、提交、删除;招标授权
  // task_status 待备案 DBA  编辑；待备案
  // task_status 待商务专员确认 DSWZYQR 编辑；中标确认
  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  nzLoading = false;
  public pagination = {
    pageNo: 1,
    pageSize: 10,
    reload: false,
  };
  user:any;
  @Output() updateTable = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  public entryModeList: any = [];
  public biddingAuthorizationModeList: any = [];

  // 记录已经查询过的id 防止多次查询
  dealerCkAuditId = [];
  // 经销商自采第三方核查 显示id
  dealerAuditId = [];
  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private nzMessageService: NzMessageService,
  ) { }

  cancelSecondBid(): void {
    this.nzMessageService.info('Cancel this operation');
  }

  confirmSecondBid (item, operation) {
    this.secondBidding(item, operation);
  }
  // 二次开标
  secondBidding (item, operation) {
    const params = {
      mainID: item.id,
      operation: operation,
    };
    this.http.post(`/act/ecom/bidding/secondBidding`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          this.router.navigate(['/']);
          // this.pagination = {
          //   pageNo: 1,
          //   pageSize: 10,
          //   reload: true,
          // };
          // this.updateTable.emit(this.pagination);
        }, 3000);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  cancelBidding(): void {
    this.nzMessageService.info('Cancel this operation');
  }

  confirmBidding (item, operation) {
    this.goBidding(item, operation);
  }
  // 二次开标
  goBidding (item, operation) {
    const params = {
      mainID: item.id,
      operation: operation,
    };
    this.http.post(`/act/ecom/bidding/gobidding`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
          // this.pagination = {
          //   pageNo: 1,
          //   pageSize: 10,
          //   reload: true,
          // };
          // this.updateTable.emit(this.pagination);
        }, 3000);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  changePageIndex (pageNo) {
    // console.log('pageNo', pageNo);
    this.pagination.pageNo = pageNo;
    this.nzLoading = true;
    this.setLoading.emit(this.nzLoading);
    this.updateTable.emit(this.pagination);
  }
  changePageSize (pageSize) {
    console.log('pageSize', pageSize);
    this.pagination.pageSize = pageSize;
    this.nzLoading = true;
    this.setLoading.emit(this.nzLoading);
    this.updateTable.emit(this.pagination);
  }
  //待oit文件上传
  goCompleteOit(item,param)
  {
    this.router.navigate(['/completeOit'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
        param:param,
        sale:item.sale
      },
    });
  }
  // 待oit文件上传 补充文件完成
  goCompleteOitFile(item) {
    this.router.navigate(['/suppfile'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
        sale:item.sale,
      },
    });
  }
  //审核 order summary
  goExaminesummary(item)
  {
    this.router.navigate(['/inorderexam'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        state: item.task_status,
      },
    });

  }
  //填写 odersummary
  goOrdersummary(item)
  {
    this.router.navigate(['/inorder'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        state: item.task_status,
      },
    });
  }
  // 待补充文件上传
  goSuppfile (item) {
    this.router.navigate(['/suppfile'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
        sale:item.sale,
      },
    });
  }
  // 合同子流程查看
  goUn (item) {
    this.router.navigate(['/viewsubp'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: '1'
      },
    });
  }
  // 进单审核
  goToPreorderaudit (item) {
    this.router.navigate(['/preorderaudit'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        state: item.task_status,
      },
    });
  }
  goTenderreview(item) {
    if (item.task_status === 'DSWYSH') {
      this.router.navigate(['/tenderreview'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          status: item.task_status,
          flag: item.processor.indexOf(this.user)!=-1? this.flag : 1,
        },
      });
    } else {
      this.router.navigate(['/tenderreview_sale'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          status: item.task_status,
          flag: item.processor.indexOf(this.user)!=-1 ? this.flag : 1,
          taskid: item.taskID,
        },
      });
    }
  }
  goEmp(item) {
    this.router.navigate(['/emp'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.processor.indexOf(this.user)!=-1?this.flag:1,
        sale: item.sale
      },
    });
  }

  // 只读
  goEmp2(item) {
    this.router.navigate(['/emp'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: 1,
        sale: item.sale
      },
    });
  }
  // 待销售部门审核
  // 待填写合同
  // 待非标审核DFBSH, taskID === paymentProvision,显示installationWarranty下的"下一级是否审核"
  goExamineOrder(item) {

    if (item.task_status === 'DFBSH') {
      this.router.navigate(['/igt/examine-order'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
          status: item.task_status,
          taskID: item.taskID,
        },
      });
    } else {
      this.router.navigate(['/igt/examine-order'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag: this.flag,
          status: item.task_status,
          taskID: item.taskID,
        },
      });
    }
  }

  // 取消进单
  goExamineOrderEnd(item) {
    this.router.navigate(['/igt/examine-order'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:'1',
        status: item.task_status,
        taskID: item.taskID,
      },
    });
  }

  // 修改合同概要表
  goInconmodif(item) {
    this.router.navigate(['/inconmodif'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.router.navigate(['/consign'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
        sale:item.sale,
      },
    });
  }
  goToWinningBid(item) {
    this.router.navigate(['/winning'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
      },
    });
  }
  goToWinningBid2(item) {
    this.router.navigate(['/winning'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: 1,
        status: item.task_status,
      },
    });
  }
  goToSupportUp(item) {
    this.router.navigate(['/support-up'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.processor.indexOf(this.user)!=-1?this.flag:1,
        status: item.task_status,
      },
    });
  }
  goToBid(item) {
    this.router.navigate(['/bid'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag:item.processor.indexOf(this.user)!=-1?this.flag:1
      },
    });
  }
  goToApplyTenderModif(item) {
    if (item.type === 'ZBSQ') {
      this.router.navigate(['/applytendermodif'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag:item.processor.indexOf(this.user)!=-1?this.flag:1,
        },
      });
    } else {
      this.router.navigate(['/preordermodifs'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag:item.processor==this.user?this.flag:1,
          edit: true,
        },
      });
    }

  }

   //审核改单
 goChangeApproval(item,param)
 {
   this.router.navigate(['/completeOit'], {
     skipLocationChange: false,
     queryParams: {
       id: codeString(item.lastMainId),
       mainId:codeString(item.main_id),
       flag:item.processor.toLowerCase().indexOf(this.user)!=-1 ? this.flag : 1,
       status: item.task_status,
       param:param,
       sale:item.sale
     },
   });
 }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listOfMapData']) {
      this.listOfMapData = changes['listOfMapData'].currentValue;
      this.listOfMapData.forEach(item => {
        this.mapOfExpandedData[item['key']] = this.convertTreeToList(item);
      });
    }
  }

  collapse(array: TreeNodeInterface[], data: TreeNodeInterface, $event: boolean): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: object): TreeNodeInterface[] {
    const stack: any[] = [];
    const array: any[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: true });

    while (stack.length !== 0) {
      const node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], level: node.level + 1, expand: true, parent: node });
        }
      }
    }

    return array;
  }

  visitNode(node: TreeNodeInterface, hashMap: { [key: string]: any }, array: TreeNodeInterface[]): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  ngOnInit(): void {
    this.user=localStorage.getItem("ng_philips_code1");
    this.getEntryModeList();
    this.getBiddingAuthorizationModeList();
    this.getAllSeal();
  }

  ProJdType(e) {
    // switch (e) {
    //   case 'STOCK':
    //     return 'stock 进单';
    //   case 'BINDING':
    //     return 'Bidding 进单';
    //   default:
    //     return e;
    // }
    for (let i = 0; i < this.entryModeList.length; i++) {
      if (this.entryModeList[i].code === e) {
        return this.entryModeList[i].label;
      }
    }
    return e;
  }
  ProAppType(e) {
    // biddingAuthorizationModeList
    // switch (e) {
    //   case 'BINDING':
    //     return 'Bidding 授权';
    //   default:
    //     return e;
    // }
    for (let i = 0; i < this.biddingAuthorizationModeList.length; i++) {
      if (this.biddingAuthorizationModeList[i].code === e) {
        return this.biddingAuthorizationModeList[i].label;
      }
    }
    return e;
  }

  // 按钮第“三方自采核查” 只有在 经销商自采第三方核查 选择“是“的时候显示
  // 对所有main进行便利  查询ordersummary接口  如果需要显示则放在 dealerAuditId 数组里
  // dealerCkAuditId 数组 防止多次执行 执行一次存入 dealerCkAuditId 数组
  CkSealedFileId(id) {
    const main_id = id.main_id;
    // 判断此id是否检查过
    if (this.dealerCkAuditId.indexOf(main_id) == -1) {
      this.dealerCkAuditId.push(main_id);
      this.http.get('/act/preparation/queryOrderSummary?mainId=' + main_id).subscribe(res => {
        if (res.data && res.data.dealerAudit === 'yes') {
          this.dealerAuditId.push(main_id);
        } else {
        }
      });
    }
    return true;
  }




  // 进单模式
  public getEntryModeList () {
    const params = {
      dictGroup: 'ENTRY_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.entryModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // 招标授权模式
  public getBiddingAuthorizationModeList () {
    const params = {
      dictGroup: 'AUTHORIZATION_MODE',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.biddingAuthorizationModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  public saleList = [];
  public getAllSeal() {
    const url = '/act/ecom/homepage/querySalesByRole';
    this.http.post(url, []).subscribe(res => {
      if (res && res.data) {
        this.saleList = res.data;
      }
    });
  }
  public emailToName (email) {
    if (this.saleList) {
      for (let i = 0; i < this.saleList.length; i++) {
        if (this.saleList[i].email == email) {
          return this.saleList[i].name;
        }
      }
    }
    return '';
  }

}
