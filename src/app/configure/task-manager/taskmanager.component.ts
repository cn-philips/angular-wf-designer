import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

class TaskInstanceManager {

  page: {
    pageNumber?: number;
    pageSize?: number;
    total?: number;
  } = {
    pageNumber: 1,
    pageSize: 10,
    total: 0
  };
  complete: boolean = false;
  loading: boolean = false;
  taskInstanceList: any[] = [];
  processList: any[] = [];
  selectedAssignee: any;
  selectUserList: any[] = [];
  selectAssigneeUserList: any[] = [];
  selectAssigneeList: any[] = [];
  selectedTask: any = {};
  searchForm: FormGroup;
  reassigneeShow: boolean = false;
  reassigneeTitle: string = undefined;
  controlNameList: string[] = [
    'taskName',
    'businessName',
    'sofonNumber',
    'businessNumber',
    'processName',
    'owner',
    'createTimeStart',
    'createTimeEnd',
    'finishedTimeStart',
    'finishedTimeEnd',
    'assignee'
  ];

  constructor(private http: HttpService,
              private msg: ToastrService,
              private fb: FormBuilder) {
    this.searchForm = this.fb.group({});
    for (let item of this.controlNameList) {
      this.searchForm.addControl(item, new FormControl());
    }
    this.http.get('/act' + '/model/listAction').subscribe(res => {
      if ('0000' == res.code) {
        this.processList = res.data;
      }
    });
    this.refreshTable(true);
  }

  changeSwitch = (complete: boolean) => {
    console.log(' ==> changeSwitch:', complete);
    this.complete = complete;
    this.refreshTable(true);
  };

  resendEmail = (selectedTask: any) => {
    this.http.post('/act/email/manualSendMail', {
      taskDefKey: selectedTask.taskDefinitionKey,
      processInstanceId: selectedTask.processInstanceId,
      eventType: 'task_created'
    }).subscribe(rest => {
      if (rest.code === '0000') {
        this.msg.success('发送完成！');
      } else {
        this.msg.error('发送失败！');
      }
    });
  };

  openReassigneeModal = (selectedTask: any) => {
    this.selectedTask = selectedTask;
    this.reassigneeShow = true;
    this.reassigneeTitle = `${selectedTask['businessNumber']}:${selectedTask['name']} 重新分配参与者`;
  };

  closeReassigneeModal = () => {
    this.reassigneeShow = false;
    this.selectedTask = undefined;
    this.reassigneeTitle = undefined;
  };

  onReset($event): void {
    if ($event) {
      $event.preventDefault();
    }
    this.searchForm.reset();
    this.selectUserList = [];
  };

  searchUser = (keyword) => {
    keyword && keyword.length >= 2 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
      if (rest.code === '0000') {
        console.log('==> searchUser:', rest.data);
        this.selectUserList = rest.data.map(item => {
          return {
            text: item.name,
            value: item,
          };
        });
      }
    });
  };

  searchAssigneeUser = (keyword) => {
    keyword && keyword.length >= 2 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
      if (rest.code === '0000') {
        console.log('==> searchAssigneeUser:', rest.data);
        this.selectAssigneeUserList = rest.data.map(item => {
          return {
            text: item.name,
            value: item,
          };
        });
      }
    });
  };

  searchAssignee = (keyword) => {
    keyword && keyword.length >= 2 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
      if (rest.code === '0000') {
        console.log('==> searchAssignee:', rest.data);
        this.selectAssigneeList = rest.data.map(item => {
          return {
            text: item.name,
            value: item,
          };
        });
      }
    });
  };

  resetTaskUser = () => {
    const taskId = this.selectedTask['id'];
    console.log(' ==> resetTaskUser:', this.selectedAssignee);
    taskId && this.selectedAssignee && this.selectedAssignee.code && this.http.get(`/act/task/reAssignee/${taskId}/${this.selectedAssignee.code}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.msg.success('指派成功！');
        this.refreshTable(false);
        this.reassigneeShow = false;
      } else {
        this.msg.error('指派失败<' + rest.msg + '>！');
      }
    }, error => {
      this.msg.error('指派失败！');
    });
    this.selectedAssignee = undefined;
    this.selectAssigneeList = [];
    this.selectedTask = undefined;
  };


  changeIndex = (pageIndex) => {
    this.page.pageNumber = pageIndex;
    this.refreshTable(false);
  };

  changeSize = (pageSize) => {
    this.page.pageNumber = 1;
    this.page.pageSize = pageSize;
    this.refreshTable(true);
  };

  onSearch($event): void {
    if ($event) {
      $event.preventDefault();
    }
    this.refreshTable(true);
  }

  refreshTable = (cleanpage: boolean) => {
    this.loading = true;
    const formData = this.searchForm ? this.searchForm.getRawValue() : {};
    console.log('==> refreshTable search form data:', formData);
    const {createTimeStart, createTimeEnd, finishedTimeStart, finishedTimeEnd, ...rest} = formData;
    const {owner, assignee, ...another} = rest;
    if (cleanpage) {
      this.page.pageNumber = 1;
    }
    let formValue = {
      ...this.page,
      ...another,
      pageNumber: this.page.pageNumber - 1,
      createTime: {
        start: createTimeStart,
        end: createTimeEnd
      },
      endTime: {
        start: finishedTimeStart,
        end: finishedTimeEnd
      }
    };
    if (owner && owner.value) {
      formValue['owner'] = owner.value.code;
    }
    if (assignee && assignee.value) {
      formValue['assignee'] = assignee.value.code;
    }
    if (this.complete) {
      formValue['complete'] = true;
    }
    this.http.post(`/act/task/list/true`, formValue).subscribe(res => {
      if (res.code == '0000') {
        const data = res.data;
        this.page.total = data.total;
        this.taskInstanceList = [...data.rows];
      }
      this.loading = false;
    });

  };
}

@Component({
  selector: 'task-manager',
  templateUrl: './taskmanager.component.html',
  styleUrls: ['./taskmanager.component.scss']
})
export class TaskmanagerComponent implements OnInit {

  taskInstanceManager: TaskInstanceManager = new TaskInstanceManager(this.http, this.msg, this.fb);
  candidateViewModalVisible: boolean = false;
  candidateList: any[] = [];

  constructor(private http: HttpService,
              private msg: ToastrService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  openCandidateViewModal(data) {
    this.candidateViewModalVisible = true;
    // console.log(data);
    //todo
    if(data['id']){
      this.candidateList = [];
      this.http.get('/act/task/getTaskIdByUserList/' + data['id']).subscribe(res => {
        if('0000' == res.code) {
          console.log(res);
          this.candidateList = [...res.data];
        }
      });

    }
  }

  handleCancel(): void {
    this.candidateViewModalVisible = false;
    this.candidateList = [];
  }


}
