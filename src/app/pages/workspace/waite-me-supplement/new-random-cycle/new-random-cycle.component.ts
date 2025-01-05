import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd';
import * as moment from 'moment'
import { saveAs } from 'file-saver';
import { FileService, HttpService } from '@core/services';

@Component({
  selector: "new-random-cycle",
  templateUrl: "./new-random-cycle.component.html",
  styleUrls: ["./new-random-cycle.component.scss"],
})
export class NewRandomCycleComponent implements OnInit {
  constructor(
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private fileService: FileService,
    private message: NzMessageService,
    private router: Router,
    private http: HttpService,
  ) {}

  @ViewChild("selectDeal") selectDeal;

  summaryId = null
  isVisible = false;
  showRemove = false
  load = false
  isConfirmLoading = false;
  dealerInfos = []
  unlockData = []
  actType = null // del-删除 add-手动新增
  applyStatu = "UNLOCKED"
  routeType = 'add' // add-新建 edit-编辑
  isOAAdmin = false
  isAuditor = false
  remarkable = true
  public summaryData: any[] = []; // 随机抽取该概要
  public removedData: any[] = []; // 机抽取结果（删除）
  public detailData: any[] = []; // 随机抽取结果
  public reasonObj = {
    id: null,
    dealFormId: null,
    reason: null,
    attachments: null
  }

  formValues = this.fb.group({
    startDay: [null, Validators.required],
    endDay: [null, Validators.required],
  })

