import {Component, OnInit, Input, SimpleChanges, Output, EventEmitter,ViewChild} from '@angular/core';
import {fromArray} from 'rxjs-compat/observable/fromArray';
import {Router, ActivatedRoute} from '@angular/router';
import {FileService, HttpService, UtilityService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {NzMessageService, UploadFile, UploadXHRArgs} from 'ng-zorro-antd';
import { ProcessStatusPipe } from '../../../pipes/process-status.pipe';
import { ProcessBtn } from '../../../pipes/process-btns.pipe';
import { ProcessModel } from '../../../pipes/process-model.pipe';
import { ProcessCompany } from '../../../pipes/process-company.pipe';
import { TimeFormatePipe } from '../../../pipes/time-formate.pipe';
import { ProcessThird } from '../../../pipes/process-third.pipe'
import { ServesiceService } from '../../preOrder/servesice.service';
import {NzModalService} from 'ng-zorro-antd';


import { ProcessProject } from '../../../pipes/process-project.pipe';
import {
  codeString,
} from '../../../../assets/js/tools';
import { proceessAuthor } from '../../../pipes/proceess-author.pipe';
import { isThisSecond } from 'date-fns';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { TypeModifier } from '@angular/compiler/src/output/output_ast';

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
  isCheck: null;
  children?: TreeNodeInterface[];
}

@Component({
  selector: 'igt-MyTaskTable',
  templateUrl: './MyTaskTable.component.html',
  styleUrls: ['./MyTaskTable.component.scss'],
  providers: [
    ProcessStatusPipe,
    ProcessBtn,
    ProcessModel,
    proceessAuthor,
    TimeFormatePipe,
    UtilityService
  ],
})
export class MyTaskTableComponent implements OnInit {
  @Input() listOfMapData: []; // decorate the property with @Input()
  @Input() total: 0;
  @Input() loading:any=false;
  @Input() flag: any;
  @Input() isMyStart: any = false;
  @ViewChild('child') child;
  @Input() public isMyToDo: any = false;
  @Output() myEvent = new EventEmitter();
  // ZBSQ 招标授权
  // task_status 待提交 DTJ  编辑、提交、删除;招标授权
  // task_status 待备案 DBA  编辑；待备案
  // task_status 待商务专员确认 DSWZYQR 编辑；中标确认
  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  public showData:any={
    refuseReason:null,
    remarks:"",
    file:"",
    title:"",
    code:"change",
  }
  nzLoading = false;
  public pagination = {
    pageNo: 1,
    pageSize: 10,
    reload: false,
  };
  user:any;
  @Output() updateTable = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();
  public openCheckbox = false;
  public load:any=false;
  public mainId:any;
  public processInstanceTaskId:any;
  public entryModeList: any = [];
  public biddingAuthorizationModeList: any = [];
  public isShow:any=false;

