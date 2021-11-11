import { Component, OnInit,Input,ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpService } from '../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {environment} from '../../../environments/environment';
import {codeString, decodeString} from '../../../assets/js/tools';
import {ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-inorder-in',
  templateUrl: './inorder-in.component.html',
  styleUrls: ['./inorder-in.component.scss']
})
export class InorderInComponent implements OnInit {

  constructor(private activatedRouter: ActivatedRoute, private fb: FormBuilder,private cd: ChangeDetectorRef,private http: HttpService,private message: NzMessageService) { }
  validateForm:FormGroup;
  mainid_winList: any = [];
  mainId: any = '';
  public businessModelList = []; //业务模式的下拉框
  public entryModeList = []; //进单模式列表
  public disa:any=false;//
  @Input() dataBase:any={

  };
  ngOnInit() {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const state=this.activatedRouter.queryParams['_value'].state;
    this.validateForm = this.fb.group({
      selectedDistributor:[],
      selectedDistributors:[],
      name:[],
      age:[],
    })
    this.getBusinessModelList();
    this.getEntryModeList();
    this.disa=state=='DTXHT'?false:true
   // this.getWinUrl();   
  }
  ngOnChanges()
  {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    if(this.dataBase)
    {
     
      if(this.dataBase.entryMode&&this.dataBase.entryMode == 'BIDDING')
      {
        this.getWinUrl();
      }
    
    }    
  }


  //没有文件的显示
  nodata(param)
  {
    if(param==null||param=='')
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  // 进单模式
public getEntryModeList() {
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
  // 业务模式
  public getBusinessModelList () {
    const params = {
      dictGroup: 'BUSINESS_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe((rest => {
      if (rest.code === '0000') {
        this.businessModelList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }),(error)=>{
      this.message.create("error","请求异常！")
    });
  }
    // 文件下载
    public fileDwon(id) {
      const urlPath = window.document.location.href;
      const docPath = window.document.location.pathname;
      const index = urlPath.indexOf('#');
      const serverPath = urlPath.substring(0, index);
      const url = `${serverPath}act/system/download/${id}`;
      window.open(url, '_blank');
    }
    // 上传文件下载
    public dwonLoad = (file: UploadFile): void => {
      const urlPath = window.document.location.href;
      const docPath = window.document.location.pathname;
      const index = urlPath.indexOf('#');
      const serverPath = urlPath.substring(0, index);
      const url = `${serverPath}act/system/download/${file.fileId}`;
      window.open(url, '_blank');
    }
  /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
   viewData(data,fileList)
   {

     const bidWinningNotice=this.dataBase[data];
     if(bidWinningNotice!=""&&bidWinningNotice!=undefined&&bidWinningNotice!=null)
     {

       this[fileList]= [];
       let obj = { uid: "", name: "", fileId: "" }
       obj.uid = this.dataBase[data];
       obj.fileId =this.dataBase[data];
       obj.name = "文件下载";
       this[fileList].push(obj);
     }
   }

  /*投标申请表链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      jdChildMainId: this.mainId
    };
    this.http.post(url, par).subscribe( e => {
      if (e.data) {
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    if (item.taskStatus && item.taskStatus === 'YZBQRDBCWJ') {
      window.open(location.origin + environment.base_href + '/#/' + 'support-up?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    } else {
      window.open(location.origin + environment.base_href + '/#/' + 'winning?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    }
  }

}
