import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE, APPLY_TYPES, BG_LIST, DEFAULT_SUCCESS_MESSAGE, ERROR_MESSAGE} from '../special-approval.constants'
import { value } from 'numeral';

@Component({
  selector: 'special-approval-waiting-approve',
  templateUrl: './waiting-approve.component.html',
  styleUrls: ['./waiting-approve.component.scss']
})
export class WaitingApproveComponent implements OnInit {

  checkbox = false;

  allChecked = false;

  indeterminate = false;

  isVisible = false;

  isOkLoading = false;

  mapOfCheckedId: { [key: string]: boolean } = {};

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10,
  }

  formValues: FormGroup = this.fb.group({
    applyType: [null],
    orderBg: [null],
    keyword: [null],
    submitDate: [[]],
  })

  reassignParams: FormGroup = this.fb.group({
    role: [null], // 角色
    receiver: [null, [Validators.required]], //接收人
    transferReason: [null, [Validators.required]], // 备注
  })

  selectOptions = {
    applyTypes: APPLY_TYPES,
    bgList: BG_LIST,
    roleList: [],
    userList: [],
  };

  countData = {
    total: 0,
    pending: 0,
    approved: 0,
    reject: 0,
  }

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[]
  }

  constructor(
    protected spService: SpecialApprovalService,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.getTableData()
    var userRoleList = JSON.parse(window.localStorage.getItem("roles"));
    this.selectOptions.roleList = userRoleList.map( item => ({ label: item, value: item })); 
  }

  async getTableData(isResetPageNo = false) {
    try {
      this.tableData.loading = true
      if (isResetPageNo) { this.searchParams.pageNo = 1 }
      const params = { ...this.searchParams }
      const { applyType, orderBg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      orderBg && (params.orderBg = orderBg)
      const { rows, total } = await this.spService.getWaitingApproveList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我的待办列表失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ applyId, taskInstId }) {
    this.router.navigate(['/special-approval/request', applyId], {
      queryParams: { taskId: taskInstId }
    })
  }

  checkAll(value: boolean): void {
    this.tableData.list.forEach((item) => (this.mapOfCheckedId[item.applyCode] = value));
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.allChecked = this.tableData.list.every((item) => this.mapOfCheckedId[item.applyCode]);
    this.indeterminate = this.tableData.list.some((item) => this.mapOfCheckedId[item.applyCode]) && !this.allChecked;
  }

  showModal(): void {
    const checkedList = Object.keys(this.mapOfCheckedId);
    const selectedList=checkedList.filter(value => { return this.mapOfCheckedId[value] == true })
    if ( selectedList && selectedList.length > 0) {
      this.isVisible = true;
    } else {
      this.message.error('请选择任务');
    }
  }

  async handleOk() {
    const hasError = this.checkModalData();
    if (!hasError) {
      try {
        this.isOkLoading = true;
        const data =  this.getFormData();
        await this.spService.transferOrderRequest(data);
        this.message.success(DEFAULT_SUCCESS_MESSAGE);
        this.navigateToHomePage();
      } catch ({ message }) {
        this.message.error(ERROR_MESSAGE.SUBMIT);
        console.error(`操作失败, ${message}`);
      } finally {
        this.isVisible = false;
        this.isOkLoading = false;
      }
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // 获取角色
  async onRolesChange() {
    const role = this.reassignParams.get('role').value ? this.reassignParams.get('role').value : "";
    if (role === "") {
      this.message.error('请选择角色');
      return
    }  
    const userLists = await this.spService.getUserByRole(role);
    this.selectOptions.userList = userLists.map( ({email, name}) => ({ label: `${name}(${email})`, value: email }));  
  }

  checkModalData() {
    let hasError = false
    for (const i in this.reassignParams.controls) {
      this.reassignParams.controls[i].markAsDirty();
      this.reassignParams.controls[i].updateValueAndValidity();
    }
    hasError = this.reassignParams.invalid
    if (hasError) {
      this.message.error('请按要求填写表单信息');
    }
    return hasError;
  }

  //获取转单数据
  getFormData() {
    //获取选中的任务数据
    const checkedList = Object.keys(this.mapOfCheckedId);
    const selectedList=checkedList.filter(value => { return this.mapOfCheckedId[value] == true })
    let dataList = [];
    selectedList.forEach( value => {
      let list = this.tableData.list.filter((item) =>{ return item.applyCode === value }).map(({applyId, taskInstId, procInstId}) => ({applyId, taskInstId,procInstId}));
      if (list.length > 0) {
        dataList.push(list[0]); 
      }
    })

    //获取模态框数据
    const {role, receiver, transferReason} = this.reassignParams.getRawValue();
    dataList.forEach( item => {
      item.role = role;
      item.receiver = receiver;
      item.transferReason = transferReason;
    })
    return dataList;
  }

  public navigateToHomePage() {
    this.router.navigate(['/special-approval/home']);
  }

}
