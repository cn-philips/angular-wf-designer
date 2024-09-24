import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment'
import { HttpService } from '@core/services';
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { forEach } from "@angular/router/src/utils/collection";
@Component({
  selector: "new-random-cycle",
  templateUrl: "./new-random-cycle.component.html",
  styleUrls: ["./new-random-cycle.component.scss"],
})
export class NewRandomCycleComponent implements OnInit {
  constructor(private serveice: OrderV3Service,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private modalService: NzModalService,
    private http: HttpService,
    private routerExtend: RouterExtendService,
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
  applyStatu = "UNLOCKED"
  routeType = 'add' // add-新建 edit-编辑
  public summaryData: any[] = []; // 随机抽取该概要
  public removedData: any[] = []; // 机抽取结果（删除）
  public detailData: any[] = []; // 随机抽取结果
  public removeObj = {
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
        console.log("data", res.data);
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

  async onDealFormSelect(val) {
    console.log("s",val);
    this.load = true;
    const params = {dealFormId: val.dealFormId}

    this.http.post(`/act/ecos/thirdParty//randomPick/add/${this.summaryId}`, params).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
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
      this.removeObj.id = data.id
      this.removeObj.dealFormId = data.dealFormId
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

  remove() {
    this.load = true;
    const params = {
      ...this.removeObj
    }

    this.http.post(`/act/ecos/thirdParty/randomPick/remove/${this.summaryId}`, params).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
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

  // 关联的COS Ref
  getFields(list, field) {
    if (!list || list.length == 0) {
      return '-'
    }

    let str = null
    if (field == 'ref') {
      str = Array.from(new Set(list.map(item => item.referenceId)))
      return str.join(', '); 
    } else if (field == 'newDealer') {
      str = Array.from(new Set(list.map(item => item.dealerName)))
      return str.join(', '); 
    } else if (field == 'icfRe') {
      str = Array.from(new Set(list.map(item => item.icfRegistrationTime)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'icf') {
      str = Array.from(new Set(list.map(item => item.icfSignTime)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'deadline') {
      str = Array.from(new Set(list.map(item => item.dealerProvideMaterialDeadline)))
      let arr = []
      str.forEach(v => {
        arr.push(moment(new Date(v)).format('yyyy-MM-dd'))
      })
      return arr.join(', '); 
    } else if (field == 'over') {
      str = Array.from(new Set(list.map(item => item.isOverdue)))
      let arr = []
      str.forEach(v => {
        arr.push(v ? '是' : '否')
      })
      return arr.join(', '); 
    }
    
  }

}