  // 记录已经查询过的id 防止多次查询
  dealerCkAuditId = [];
  // 经销商自采第三方核查 显示id
  dealerAuditId = [];
  constructor(
    private https: HttpClient,
    private fileService: FileService,
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private nzMessageService: NzMessageService,
    public utils:UtilityService,
    private ServesiceService: ServesiceService,
    private modalService: NzModalService,
  ) {
  }
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
      processInstanceTaskId: item.processInstanceTaskId
    };
    this.http.post(`/act/ecom/bidding/secondBidding`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          // 刷新当前页面
          this.router.navigateByUrl('', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/igt/my-task']);
          });
          // this.pagination = {
          //   pageNo: 1,
          //   pageSize: 10,
          //   reload: true,
          // };
          // this.updateTable.emit(this.pagination);
        }, 1000);
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
      processInstanceTaskId: item.processInstanceTaskId
    };
    this.http.post(`/act/ecom/bidding/gobidding`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          // 刷新当前页面
          this.router.navigateByUrl('', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/igt/my-task']);
          });
          // this.pagination = {
          //   pageNo: 1,
          //   pageSize: 10,
          //   reload: true,
          // };
          // this.updateTable.emit(this.pagination);
        }, 1000);
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
        flag:item.operation ? this.flag : 1,
        status: item.task_status,
        param:param,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //待oit文件上传
  goCompleteOitFile(item)
  {
    this.router.navigate(['/suppfile'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.operation?this.flag:1,
        status: item.task_status,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
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
        flag:item.operation?this.flag:1,
        status: item.task_status,
        state: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
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
        flag:item.operation?this.flag:1,
        status: item.task_status,
        state: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  // 待补充文件上传
  goSuppfile (item) {
    this.router.navigate(['/suppfile'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.operation?this.flag:1,
        status: item.task_status,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
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
        flag:item.operation?this.flag:1,
        status: item.task_status,
        state: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId,
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
          flag: item.operation? this.flag : 1,
          processInstanceTaskId:item.processInstanceTaskId,
        },
      });
    } else {
      this.router.navigate(['/tenderreview_sale'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          status: item.task_status,
          flag: item.operation ? this.flag : 1,
          taskid: item.taskID,
          processInstanceTaskId:item.processInstanceTaskId,
        },
      });
    }
  }
  goEmp(item) {
    this.router.navigate(['/emp'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag:item.operation?this.flag:1,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  // 授权发放只读
  goEmp2(item) {
    this.router.navigate(['/emp'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag:1,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
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
          flag:item.operation?this.flag:1,
          status: item.task_status,
          taskID: item.taskID,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    } else {
      this.router.navigate(['/igt/examine-order'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag:item.operation?this.flag:1,
          status: item.task_status,
          taskID: item.taskID,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    }
  }
 //取消进单或者关闭合同概要表
  goExamineOrderEnd(item) {
      this.router.navigate(['/igt/examine-order'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag:'1',
          status: item.task_status,
          taskID: item.taskID,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
  }

  // 修改合同概要表
  goInconmodif(item) {
    this.router.navigate(['/inconmodif'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.router.navigate(['/consign'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:item.operation?this.flag:1,
        status: item.task_status,
        sale:item.sale,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  goToWinningBid(item) {
    this.router.navigate(['/winning'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
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
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  goToSupportUp(item) {
    this.router.navigate(['/support-up'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  goToBid(item) {
    if (item.task_status == "2CKBZZ"){
      this.router.navigate(['/bid'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag:1,
          status:item.task_status,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    } else {
      this.router.navigate(['/bid'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag:item.operation?this.flag:1,
          status:item.task_status,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    }
  }
  goToBid2(item) {
    if (item.task_status == '2CKBZZ'){
      this.router.navigate(['/bid'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1,
          status: item.task_status,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    } else {
      this.router.navigate(['/bid'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1,
          status: item.task_status,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    }
  }
  goToApplyTenderModif(item) {
    if (item.type === 'ZBSQ') {
      this.router.navigate(['/applytendermodif'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag:item.operation?this.flag:1,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    } else {
      this.router.navigate(['/preordermodifs'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.main_id),
          flag:item.operation?this.flag:1,
          edit: true,
          processInstanceTaskId:item.processInstanceTaskId
        },
      });
    }

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

  public appUser = null;
  ngOnInit(): void {
    this.appUser = localStorage.getItem('ng_philips_code1');
    this.user=localStorage.getItem("ng_philips_code1").toLowerCase();
    this.getEntryModeList();
    this.getBiddingAuthorizationModeList();
    this.addSales();
    this.getAllSeal();
    const roleCode = JSON.parse(localStorage.getItem('roles'));
    if (roleCode) {
      roleCode.map(e => {
        if (e.toLowerCase() === 'oa' || e.toLowerCase() === 'oa leader') {
          this.isOA = true;
        }
        if (e.toLowerCase() === 'bidding') {
          this.isBidding = true;
        }
        if (e.toLowerCase() === 'win confirm') {
          this.isWinConfirm = true;
        }
      });
    }
  }

  ProJdType(e:any) {
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

  //改单
  changeOrder(param)
  {
   this.mainId=param.main_id;
   this.processInstanceTaskId=param.processInstanceTaskId;
   const url=`/act/preparation/checkCanBeOitChange/${this.mainId}`;
   this.http.get(url).subscribe(rest=>{
     if(rest.data)
     {
      this.isShow=true;
      this.showData.id=this.mainId;
      this.ServesiceService.confirmTime.emit(this.showData);
     }
     else
     {
       this.message.create("error","此进单已经发起过改单请勿重复提交")
     }
   })
  }

  //发起改单确定
  public isAgregentOk()
  {
    
    this.showData=this.child.infor;
    let param={
      mainId:this.mainId,
      check:this.child.infor.refuseReason,
      orderChangeId:this.child.infor.refuseReason,
      file:this.child.infor.file,
      remark:this.child.infor.remarks,
      processInstanceTaskId:this.processInstanceTaskId,
      changeDealForm:this.child.infor.changeDealForm
    }
    let vaild=this.child.checkFormData();
    if(!vaild)
    {
     // this.message.create("error","有必填项没有填写")
      return
    }    
    this.load = true;
    const url=`/act/preparation/changeRecord`;
    this.isShow=false;
    this.http.post(url,param).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', rest.msg);
        this.myEvent.emit()
        this.child.infor.file = "";
        this.child.infor.refuseReason = null;
        this.child.validateForm.reset();
        this.isShow = false;
      }
      else{
        this.load = false;
        this.message.create('error', rest.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));
  }

  //取消改单
  public isAgreCancels()
  {
    this.child.validateForm.reset();
    this.isShow=false;
  }
 //审核改单
 goChangeApproval(item,param)
 {
   this.router.navigate(['/completeOit'], {
     skipLocationChange: false,
     queryParams: {
       id: codeString(item.lastMainId),
       mainId:codeString(item.main_id),
       flag:item.operation ? this.flag : 1,
       status: item.task_status,
       param:param,
       sale:item.sale,
       processInstanceTaskId:item.processInstanceTaskId
     },
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
  /*转派逻辑*/
  // 转派弹出框
  public assignShowoff = false;
  public role = null;
  public roleList = [
    {name: 'OA', value: 'OA'},
    {name: 'Bidding', value: 'Bidding'},
    {name: 'Win Confirm', value: 'Win Confirm'}
  ];
  public receiver = null;
  public receiverList = [];
  public cancelModeal() {
    this.assignShowoff = false;
  }

  public openAssignShowoff() {
    this.receiver = null;
    this.role = null;
    this.assignShowoff = true;
  }

  public subAssignLoading: any = false;
  public subAssign() {
    // listOfMapData
    // 遍历mapOfExpandedData获取选中
    const arr = [];
    // if (this.mapOfExpandedData) {
    //   const mapOfExpandedData = this.mapOfExpandedData;
    //   const keys = Object.keys(mapOfExpandedData);
    //   const mapOfExpandedDataList = [];
    //   // 读取mapOfExpandedData所有数组
    //   if (keys) {
    //     keys.map(k => {
    //       if (mapOfExpandedData[k]) {
    //         mapOfExpandedData[k].map(map => {
    //           mapOfExpandedDataList.push(map);
    //         });
    //       }
    //     });
    //   }
      const mapOfExpandedDataList = this.getMapOfExpandedDataListAllData();
      // 获取选中记录mainid
      if (mapOfExpandedDataList) {
        mapOfExpandedDataList.map(map => {
          if (map && map.isCheck == true) {
            arr.push({
              mainId: map.main_id,
              role: this.role,
              receiver: this.receiver,
              flag: this.continue ? 1 : 0
            });
          }
        });
      // }
        if (!(arr && arr.length > 0)) {
          this.message.create('error', '未选择项目');
          return;
        }
        if (this.role == null || this.role === '') {
          this.message.create('error', '请选择角色');
          return;
        }
        if (this.receiver == null || this.receiver === '') {
          this.message.create('error', '请选择接收人');
          return;
        }
        if (this.continue){
          this.modalService.confirm({
            nzTitle: '请确认',
            nzContent: '是否确定持续将任务转派给接收人?',
            nzOkText: '确定',
            nzCancelText: '取消',
            nzOnOk: () =>{
              if (this.subAssignLoading) {
                return;
              }
              this.subAssignLoading = true;

              const url = '/act/ecom/homepage/transferOrderRecord';
              this.http.post(url, arr).subscribe(e => {
                this.subAssignLoading = false;
                this.assignShowoff = false;
                if (e && e.code === '0000') {
                  this.message.create('success', e.msg);
                  // this.router.navigate(['/igt/my-task']);
                  setTimeout(() => {
                    // 刷新当前页面
                    this.router.navigateByUrl('', {skipLocationChange: true}).then(() => {
                      this.router.navigate(['/igt/my-task']);
                    });
                  }, 1000);
                }
                else{
                  this.load = false;
                  this.message.create('error', e.msg);
                }
              }, error => {
                this.subAssignLoading = false;
                this.message.create('error', '请求失败');
              });
            }
          });
        }else {
          const url = '/act/ecom/homepage/transferOrderRecord';
          this.http.post(url, arr).subscribe(e => {
            this.subAssignLoading = false;
            this.assignShowoff = false;
            if (e && e.code === '0000') {
              this.message.create('success', e.msg);
              // this.router.navigate(['/igt/my-task']);
              setTimeout(() => {
                // 刷新当前页面
                this.router.navigateByUrl('', {skipLocationChange: true}).then(() => {
                  this.router.navigate(['/igt/my-task']);
                });
              }, 1000);
            }
            else{
              this.subAssignLoading = false;
              this.assignShowoff = false;
              this.message.create('error', e.msg);
            }
          }, error => {
            this.subAssignLoading = false;
            this.message.create('error', '请求失败');
          });
        }
    }
  }

  public getMapOfExpandedDataListAllData() {
    if (this.mapOfExpandedData) {
      const mapOfExpandedData = this.mapOfExpandedData;
      const keys = Object.keys(mapOfExpandedData);
      const mapOfExpandedDataList = [];
      // 读取mapOfExpandedData所有数组
      if (keys) {
        keys.map(k => {
          if (mapOfExpandedData[k]) {
            mapOfExpandedData[k].map(map => {
              mapOfExpandedDataList.push(map);
            });
          }
        });
      }
      return mapOfExpandedDataList;
    }
    return [];
  }

  public addSales() {
    const url = '/act/ecom/homepage/querySalesByRole';
    const par = [
      'OA', 'OA Leader', 'Bidding', 'Win Confirm'
    ];
    this.http.post(url, par).subscribe(res => {
      if (res && res.data) {
        this.receiverList = res.data;
      }
    });
  }
  public roleChange() {
    this.receiver = null;
  }

  public AllCheck(e) {
    const mapOfExpandedDataList = this.getMapOfExpandedDataListAllData();
    if (mapOfExpandedDataList) {
      for (let i = 0; i < mapOfExpandedDataList.length; i++) {
        if (mapOfExpandedDataList[i].children == null && (mapOfExpandedDataList[i].isCheck == false || mapOfExpandedDataList[i].isCheck === 'false' || mapOfExpandedDataList[i].isCheck == null)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }


  public CheckAll(eve, e) {
    if (this.mapOfExpandedData) {
      const keys = Object.keys(this.mapOfExpandedData);
      // 读取mapOfExpandedData所有数组
      if (keys) {
        for (let k = 0; k < keys.length; k++) {
          if (this.mapOfExpandedData[keys[k]]) {
            for (let i = 0; i < this.mapOfExpandedData[keys[k]].length; i++) {
              if (this.mapOfExpandedData[keys[k]][i].children == null) {
                this.mapOfExpandedData[keys[k]][i].isCheck = eve;
              }
            }
          }
        }
      }
    }
  }

  public isOA = false;
  public isBidding = false;
  public isWinConfirm = false;

  // 判断角色下拉框显示
  public ckRole(e) {
    if (e) {
      if (this.isOA && (e.toLowerCase() === 'oa' || e.toLowerCase() === 'oa leader')) {
        return true;
      }
      if (this.isBidding && e.toLowerCase() === 'bidding') {
        return true;
      }
      if (this.isWinConfirm && e.toLowerCase() === 'win confirm') {
        return true;
      }
    }
  }

  public continue = false;

  //发起prebook
  getPrebook(item)
  {
    this.router.navigate(['/prebook'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //prebook中止
  getPrebookend(item)
  {
    this.router.navigate(['/prebookso'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag:1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //prebookzpm和dsi审核
  getPrebookzmp(item)
  {
    this.router.navigate(['/prereview'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //PREBOOK-OA审核,District Leader审核,Sales Leader审核
  getPrebookOA(item)
  {
    this.router.navigate(['/prereoaview'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //prebook-oa补充文件上传
  getPrebookSupplement(item)
  {
    this.router.navigate(['/supplementoa'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //preboo-om回填
  getPrebookom(item)
  {
    this.router.navigate(['/prebookso'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.main_id),
        flag: item.operation ? this.flag : 1,
        status: item.task_status,
        processInstanceTaskId:item.processInstanceTaskId
      },
    });
  }
  //产品型号
  productModel(item)
  {
     switch(item.type)
     {
       case"ZBSQ":
        return item.productModelTb;
        break;
       case"JDZB":
        return item.productModelJd;
        break;
       case"PREBOOK":
         return item.productModelPb;
         break;
     }
  }
//opportunityId
opportunityId(item)
{
  switch(item.type)
     {
       case"ZBSQ":
        return item.opportunityIdTb;
        break;
       case"JDZB":
        return item.opportunityIdJd;
        break;
       case"PREBOOK":
         return item.opportunityIdPb;
         break;
     }
}
//dealFormId
dealFormIdFun(item)
{
  switch(item.type)
  {
    case"ZBSQ":
     return item.dealFormIdTb;
     break;
    case"JDZB":
     return item.dealFormIdJd;
     break;
    case"PREBOOK":
      return item.dealFormIdPb;
      break;
  }
}



}