  ngOnInit() {
    this.routeType = this.activatedRouter.queryParams['_value'].type;
    if (this.routeType === 'edit') {
      const roleList = JSON.parse(localStorage.getItem("roles"));
      this.isOAAdmin = roleList.includes("OA Admin")
      this.isAuditor = roleList.includes("Auditor")

      const id = this.activatedRouter.queryParams['_value'].id;
      this.summaryId = id
      this.queryDetails(id)
    }
  }
  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.formValues.controls['endDay'].value) {
      return false;
    }
    return startValue.getTime() > this.formValues.controls['endDay'].value.getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.formValues.controls['startDay'].value) {
      return false;
    }
    return endValue.getTime() < this.formValues.controls['startDay'].value.getTime() ;
  };

  randomSelect() {
    if (!this.formValues.controls['startDay'].value || !this.formValues.controls['endDay'].value) {
      this.message.create('error', `请先选择随机抽查周期数据时间范围！`);
      return
    }
    this.load = true
    const params = {
      startTime: this.formValues.controls['startDay'].value.getTime(),
      endTime: this.formValues.controls['endDay'].value.getTime()
    }

    this.http.post(`/act/ecos/thirdParty/randomPick`, params).subscribe((res => {
      if (res.code === '0000') {
        const { id, summary, detail} = res.data;
        if (!summary || !detail) {
          this.message.create('error', `没有数据！`);
          this.load = false;
          return
        }
        this.load = false;
        const url = "/ecos/editRandomCycle";
        this.router.navigate([url], {
          queryParams: {
            id: id,
            type: 'edit',
          },
        });
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));

  }
  jumpToAuditDetail({referenceId,applyId,url}){
    this.router.navigate([url], {
      queryParams: {
        id: applyId,
        needFileType: 'third',
        taskStatus: 'ecos_oit_order_done',
        isHandle: 0
      },
    });

  }
  queryDetails(id) {
    this.load = true
    this.http.get(`/act/ecos/thirdParty/randomPick/detail/${id}`).subscribe((res => {
      if (res.code === '0000') {
        const { checkDurationStartTime, checkDurationEndTime, status, summary, removed, detail} = res.data;
        if (!summary || !detail) {
          this.message.create('error', `没有数据！`);
          this.load = false;
          return
        }
        this.applyStatu = status
        const totalSummaryRow = {
          highRiskAndNonPreConcludePickCount:0,
          highRiskAndNonPreConcludeTotal:0,
          highRiskAndPreConcludePickCount:0,
          highRiskAndPreConcludeTotal:0,
          id:null,
          lowRiskPickCount:0,
          lowRiskTotal:0,
          mediumRiskPickCount:0,
          mediumRiskTotal:0,
          pickCount:0,
          team:"ALL",
          total:0,
          tpcId:null,
        }
        this.summaryData = summary||[]
        this.summaryData.forEach(item => {
          totalSummaryRow.highRiskAndNonPreConcludePickCount += item.highRiskAndNonPreConcludePickCount
          totalSummaryRow.highRiskAndNonPreConcludeTotal += item.highRiskAndNonPreConcludeTotal
          totalSummaryRow.highRiskAndPreConcludePickCount += item.highRiskAndPreConcludePickCount
          totalSummaryRow.highRiskAndPreConcludeTotal += item.highRiskAndPreConcludeTotal
          totalSummaryRow.lowRiskPickCount += item.lowRiskPickCount
          totalSummaryRow.lowRiskTotal += item.lowRiskTotal
          totalSummaryRow.mediumRiskPickCount += item.mediumRiskPickCount
          totalSummaryRow.mediumRiskTotal += item.mediumRiskTotal
          totalSummaryRow.pickCount += item.pickCount
          totalSummaryRow.total += item.total
        })
        this.summaryData.unshift(totalSummaryRow)
        this.removedData = removed
        let handledDetail = detail.map(d=>{
          d.auditDetailsUrlList = []
          d.orderDetails.map(order=>{
            d.auditDetailsUrlList.push({
              referenceId: order.referenceId,
              applyId: order.applyId,
              url: `/order-v3/oitcomplete`
            })
          })
          return d;
        });
        this.detailData = handledDetail
        this.formValues.patchValue({
          startDay: new Date(checkDurationStartTime),
          endDay: new Date(checkDurationEndTime),
        })
        this.load = false;
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  showAddModal() {
    this.selectDeal.show({}, true);
  }

  onDealFormSelect(val) {
    this.resetReasonObj()
    this.reasonObj.dealFormId = val.dealFormId
    this.actType = 'add'
    this.showRemove = true
  }

  confirmSelect() {
    this.load = true;
    const files = this.reasonObj.attachments.map(file => ({
      fileId: file.fileId,
      name: file.name
    }));

    const jsonString = JSON.stringify(files)
    const params = {
      ...this.reasonObj,
      attachments: jsonString
    }

    this.http.post(`/act/ecos/thirdParty/randomPick/add/${this.summaryId}`, params).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        this.message.create("success", "操作成功!")
        this.showRemove = false
        this.queryDetails(this.summaryId)
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  showModal() {
    this.unlockData = []

    this.load = true;
    const dealFormIds = this.detailData.map(item => item.dealFormId)
    this.http.post(`/act/ecos/thirdParty/cp2/queryOperator`, dealFormIds).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        const operators = res.data
        this.detailData.forEach(item => {
          const operator = operators[item.dealFormId] ? operators[item.dealFormId] : null
          const row = {
            id: item.id,
            tpcId: item.tpcId,
            dealFormId: item.dealFormId,
            dealerName: item.dealerName,
            dealerEmail: operator ? operator.operatorEmail : null,
            additionalEmail: operator ? operator.additionalEmail : null,
            salesEmail: operator ? operator.salesEmail : null,
            dmEmail: operator ? operator.dmEmail : null,
          }
          this.unlockData = [
            ...this.unlockData,
            row
          ]
        })
        this.isVisible = true;
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  handleOk = async() =>{
    const vaild = this.unlockDataVaild()
    if (vaild) {
      this.message.create("error", "请填写必填字段！")
      return
    }
    await this.sendNotice()
    this.isVisible = false;
  }

  sendNotice() {
    this.load = true;
    const params = [...this.unlockData]
    this.preLockApply().then((res) => {
      if(res.data){
        this.http.post(`/act/ecos/thirdParty/randomPick/detail/notify/${this.summaryId}`, params).subscribe((res => {
          this.load = false;
          if (res.code === '0000') {
            if (this.applyStatu === "UNLOCKED") {
              this.lockApply()
            } else {
              this.message.create("success", "操作成功!")
            }
          } else {
            this.message.create('error', `${res.msg}`);
          }
        }), (error => {
          this.load = false;
          this.message.create("error", "服务器异常")
        }));
      } else{
        this.load = false;
        this.message.create("error", res.msg)
      }
    })
  }
  preLockApply() {
    return this.http.post(`/act/ecos/thirdParty/randomPick/prelock/${this.summaryId}`).toPromise()
  }
  lockApply() {
    this.load = true;
    this.http.post(`/act/ecos/thirdParty/randomPick/lock/${this.summaryId}`).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        this.message.create("success", "操作成功!")
        this.queryDetails(this.summaryId)
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  handleCancel() {
    this.isVisible = false;
  }

  operate(data, act) {
    if(act === 'del') {
      this.resetReasonObj()
      this.reasonObj.id = data.id
      this.reasonObj.dealFormId = data.dealFormId
      this.actType = 'del'
      this.showRemove = true
    } else {
      this.load = true;
      this.unlockData = []
      this.http.get(`/act/ecos/thirdParty/cp2/queryOperator?dealFormId=${data.dealFormId}`).subscribe((res => {
        this.load = false;
        if (res.code === '0000') {
          const operator = res.data
          const row = {
            id: data.id,
            tpcId: data.tpcId,
            dealFormId: data.dealFormId,
            dealerName: data.dealerName,
            dealerEmail: operator ? operator.operatorEmail : null,
            additionalEmail: operator ? operator.additionalEmail : null,
            salesEmail: operator ? operator.salesEmail : null,
            dmEmail: operator ? operator.dmEmail : null,
          }
          this.unlockData = [
            ...this.unlockData,
            row
          ]
          this.isVisible = true;
        } else {
          this.message.create('error', `${res.msg}`);
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "服务器异常")
      }));
    }
  }

  closeRemove() {
    this.showRemove = false
  }

  handleConfirm() {
    const vaild = this.reasonObjVaild()
    if (vaild) {
      this.message.create("error", "请填写必填字段！")
      return
    }

    if (this.actType === 'add') {
      this.confirmSelect()
    } else if (this.actType === 'del') {
      this.remove()
    }
  }

  remove() {
    this.load = true;
    const files = this.reasonObj.attachments.map(file => ({
      fileId: file.fileId,
      name: file.name
    }));

    const jsonString = JSON.stringify(files)
    const params = {
      ...this.reasonObj,
      attachments: jsonString
    }

    this.http.post(`/act/ecos/thirdParty/randomPick/remove/${this.summaryId}`, params).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        this.message.create("success", "操作成功!")
        this.showRemove = false
        this.queryDetails(this.summaryId)
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  unlockDataVaild() {
    for (const item of this.unlockData) {
      if (!item.dealerEmail || !item.salesEmail || !item.dmEmail) {
        return true
      }
    }
    return false
  }

  resetReasonObj() {
    this.reasonObj = {
      id: null,
      dealFormId: null,
      reason: null,
      attachments: []
    }
  }

  reasonObjVaild() {
    if (!this.reasonObj.reason || !this.reasonObj.attachments || this.reasonObj.attachments.length == 0) {
      return true
    }
    return false
  }

  // 关联的COS Ref
  getFields(list, field) {
    if (!list || list.length == 0) {
      return ''
    }

    let str = null
    if (field == 'split') {
      return list.split(',').join(',<br>');
    } else if (field == 'ref') {
      str = Array.from(new Set(list.map(item => item.referenceId)))
      return str.join(',<br>');
    } else if (field == 'newDealer') {
      let arrs = list.map(item => item.dealerName).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.dealerName}`)))
      return str.join(',');
    } else if (field == 'oitTime') {
      let arrs = list.map(item => item.oitCompleteTime).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${moment(new Date(item.oitCompleteTime)).format("YYYY-MM-DD")}`)))
      return this.listSort(items).join(",");
    } else if (field == 'icfRe') {
      let arrs = list.map(item => item.icfRegistrationTime).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${moment(new Date(item.icfRegistrationTime)).format("YYYY-MM-DD")}`)))
      return this.listSort(items).join(",");
    } else if (field == 'oa') {
      let arrs = list.map(item => item.oa).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.oa}`)))
      return this.listSort(items).join(",<br>");
    } else if (field == 'so') {
      let arrs = list.map(item => item.so).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.so}`)))
      return this.listSort(items).join(",<br>");
    } else if (field == 'icf') {
      let arrs = list.map(item => item.icfSignTime).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${moment(new Date(item.icfSignTime)).format("YYYY-MM-DD")}`)))
      return this.listSort(items).join(",");;
    } else if (field == 'deadline') {
      let arrs = list.map(item => item.dealerProvideMaterialDeadline).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${moment(new Date(item.dealerProvideMaterialDeadline)).format("YYYY-MM-DD")}`)))
      return this.listSort(items).join(",<br>");
    } else if (field == 'over') {
      let arrs = list.map(item => item.isOverdue).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      let items = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.isOverdue ?'是' : '否'}`)))
      return this.listSort(items).join(",<br>");
    }
  }

  listSort(list) {
    return list.sort((a, b) => {
      const numA = parseInt((a as string).match(/\((\d+)\)/)![1]);
      const numB = parseInt((b as string).match(/\((\d+)\)/)![1]);
      return numA - numB;
    })
  }
  getJson(jsonString){
    if (!jsonString) {
      return []
    }
    const fileList = JSON.parse(jsonString)
    if (Array.isArray(fileList)) {
      return fileList
    }
    return []
  }
  getFileNames(jsonString) {
    if (!jsonString) {
      return ''
    }
    const fileList = JSON.parse(jsonString)
    if (Array.isArray(fileList)) {
      const nameString = fileList.map(file => file.name).join(', ')
      return nameString ? nameString : ''
    }
    return ''
  }

  // 获取referenceid的_后面数字
  matchesNo(str) {
    if (!str) return ''
    const regex = /_([0-9]+)/g;
    const matches = str.match(regex);
    let numbers = []
    if (matches) {
      numbers = matches.map(match => match.substring(1));
    }
    return numbers.length > 0 ? `(${numbers[0]})`:''
  }

  // 下载文件
  fileDown(fileId, name) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, name);
    });
  }

  exportFile() {
    this.load = true;
    this.http.postDownload(`/act/ecos/thirdParty/randomPick/detail/export/${this.summaryId}`).subscribe(
      (rest) => {
        this.fileService.downloadResponse(`ThirdParty-ValidReport-${moment(this.formValues.controls['startDay'].value.getTime()).format("YYYYMMDD")}-${moment(this.formValues.controls['endDay'].value.getTime()).format("YYYYMMDD")}`, rest);
        this.load = false;
      },
      (error) => {
        this.message.create("error", "请求错误");
        this.load = false;
      }
    );
  }

  saveComments(){
    this.load = true;
    this.http.post(`/act/ecos/thirdParty/randomPick/detail/remark/${this.summaryId}`,
      this.detailData?this.detailData:[]
    ).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        this.message.create("success", "操作成功!")
        this.queryDetails(this.summaryId)
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }
}
