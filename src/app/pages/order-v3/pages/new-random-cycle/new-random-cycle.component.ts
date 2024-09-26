import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder
} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd';
import * as moment from 'moment'
import { saveAs } from 'file-saver';
import { HttpService } from '@core/services';

@Component({
  selector: "new-random-cycle",
  templateUrl: "./new-random-cycle.component.html",
  styleUrls: ["./new-random-cycle.component.scss"],
})
export class NewRandomCycleComponent implements OnInit {
  constructor(
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
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
  randomPickTime = []
  actType = null // del-删除 add-手动新增
  applyStatu = "UNLOCKED"
  routeType = 'add' // add-新建 edit-编辑
  public summaryData: any[] = []; // 随机抽取该概要
  public removedData: any[] = []; // 机抽取结果（删除）
  public detailData: any[] = []; // 随机抽取结果
  public reasonObj = {
    id: null,
    dealFormId: null,
    reason: null,
    attachments: null
  }
  
  ngOnInit() {
    this.routeType = this.activatedRouter.queryParams['_value'].type;
    if (this.routeType === 'edit') {
      const id = this.activatedRouter.queryParams['_value'].id;
      this.summaryId = id
      this.queryDetails(id)
    }
  }

  randomSelect() {
    if (!this.randomPickTime || this.randomPickTime.length == 0) {
      this.message.create('error', `请先选择随机抽查周期数据时间范围！`);
      return
    }
    this.load = true
    const params = {
      startTime: this.randomPickTime[0],
      endTime: this.randomPickTime[1]
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
        const url = "/order-v3/editRandomCycle";
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

  queryDetails(id) {
    this.load = true
    this.http.get(`/act/ecos/thirdParty/randomPick/detail/${id}`).subscribe((res => {
      if (res.code === '0000') {
        const { status, summary, removed, detail} = res.data;
        if (!summary || !detail) {
          this.message.create('error', `没有数据！`);
          this.load = false;
          return
        }
        this.applyStatu = status
        this.summaryData = summary
        this.removedData = removed
        this.detailData = detail
        
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
    this.detailData.forEach(item => {
      const row = {
        id: item.id,
        tpcId: item.tpcId,
        dealFormId: item.dealFormId,
        dealerName: item.dealerName,
        dealerEmail: null,
        salesEmail: null,
        dmEmail: null,
      }
      this.unlockData = [
        ...this.unlockData,
        row
      ]
    })
    this.isVisible = true;
  }

  handleOk = async() =>{
    // const vaild = this.unlockDataVaild()
    // if (vaild) {
    //   this.message.create("error", "请填写必填字段！")
    //   return
    // }
    await this.sendNotice()
    this.isVisible = false;
  }

  sendNotice() {
    this.load = true;
    const params = [...this.unlockData]

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
      this.unlockData = []
      const row = {
        id: data.id,
        tpcId: data.tpcId,
        dealFormId: data.dealFormId,
        dealerName: data.dealerName,
        dealerEmail: null,
        salesEmail: null,
        dmEmail: null,
      }
      this.unlockData = [
        ...this.unlockData,
        row
      ]
      this.isVisible = true;
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
    if (field == 'ref') {
      str = Array.from(new Set(list.map(item => item.referenceId)))
      return str.join(', '); 
    } else if (field == 'newDealer') {
      let arrs = list.map(item => item.dealerName)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.dealerName}`)))
      return str.join(', '); 
    } else if (field == 'icfRe') {
      let arrs = list.map(item => item.icfRegistrationTime).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.icfRegistrationTime}`)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'icf') {
      let arrs = list.map(item => item.icfSignTime).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.icfSignTime}`)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'deadline') {
      let arrs = list.map(item => item.dealerProvideMaterialDeadline).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.dealerProvideMaterialDeadline}`)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'over') {
      let arrs = list.map(item => item.isOverdue).filter(v => v !== null && v !== undefined)
      if (arrs.length == 0) {
        return ''
      }
      str = Array.from(new Set(list.map(item => `${this.matchesNo(item.referenceId)}${item.isOverdue}`)))
      let arr = []
      str.forEach(v => {
        arr.push(v ? '是' : '否')
      })
      return arr.join(', '); 
    }
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
    const numbers = matches.map(match => match.substring(1));
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
}