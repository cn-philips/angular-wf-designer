import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { Router } from "@angular/router";
import { DictService, HttpService, ServesiceService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "schedule-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class ScheduleListComponent implements OnInit {
  @Input() tableData: [];
  @Input() total: 0;
  @Input() loading: any = false;

  @Output() refresh = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
  ) {}

  taskTypeList = [
    { code: 'email', label: '发送邮件' },
    { code: 'script', label: '执行脚本' },
  ];
  enabledList = [
      { code: true, label: '启用' },
      { code: false, label: '禁用' },
  ];
  frequencyList = [
      { code: 'month', label: '每月' },
      { code: 'week', label: '每周' },
      { code: 'day', label: '每天' },
      { code: 'once', label: '一次' },
  ];

  ngOnInit() {
  }

  //翻译任务类型
  TaskType(e: any) {
    for (let i = 0; i < this.taskTypeList.length; i++) {
      if (this.taskTypeList[i].code === e) {
        return this.taskTypeList[i].label;
      }
    }
    return e;
  }
  Frequency(e: any) {
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (this.frequencyList[i].code === e) {
        return this.frequencyList[i].label;
      }
    }
    return e;
  }

  //刷新数据
  refreshTable(){
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.refresh.emit('refresh');
  }

  //启用禁用
  editEnable(data: any){
    console.log(data);
    var isEnabled = !data.isEnabled;
    var taskNumber = data.taskNumber;
    this.loading = true;
    this.http.post(`/act/scheduler/${taskNumber}/${isEnabled}`).subscribe((res => {
        if (res.code === '0000') {
          this.loading = false;
          this.message.create('success', "修改成功");
        } else {
          this.loading = false;
          this.message.create('error', `${res.msg}`);
        }
        this.refreshTable();
      }), (error => {
        this.loading = false;
        this.message.create("error", "服务器异常")
      }));

  }

  //查看编辑
  edit(data: any){
    let url = "";
    url = "/system-setting/schedule-task";
    this.router.navigate([url], {
      queryParams: {
        taskNumber: data.taskNumber,
        flag: 1,
      },
    });
  }

}
