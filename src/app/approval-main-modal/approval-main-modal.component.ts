import {Component, OnInit, ViewChild} from '@angular/core';
import {PlatformLocation} from '@angular/common';
import {FileService, GlobalService, HttpService, RegexService} from '../services';
import {ApprovalMainCommentsComponent} from '../approval-main-comments/approval-main-comments.component';
import {ContractExportModalComponent} from '../my-task/contract-export-modal/contract-export-modal.component';
import {ApprovalMainFormComponent} from '../approval-main-form/approval-main-form.component';
import {ModalDismissReasons, NgbActiveModal, NgbModal, NgbModalRef, NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {saveAs} from 'file-saver';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map, switchMap, filter} from 'rxjs/operators';

@Component({
  selector: 'approval-main-modal',
  templateUrl: './approval-main-modal.component.html',
  styleUrls: ['./approval-main-modal.component.scss']
})
export class ApprovalMainModalComponent implements OnInit {
  @ViewChild('defaultModal') content: any;
  processDefinitionKey: string;
  processDefinitionName: string;
  mainModalTitle: string = '';
  draftId: string = undefined;
  businessName: string;
  pageType: string;
  draftFormId: string;
  activitiTask: object;
  isProcessing: boolean = false;
  formInitData: Object = undefined;
  formFrom: string;
  savedFormModel: Object = {};
  ownerCode: string;
  draftData: Object = {};
  isComment: boolean;
  commentsTitle: string = '审批意见';
  isCompleted: boolean = false;
  enableContractExport: boolean = false;
  formTitle: string = '申请表';
  passTaskBtn: string = '完成';
  mustRemark: boolean = false;
  //驳回到SALES的taskID
  rejectedToSalesTaskArr = ['sid-CCDD3E5F-BED0-43CD-8EED-EAA6C11F1E45', 'sid-E58541D9-F5E8-4190-9D3E-040B582A58F4', 'sid-0B61B920-F60A-4969-A292-AFE79168208F'];
  processInstanceId: string;
  paramsToPass: Object = {};
  disabled: boolean = false;
  taskSimpleRouterMap: Object = {};
  baseBackUrl = (this.platformLocation as any).location.origin + '/act';
  disablePopover: boolean = true;
  popoverMessage: string = '确认完成？';
  hasSavedDraft: boolean = false;
  distributorName;
  taskId: string;
  //自定义email相关 start
  selectedUser: any;
  searchChange$ = new BehaviorSubject('');
  userList: any[] = [];


  // draft: DraftData;
  // taskInfo: TaskInfo;
  // taskForm: TaskForm;
  inputCc: string = '';
  @ViewChild(ApprovalMainCommentsComponent)
  private commentsComponent: ApprovalMainCommentsComponent;
  @ViewChild(ApprovalMainFormComponent)
  private formComponent: ApprovalMainFormComponent;
  @ViewChild('mainTableSet')
  private mainTableSet: NgbTabset;

