import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '@core/services';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

class QueryParams {
  loading: boolean;
  total: number;
  pageNo: number;
  pageSize: number;
  queryForm: FormGroup;
}
@Component({
  selector: 'app-short-agency',
  templateUrl: './short-agency.component.html',
  styleUrls: ['./short-agency.component.scss']
})
export class ShortAgencyComponent implements OnInit {

  @Input() public dataBase: any = {}; // 父组件传来的值
  public agent = {
    id: '',
    agentNo: '',
    agentDescription: '',
    agentStartDate: '',
    agentEndDate: '',
    applicant: localStorage.ecom_ng_philips_code1,
    originalOwner: '',
    receiver: '',
    agentRole: '',
    createUser: '',
    updateUser: '',
    createTime: '',
    updateTime: '',
    status: 0,
    isDeleted: 0,
    startTime: '',
    endTime: '',
  };

  // nzLoading = false;
  // public pagination = {
  //   pageNo: 1,
  //   pageSize: 10,
  //   reload: false,
  // };
  //
  // changePageIndex (pageNo) {
  //   // console.log('pageNo', pageNo);
  //   this.pagination.pageNo = pageNo;
  //   this.nzLoading = true;
  //   this.setLoading.emit(this.nzLoading);
  //   this.updateTable.emit(this.pagination);
  // }
  // changePageSize (pageSize) {
  //   console.log('pageSize', pageSize);
  //   this.pagination.pageSize = pageSize;
  //   this.nzLoading = true;
  //   this.setLoading.emit(this.nzLoading);
  //   this.updateTable.emit(this.pagination);
  // }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
  ) {
    this.queryParams = {
      loading: false,
      total: 0,
      pageNo: 1,
      pageSize: 10,
      queryForm: this.fb.group({
        roleCode: [],
        roleName: [],
        describe: []
      }),
    };
  }
  queryParams: QueryParams;

  public paramsOnwer = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };

  public loadingOnwer = false;

  public changePageIndexOnwer(e) {
    this.paramsOnwer.pageNo = e;
    this.getAgentList();
  }
  public changePageSizeOnwer(e) {
    this.paramsOnwer.pageSize = e;
    this.getAgentList();
  }

  ngOnInit() {
    this.getroles();
    this.getAgentList();
  }

  public startTime: any;

  public ranges: any;

  onChange(result: Date): void {
    console.log('onChange: ', result);
    this.ranges = result;
  }


  isVisible = false;

  showModal(): void {
    this.getReceiver();
    this.isVisible = true;
  }

  handleOk(): void {
    this.sumit();
  }

  handleCancel(): void {
    this.agent = {
      id: '',
      agentNo: '',
      agentDescription: '',
      agentStartDate: '',
      agentEndDate: '',
      applicant: localStorage.ecom_ng_philips_code1,
      originalOwner: '',
      receiver: null,
      agentRole: '',
      createUser: '',
      updateUser: '',
      createTime: '',
      updateTime: '',
      status: 0,
      isDeleted: 0,
      startTime: '',
      endTime: '',
    };
    this.isVisible = false;
  }

  public agentLists = [];
  public currentRole = [];


  public getroles(): void {
    const re = new RegExp('(?<=\").*?(?=\")');
    const arrs = localStorage.getItem('roles').split(',');
    for (let i = 0; i < arrs.length; i++) {
      this.currentRole.push(arrs[i].match(re));
    }
    for (let i = 0; i < this.currentRole.length; i++) {
      if ('Sales Rep/Mgr' == this.currentRole[i]) {
        this.currentRole.splice(i, 1);
      }
    }
  }

  disabledDate = (current: Date): boolean => {
    if (this.agent.agentEndDate != '' && this.agent.agentEndDate != null && this.agent.agentEndDate != undefined) {
      return current >= new Date(this.agent.agentEndDate);
    }
    return false;
  };
  disabledDate1 = (current: Date): boolean => {
    // Can not select days before today and today
    if (this.agent.agentStartDate != '' && this.agent.agentStartDate != null && this.agent.agentStartDate != undefined) {
      return current <= new Date(this.agent.agentStartDate);
    }
    return false;
  };
  curdate = (date: Date): void => {
    date.setSeconds(0);
    date.setMinutes(0);

    if (this.agent.agentEndDate != null && this.agent.agentEndDate != undefined && this.agent.agentEndDate != '') {
      const std = new Date(this.agent.agentEndDate);
      if (std.getTime() <= date.getTime()) {
        date.setTime(std.getTime());
        date.setSeconds(0, 0);
        date.setMinutes(0);
        date.setDate(std.getDate() - 1);
      }
    }
  }

  curdate1 = (date: Date): void => {
    date.setSeconds(0, 0);
    date.setMinutes(0);

    if (this.agent.agentStartDate != null && this.agent.agentStartDate != undefined && this.agent.agentStartDate != '') {
      const std = new Date(this.agent.agentStartDate);
      if (std.getTime() >= date.getTime()) {
        date.setTime(std.getTime());
        date.setSeconds(0);
        date.setMinutes(0);
        date.setDate(std.getDate() + 1);
      }
    }
  }

  public receiverList = [];

  public getAgentList(): void {
    // if (this.ranges == null || this.ranges == undefined || this.ranges == ''){
    //   this.message.create('error', '请选择查询范围');
    //   return
    // }
    this.loadingOnwer = true;
    const url = '/act/ecom/homepage/getMyAgent';
    const arr: any = {
      startTime: '',

      endTime: ''
    };
    if (this.ranges != undefined && this.ranges != null) {
      arr.startTime = this.ranges[0];
      arr.endTime = this.ranges[1];
    }
    const par = Object.assign(this.paramsOnwer, arr);
    console.log(par);
    this.http.post(url, par).subscribe(res => {
      if (res && res.code === '0000') {
        if (res.data) {
          this.agentLists = res.data.rows;
          this.paramsOnwer.total = res.data.total;

        }
        this.loadingOnwer = false;
      }
    }, error => {
      this.loadingOnwer = false;
      this.message.create('error', '请求失败');
    });

  }
  isConfirmLoading = false;
  public sumit(): void {
    this.isConfirmLoading = true;
    if (this.currentRole.length > 1) {
      this.agent.agentRole = '';
      for (let i = 0; i < this.currentRole.length; i++) {
        if (i != this.currentRole.length - 1) {
          if (this.currentRole[i] != 'Sales Rep/Mgr') {
            this.agent.agentRole += this.currentRole[i] + ',';
          }
        } else {
          if (this.currentRole[i] != 'Sales Rep/Mgr') {
            this.agent.agentRole += this.currentRole[i];
          }
        }
      }
    } else {
      this.agent.agentRole = '';
      this.agent.agentRole += this.currentRole[0];
    }
    if (this.agent.agentDescription == null || this.agent.agentDescription == undefined || this.agent.agentDescription == '') {
      this.message.error('委托描述不能为空');
      this.isConfirmLoading = false;
      return;
    }
    if (this.agent.agentStartDate == null || this.agent.agentStartDate == undefined || this.agent.agentStartDate == '') {
      this.message.create('error', '日期不能为空');
      this.isConfirmLoading = false;
      return;
    }
    if (this.agent.agentEndDate == null || this.agent.agentEndDate == undefined || this.agent.agentEndDate == '') {
      this.message.create('error', '日期不能为空');
      this.isConfirmLoading = false;
      return;
    }
    if (this.agent.receiver == null || this.agent.receiver == undefined || this.agent.receiver == '') {
      this.message.create('error', '接收人不能为空');
      this.isConfirmLoading = false;
      return;
    }
    if (this.agent.receiver == this.agent.applicant) {
      this.message.create('error', '接收人不能与申请人相同');
      this.isConfirmLoading = false;
      return;
    }
    if (this.agent.receiver == this.agent.applicant) {
      this.message.create('error', '接收人不能与申请人相同');
      this.isConfirmLoading = false;
      return;
    }
    const stime = new Date(this.agent.agentStartDate);
    const etime = new Date(this.agent.agentEndDate);
    let flag = true;

    for (const val of this.agentLists) {
      const stime1 = new Date(val.agentStartDate);
      const etime1 = new Date(val.agentEndDate);
      if (val.isDeleted == 0 && this.delegate(this.agent.agentStartDate, this.agent.agentEndDate) != '已过期' && stime <= etime1 && etime >= stime1) {
        flag = false;
        this.message.error('存在已生效委托时间冲突');
        this.isConfirmLoading = false;
        return;
      }
    }
    const url = '/act/ecom/homepage/submitMyAgent';
    console.log(this.agent);
    this.http.post(url, this.agent).subscribe(res => {
      if (res && res.code === '0000') {
        this.message.create('success', res.msg);
      }
      this.getAgentList();
      this.handleCancel();
      this.isConfirmLoading = false;
    }, error => {
      this.message.create('error', '请求失败');
      this.isConfirmLoading = false;
    });

  }

  public getReceiver(): void {
    // const url = '/act/ecom/homepage/getMyAgentReceiver?role=OA';
    const url = '/act/ecom/homepage/getMyAgentReceiver';
    this.http.get(url).subscribe(res => {
      if (res.data != undefined && res.data != null && res.data != '') {
        this.receiverList = res.data;
      }
    }, error => {
      this.message.create('error', '请求失败');
    });
  }

  public finddata = {
    id: '',
    agentNo: '',
    agentDescription: '',
    agentStartDate: '',
    agentEndDate: '',
    applicant: '',
    originalOwner: '',
    receiver: '',
    agentRole: '',
    createUser: '',
    updateUser: '',
    createTime: '',
    updateTime: '',
    status: 0,
    isDeleted: 0,
    startTime: '',
    endTime: '',
  };

  public findcurrent = false;

  public findcurrentRoles = [];

  findOk(): void {
    this.findcurrent = false;
  }

  findCancel(): void {
    this.findcurrent = false;
  }
  public role = localStorage.ecom_ng_philips_code1;

  // public find(id): void{
  //   const url = '/act/ecom/homepage/getMyAgentById?id=' + id;
  //   this.http.get(url).subscribe(res => {
  //     this.finddata = res.data;
  //     this.findcurrentRoles = this.finddata.agentRole.split(',');
  //     console.log(res.data);
  //     console.log(this.finddata);
  //   });
  //   this.findcurrent = true;
  // }
  public finds(index): void {
    this.finddata = this.agentLists[index];
    if (this.finddata.agentRole != null && this.finddata.agentRole != undefined && this.finddata.agentRole != '') {
      this.findcurrentRoles = this.finddata.agentRole.split(',');
    }
    this.findcurrent = true;
  }

  public cancle(id): void {
    const url = '/act/ecom/homepage/cancelMyAgentById?id=' + id;
    this.http.get(url).subscribe(res => {
      if (res.msg == '取消成功') {
        this.message.create('success', res.msg);
      }
      this.getAgentList();
    }, error => {

    });
  }

  public delegate(stds: string, eds: string): String {
    const cd = new Date();
    const std = new Date(stds);
    const ed = new Date(eds);
    if (cd.getTime() < std.getTime()) {
      return '未开始';
    } else if (cd.getTime() > std.getTime() && cd.getTime() < ed.getTime()) {
      return '生效';
    } else {
      return '已过期';
    }
  }


}