  //自定义email相关 end

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private fileService: FileService,
    private globalService: GlobalService,
    private platformLocation: PlatformLocation,
    private regexService: RegexService
  ) {

  }


  ngOnInit() {
    this.ownerCode = undefined;
    this.paramsToPass['processInstanceId'] = this.processInstanceId;
    switch (this.pageType) {
      case 'new':
        this.mainModalTitle = '新建审批';
        this.processDefinitionKey && this.getMainForm();
        this.ownerCode = localStorage.getItem('ng_philips_code1');
        break;
      case 'mytask':
        this.getTaskPage();
        break;
      case 'draft':
        this.mainModalTitle = '继续编辑';
        this.getDraftForm();
        break;
      case 'finishedProcess':
        this.mainModalTitle = '我的申请单';
        this.getFinishedProcess();
        break;
      case 'OAFile':
        this.mainModalTitle = 'WBS归档';
        this.getOAWbsProcess();
        const getUserList = (keyword: string) => this.http.get(`/act/queryUserByKeyword/${keyword}`).pipe(map((res: any) => res.data));

        const userList$: Observable<string[]> = this.searchChange$
          .asObservable()
          .pipe(debounceTime(500), filter(term => term && term.length > 1))
          .pipe(switchMap(getUserList));

        userList$.subscribe(data => {
          this.userList = data.map(item => {
            return {
              text: item['email'] + ' (' + item['name'] + ')',
              value: item
            };
          });
        });
        break;
    }
  }

  getFormTitle(tblUiList) {
    if (tblUiList) {
      for (let item of tblUiList) {
        if (item['type'] === 'quotationhidden' && item['name'] === 'formtitle') {
          this.formTitle = item['display'] ? item['display'] : '申请表';
          break;
        }
      }
    }
  }

  getPassTaskBtn(tblUiList) {
    let res: string = '完成';
    if (tblUiList) {
      for (let item of tblUiList) {
        if (item['type'] === 'quotationhidden' && item['name'] === 'passtaskbtn') {
          // this.passTaskBtn = item['display'] ? item['display'] : '完成';
          res = item['display'] ? item['display'] : '完成';
          break;
        }
      }
    }
    this.globalService.mainBtnStrChange(res);
  }


  getOAWbsProcess() {
    const uri = `/act/task/genericFinishedProcessMainForm/${this.processInstanceId}/wbs`;
    this.http.get(uri).subscribe(res => {
      console.log('getOAWbsProcess, res => ', res);
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        this.formFrom = 'OAWbsProcess';
        this.disabled = true;
        let _formInitData = data['taskFormComponentList'] ? data['taskFormComponentList']['taskForm'] : undefined;
        if (_formInitData.tblUiList && _formInitData.tblUiList.length > 0) {
          let uiList = _formInitData.tblUiList;
          for (let index in uiList) {
            let ui = uiList[index];
            if (ui.name == 'sonumber') {
              ui.readonly = false;
            }
          }
        }
        this.formInitData = _formInitData;
        const draftDataTmp = data['taskFormComponentList']['globalVariables']['draftData'];
        // console.log(draftDataTmp);

        if (typeof (draftDataTmp) === 'object') {
          this.draftData = draftDataTmp;
        } else {
          this.draftData = JSON.parse(draftDataTmp);
        }
        this.savedFormModel = this.draftData['formData'];
        if (data['taskFormComponentList'] && data['taskFormComponentList']['globalVariables']) {
          this.ownerCode = data['taskFormComponentList']['globalVariables']['owner'];
          this.inputCc = data['taskFormComponentList']['globalVariables']['wbsExtendEmailList'] || '';
        }
      }
    });
  }


  getFinishedProcess() {
    const uri = `/act/task/genericFinishedProcessMainForm/${this.processInstanceId}/finished`;
    this.http.get(uri).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        console.log('getFinishedProcess', data);
        this.formFrom = 'finishedProcess';
        this.disabled = true;
        this.formInitData = data['taskFormComponentList'] ? data['taskFormComponentList']['taskForm'] : undefined;
        const draftDataTmp = data['taskFormComponentList']['globalVariables']['draftData'];
        // console.log(draftDataTmp);

        //processInstanceId
        localStorage.setItem('processInstanceId', this.processInstanceId);
        if (typeof (draftDataTmp) === 'object') {
          this.draftData = draftDataTmp;
        } else {
          this.draftData = JSON.parse(draftDataTmp);
        }
        this.savedFormModel = this.draftData['formData'];
        if (data['taskFormComponentList'] && data['taskFormComponentList']['globalVariables']) {
          this.ownerCode = data['taskFormComponentList']['globalVariables']['owner'];
        }
      }
    });
  }


  getMainForm() {
    const uri = '/act/task/genericProcessMainForm/' + this.processDefinitionKey;
    this.http.get(uri).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        this.draftFormId = data['id'];
        this.formInitData = res.data ? res.data : undefined;
        this.formFrom = 'new';
        // console.log(res.data);
        if (res['data'] && res['data']['tblUiList']) {
          this.getFormTitle(res['data']['tblUiList']);
        }
      }
    });
  }

  getDraftForm() {
    const uri = '/act/draft/' + this.draftId;
    this.http.get(uri).subscribe(res => {
      if ('0000' == res.code) {
        this.formFrom = 'draft';
        console.log(res.data);

        const data = res.data == null ? [] : res.data;
        this.ownerCode = data['owner'];
        this.draftFormId = data['formId'];
        this.formInitData = res.data['tblForm'] ? res.data['tblForm'] : undefined;
        this.savedFormModel = res.data['formData'];
        if (this.formInitData && this.formInitData['tblUiList']) {
          this.getFormTitle(this.formInitData['tblUiList']);
        }
      }
    });
  }

  getTaskPage() {
    // main btn str sub
    this.globalService.mainBtnStr.subscribe(str => {
      if (str) {
        this.passTaskBtn = str;
      }
    });
    const uri = '/act/task/genericTaskPage';
    const params = this.activitiTask;

    // @ts-ignore
    const {name, processDefinitionName} = this.activitiTask;
    console.log('getTaskPage', this.activitiTask);
    // this.mainModalTitle = '待办任务 (' + name + ')';
    this.http.post(uri, params).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        console.log('getTaskPage2', data);

        if (!res.data) {
          return;
        }
        const isTaskFinished = data['taskFormComponentList']['isComplete'] == true ? true : false;
        const taskName = isTaskFinished ? ('已办任务 (' + name + ')') : ('待办任务 (' + name + ')');
        this.mainModalTitle = taskName;
        this.processDefinitionName = processDefinitionName;
        this.formFrom = 'task';
        this.draftFormId = data['id'];
        // this.isCompleted = data.activitiTask.completed;
        this.isCompleted = isTaskFinished;
        this.taskSimpleRouterMap = data['taskSimpleRouterMap'];
        this.processInstanceId = data['activitiTask']['processInstanceId'];
        this.commentsComponent.inputComment = data.activitiTask.comment;
        this.commentsComponent.inputCc = data.taskFormComponentList.localVariables.extendsCCList;
        this.commentsComponent.selectRouterValue = data.taskFormComponentList.localVariables.result;
        if (data['taskFormComponentList'] && data['taskFormComponentList']['taskForm'] && data['taskFormComponentList']['taskForm']['tblUiList']) {
          this.getFormTitle(data['taskFormComponentList']['taskForm']['tblUiList']);
        }
        if (data['taskFormComponentList'] && data['taskFormComponentList']['globalVariables']) {
          this.ownerCode = data['taskFormComponentList']['globalVariables']['owner'];
        }

        //processInstanceId
        localStorage.setItem('processInstanceId', this.processInstanceId);

        //是否显示导出模板按钮
        //如何表示OA权限，need check with backend todo
        if (data.activitiTask.completed == true) {
          if (data.activitiTask.processDefinitionId && data.activitiTask.processDefinitionId.indexOf('CommericalPriceApproval_WF') != -1) {
            //TODO
            this.enableContractExport = true;
          }
        }

        //是否禁用
        this.formInitData = res.data['taskFormComponentList'] ? res.data['taskFormComponentList']['taskForm'] : undefined;
        if (this.formInitData && this.formInitData['tblUiList']) {
          this.getPassTaskBtn(this.formInitData['tblUiList']);
        }
        this.isComment = !!this.taskSimpleRouterMap;
        this.commentsTitle = this.isComment ? '审批意见' : '备注';

        //taskId
        this.taskId = this.formInitData['taskId'];

        //备注是否必填（驳回到SALES的task）
        if (this.formInitData['taskId'] && this.rejectedToSalesTaskArr.indexOf(this.formInitData['taskId']) > -1) {
          this.mustRemark = true;
        }

        const draftDataTmp = res.data['taskFormComponentList']['globalVariables']['draftData'];
        let draftDataJson;
        if (typeof (draftDataTmp) === 'object') {
          draftDataJson = draftDataTmp;
        } else {
          draftDataJson = JSON.parse(draftDataTmp);
        }
        this.draftData = draftDataJson;
        if (res.data['taskFormComponentList'] && res.data['taskFormComponentList']['globalVariables']) {
          this.ownerCode = res.data['taskFormComponentList']['globalVariables']['owner'];
        }
        this.savedFormModel = draftDataJson['formData'];
      }
    });
  }

  async validateSpecial() {
    let result = false;
    if (this.processInstanceId) {
      let res = await this.http.get('/act/task/getCurrentTaskInfo/' + this.processInstanceId).toPromise();
      console.log(res);
      if (res.code == '0000' && ('sid-24760591-E676-453A-9DC1-610C255E5068' == res.data || 'sid-E58541D9-F5E8-4190-9D3E-040B582A58F4' == res.data)) {
        result = true;
      }
    }
    return result;
  }

  async startProcess() {

    this.isProcessing = true;
    if (!this.validateMyForm()) {
      this.isProcessing = false;
      return;
    }

    let form = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
    if (!this.preValidateCommercial(form)) {
      this.toastrService.warning('表单未填写完整');
      this.isProcessing = false;
      return;
    }

    //非空校验
    if ('selectordertype' in form) { //通用订单流程
      this.globalService.theValidator = '0';
      this.validateSimpleCommercial();

      let isFormValid = this.globalService.theValidator;
      setTimeout(() => {
        isFormValid = this.globalService.theValidator;
      }, 200);

      if (isFormValid == '0') {
        this.toastrService.warning('表单未填写完整');
        this.isProcessing = false;
        return;
      }

      if ('1' === isFormValid) {
        this.validateAcceptTerm();

        isFormValid = this.globalService.theValidator;
        setTimeout(() => {
          isFormValid = this.globalService.theValidator;
        }, 100);

        if (isFormValid == '0') {
          this.toastrService.warning('未勾选承诺项');
          this.isProcessing = false;
          return;
        }
      }

      if ('1' === isFormValid) {

        this.validateRdd();
        isFormValid = this.globalService.theValidator;
        setTimeout(() => {
          isFormValid = this.globalService.theValidator;
        }, 100);


        if (isFormValid == '0') {
          this.toastrService.warning('请检查要求到货日期');
          this.isProcessing = false;
          return;
        }
      }

      // console.log('result',isFormValid); // for dev
      // this.isProcessing = false; // for dev
      // return; // for dev
    } else { ///特价订单流程
      // no need below lines for start process
      this.globalService.theValidator = '0';
      this.validateSimpleSpecial();

      let isFormValid = this.globalService.theValidator;
      setTimeout(() => {
        isFormValid = this.globalService.theValidator;
      }, 200);

      if (isFormValid == '0') {
        this.toastrService.warning('表单未填写完整');
        this.isProcessing = false;
        return;
      }

    }


    // this.isProcessing = false; //fo dev
    // return; //for dev


    //TODO moded by bo.zhou, to be modified

    // let form = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
    // if (form['selectordertype']) {
    //   let sotObj = JSON.parse(form['selectordertype']);
    //     if(sotObj['orderType']&&(sotObj['orderType']==='0'||sotObj['orderType']==='1')){
    //       let validateResult = await this.validateSimple1();
    //       if (validateResult ==='0') {
    //           this.isProcessing = false;
    //           this.toastrService.error('表单未填写完整');
    //           return;
    //         }
    //     } else if ('selectordertype' in form) {
    //       this.isProcessing = false;
    //       this.toastrService.error('表单未填写完整');
    //       return
    //     } else {
    //       let validateResult = await this.validateSimple0();
    //       if (validateResult==='0') {
    //         this.isProcessing = false;
    //         this.toastrService.error('表单未填写完整');
    //       }
    //     }
    // }
    // this.isProcessing = false;
    // return;
    const uri = '/act/task/startProcess';
    const code1 = localStorage.getItem('ng_philips_code1');
    let formObj = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
    let serializedForm = JSON.stringify(formObj);
    let draft = {
      owner: code1,
      name: this.businessName,
      formId: this.draftFormId,
      formData: serializedForm
    };
    if (this.draftId) {
      draft['id'] = this.draftId;
    }

    const params = {
      userId: code1,
      businessName: this.businessName,
      draft: draft
    };

    // console.log(formObj);
    if (formObj['selectordertype']) {
      let sotObj = JSON.parse(formObj['selectordertype']);
      if (sotObj['orderType']) {
        let ordertype = sotObj['orderType'] == '0' ? '1' : '2';
        let result = await this.backendValidation(params, ordertype);
        // let result = true;
        // console.log(result);
        if (!result) {
          // if(false) {
          this.isProcessing = false;
          return;
        }
      }
    }

    //dev start
    console.log('startProcess', params);
    // return;
    //dev end
    this.isProcessing = false;

    this.http.post(uri, params).subscribe(res => {
      console.log(res);
      if ('0000' == res.code) {
        this.toastrService.success('申请发起成功');
        this.isProcessing = false;
        this.closeModal('startProcess');
      } else {
        this.isProcessing = false;
        this.toastrService.warning(res.msg);
      }
    });
  }

  async backendValidation(params, type) {
    let result = false;
    //TODO true
    if (true) {
      // console.log(params);
      const uri = '/act/task/inputValidation/' + type;
      let res = await this.http.post(uri, params).toPromise().then(res => {
          if (res.data == null) {
            result = true;
            // this.toastrService.success('...');
          } else if (res.data != null) {
            this.toastrService.error('提交的表单中存在错误，请检查 error.txt');
            // const errorInfoFileUrl = this.baseBackUrl + res.data;
            let arr = this.fileService.base64ToArrayBuffer(res.data);
            let blob = new Blob([arr]);
            saveAs(blob, 'error.txt');
          }
        }
      );
    }
    return result;
  }

  saveTask(option?: string) {
    this.isProcessing = true;
    const formObj = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
    if (this.activitiTask['id']) {
      console.log(this.activitiTask['id']);
      const uri = '/act/task/draftTask/' + this.activitiTask['id'];
      const originalFormData = JSON.parse(this.draftData['formData']);
      const formData = {
        ...originalFormData,
        ...formObj
      };
      const params = {
        formHandelList: this.formInitData ? this.formInitData['formHandles'] : null,
        taskInput_result: this.commentsComponent.selectRouterValue,
        taskInput_comment: this.commentsComponent.inputComment,
        //save ccList
        ccList: this.commentsComponent.inputCc,
        draftData: {
          ...this.draftData,
          formData: JSON.stringify(formData)
        }
      };
      this.http.post(uri, params).subscribe(res => {
        if ('0000' == res.code) {
          const data = res.data == null ? [] : res.data;
          this.draftFormId = data['id'];
          if (option != 'silent') {
            this.toastrService.success('保存成功');
          }
          this.isProcessing = false;
        } else {
          if (option != 'silent') {
            this.toastrService.error(res.msg);
          }
          this.isProcessing = false;
        }
      });
    }
  }


  async passTask() {

    this.isProcessing = true;
    const formObj = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};

    let isReject: boolean = false;
    if (this.taskSimpleRouterMap) {
      if (this.commentsComponent.selectRouterText && this.commentsComponent.selectRouterText.indexOf('驳回') > -1) {
        isReject = true;
      }
    }

    //非空校验
    if (!isReject) { //如果审批时的操作选择驳回时，就不需要做页面非空校验了
      if ('selectordertype' in formObj) { //通用订单流程
        this.globalService.theValidator = '0';
        this.validateSimpleCommercial();

        let isFormValid = this.globalService.theValidator;
        setTimeout(() => {
          isFormValid = this.globalService.theValidator;
        }, 200);

        if ('1' === isFormValid) {
          this.validateAcceptTerm();

          isFormValid = this.globalService.theValidator;
          setTimeout(() => {
            isFormValid = this.globalService.theValidator;
          }, 100);
        }

        if (isFormValid == '0') {
          this.toastrService.warning('表单未填写完整');
          this.isProcessing = false;
          return;
        }
        // console.log('valid result', isFormValid); // for dev
      } else { // 特价订单流程
        this.globalService.theValidator = '0';
        this.validateSimpleSpecial();

        let isFormValid = this.globalService.theValidator;
        setTimeout(() => {
          isFormValid = this.globalService.theValidator;
        }, 200);

        if ('1' === isFormValid) {
          this.validateAcceptTerm();

          isFormValid = this.globalService.theValidator;
          setTimeout(() => {
            isFormValid = this.globalService.theValidator;
          }, 100);
        }

        if (isFormValid == '0') {
          this.toastrService.warning('表单未填写完整');
          this.isProcessing = false;
          return;
        }
      }
    }

    // this.isProcessing = false; //for dev
    // console.log('pass validation'); //for dev
    // return; //for dev
    if (this.taskSimpleRouterMap) {
      if (!this.commentsComponent.selectRouterValue) {
        this.toastrService.error('操作未选择！');
        this.mainTableSet.select('comments-tab');
        this.isProcessing = false;
        return;
      }
      if (!this.commentsComponent.inputComment) {
        this.toastrService.error('审批意见未填写！');
        this.mainTableSet.select('comments-tab');
        this.isProcessing = false;
        return;
      }

      //处理抄送cc email list拼写规范
      if (this.commentsComponent.inputCc && '' !== this.commentsComponent.inputCc.trim()) {
        this.commentsComponent.inputCc = this.regexService.cleanEmailListString(this.commentsComponent.inputCc);
      }
    }

    // this.isProcessing = false; //for dev
    // return; // for dev

    if (this.formInitData['taskId'] && this.rejectedToSalesTaskArr.indexOf(this.formInitData['taskId']) > -1) {
      if (!this.commentsComponent.inputComment) {
        this.toastrService.error('备注未填写！');
        this.mainTableSet.select('comments-tab');
        this.isProcessing = false;
        return;
      }
    }

    if (this.activitiTask['id']) {
      // console.log(this.activitiTask['id']);
      const uri = '/act/task/completeTask/' + this.activitiTask['id'];
      const originalFormData = JSON.parse(this.draftData['formData']);
      const formData = {
        ...originalFormData,
        ...formObj
      };

      let ccListParam = undefined;
      if (this.commentsComponent.inputCc && '' != this.commentsComponent.inputCc.trim()) {
        ccListParam = this.commentsComponent.inputCc;
      }

      const params = {
        formHandelList: this.formInitData ? this.formInitData['formHandles'] : null,
        taskInput_result: this.commentsComponent.selectRouterValue,
        //set ccList todo
        ccList: ccListParam,
        taskInput_comment: this.commentsComponent.inputComment,
        draftData: {
          ...this.draftData,
          formData: JSON.stringify(formData)
        }
      };


      console.log('passTask', params); // for test
      // return;
      //check if sales finished beian and submit new special task
      if (!isReject) { //如果审批操作选择驳回，那么不做后台有效性校验
        let flag = await this.validateSpecial();
        if (flag) {
          let result = await this.backendValidation(params, '0');
          if (!result) {
            this.isProcessing = false;
            return;
          }
        }
      }

      //submit form data
      this.http.post(uri, params).subscribe(res => {
        if ('0000' == res.code) {
          const data = res.data == null ? [] : res.data;
          this.draftFormId = data['id'];
          this.toastrService.success('操作成功');
          this.isProcessing = false;
          this.closeModal('passTask');
        } else {
          this.toastrService.error(res.msg);
          this.isProcessing = false;
        }
      });
    }
  }

  closeModal(reason) {
    if ('click cancel button' == reason && this.hasSavedDraft) {
      reason = 'savedAndCancel';
    }
    this.activeModal.close(reason);
  }

  saveDraft(type) {
    console.log(type);
    if ('new' == type || 'draft' == type) {
      console.log(this.formComponent.form);
      // console.log(this.formComponent);
      let formObj = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
      let serializedForm = JSON.stringify(formObj);
      const owner = localStorage.getItem('ng_philips_code1');
      let params = {};
      params['owner'] = owner;
      if (this.businessName) {
        params['name'] = this.businessName + '草稿';
      }
      params['formData'] = serializedForm;
      params['formId'] = this.draftFormId;
      if (this.draftId) {
        params['id'] = this.draftId;
      }

      this.isProcessing = true;

      //dev start
      console.log('saveDraft', params);
      // return;
      //dev end

      // return;

      this.http.post('/act/draft/save', params).subscribe(res => {
        console.log('save draft...');
        console.log(res);
        if ('0000' == res.code) {
          // cb(JSON.stringify(data));
          this.draftId = res.data;
          console.log('saved draft id:', res.data);
          this.toastrService.success('保存草稿成功');
          this.hasSavedDraft = true;
          // this.closeModal('saveDraft')
        }
        this.isProcessing = false;
      });
    }
  }

  saveWBS = () => {
    this.isProcessing = true;
    const _processInstanceId = this.processInstanceId;
    const formObj = this.formComponent ? this.formComponent.form ? this.formComponent.form.getRawValue() : {} : {};
    if (_processInstanceId) {
      const originalFormData = JSON.parse(this.draftData['formData']);
      const formData = {
        ...originalFormData,
        ...formObj
      };
      let params = {
        draftData: {
          ...this.draftData,
          formData: JSON.stringify(formData)
        },
        //自定义email
        emailList: ''
      };

      if (this.inputCc && '' !== this.inputCc.trim()) {
        this.inputCc = this.regexService.cleanEmailListString(this.inputCc);
      }
      params['emailList'] = this.inputCc;

      this.http.post(`/act/oabws/save/${_processInstanceId}`, params).subscribe(res => {
        if ('0000' == res.code) {
          this.toastrService.success('保存成功');
          this.isProcessing = false;
          this.closeModal('saveWBS');
        } else {
          this.toastrService.error(res.msg);
          this.isProcessing = false;
        }
      });
    }
  };


  public validateMyForm() {
    let result = this.formComponent.triggerValidate();
    if (!result) {
      this.toastrService.warning('请检查表单是否按要求填写！');
    }
    return result;
  }

  //打开合同模板下载modal
  openContractModal() {
    let pId = this.processInstanceId;

    if (true) {
      const modal: NgbModalRef = this.modalService.open(ContractExportModalComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
      (<ContractExportModalComponent>modal.componentInstance).processInstanceId = pId;

      modal.result.then((result) => {
        if ('simple' == result) {
          console.log('modal simply closed');
        }
      }, (reason) => {
        console.log(`Dismissed ${this.getDismissReason(reason)}`);
      });
    } else {
      this.toastrService.warning('');
      return;

    }
  }

  // 通用
  async validateSimpleCommercial() {
    let validateCommercial = document.getElementById('validateCommercial') as HTMLElement;
    if (validateCommercial) {
      await validateCommercial.click();
    } else {
      this.globalService.theValidator = '1';
    }
    // return localStorage.getItem('validateStatus');
  }

  // 特价
  async validateSimpleSpecial() {
    let validateSpecial = document.getElementById('validateSpecial') as HTMLElement;
    if (validateSpecial) {
      await validateSpecial.click();
    } else {
      this.globalService.theValidator = '1';
    }
    // this.exportVerificationFilesValidation();
    // return localStorage.getItem('validateStatus');
  }

  // 承诺勾选项
  async validateAcceptTerm() {
    let validateAcceptTerm = document.getElementById('accept-term-validator') as HTMLElement;
    if (validateAcceptTerm) {
      await validateAcceptTerm.click();
    } else {
      this.globalService.theValidator = '1';
    }
  }

  // 要求到货日期
  async validateRdd() {
    let validateRdd = document.getElementById('rdd-validator') as HTMLElement;
    if (validateRdd) {
      await validateRdd.click();
    } else {
      this.globalService.theValidator = '1';
    }
  }

  preValidateCommercial(form) {
    let result = false;
    if ('selectordertype' in form) {
      if (null == form['selectordertype']) {
      } else {
        let selectordertypeObj = JSON.parse(form['selectordertype']);
        if (!selectordertypeObj['isCompleted'] || true !== selectordertypeObj['isCompleted']) {
        } else {
          result = true;
        }
      }
    } else {
      result = true;
    }
    return result;
  }

  //自定义email相关 starts
  searchEmail(value: string): void {
    this.searchChange$.next(value);
  }

  addEmail(obj) {
    // console.log('addEmail', obj);
    if (obj && obj['value'] && obj['value']['email'] && '' != obj['value']['email']) {
      const event = obj['value'];
      this.inputCc = this.inputCc || '';
      this.inputCc = this.inputCc.trim().replace(/；/g, ';');
      this.inputCc = this.inputCc.trim().replace(/;/g, ';');
      if ('' === this.inputCc.slice(-1) || ';' === this.inputCc.slice(-1)) {
        this.inputCc = this.inputCc + event['email'];
      } else {
        let cleanInputCc = this.inputCc.trim().replace(/ /g, '');
        let tempArr = cleanInputCc.split(';');
        if (tempArr.indexOf(event['email']) < 0) {
          this.inputCc = cleanInputCc + ';' + event['email'];
        }
      }

      let finalInputCc = '';
      for (const item of this.inputCc.split(';')) {
        if (this.regexService.validateEmail(item)) {
          if ('' == finalInputCc) {
            finalInputCc += item;
          } else {
            finalInputCc += ';' + item;
          }
        }
      }
      this.inputCc = finalInputCc;
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  //自定义email相关 ends

}
