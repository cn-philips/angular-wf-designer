import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { HttpService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService } from 'ng-zorro-antd';
import {
  cheakbox,
  ServesiceService,
} from '../../DIIGT/preOrder/servesice.service';
import { decodeString, codeString, formatDatesNow } from '../../../assets/js/tools';
@Component({
  selector: 'app-pre-book',
  templateUrl: './pre-book.component.html',
  styleUrls: ['./pre-book.component.scss']
})
export class PreBookComponent implements OnInit {
  @ViewChild('childbase') public childbase;
  @ViewChild('remarks') remarks;
  public activedId: any = 'pending-tab';
  public load:any=false;
  public disa:any=false;
  public completed: boolean = false;//判读是保存 false,拒绝的true;
  public dataBase: any = {
    productList: [], // 产品列表
    referenceId: '',
    detail: {
      id: '',
      flag: '0',
      status: '',
    },
    dataList: [],
    count: 0,
    sameFlag: "0",
  };
  constructor(private message: NzMessageService,public activatedRouter: ActivatedRoute, private http: HttpService, private router: Router, private ServesiceService: ServesiceService) {

  }
  ngOnInit() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);

    if(mainId)
    {
      const ASYNS = async () => {

        const rezult = await this.getBase(mainId);
        await this.getMarks();
        if (rezult) {
          await this.getProudcut();
        }
      }
      ASYNS()
    }
  }
  public tabclick(val) {
    this.activedId = val.nextId;
  }
  public myskip(val): void { // 外部触发tab选项卡的事件
    this.activedId = val;
  }
  //查询
  getBase(mainId)
  {
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const url = `/act/prebook/getPreBookInformation?mainId=${mainId}`;
    const status = this.activatedRouter.queryParams['_value'].state;
    this.disa = flag === '1' ? true : false;
        // 获取基础信息数据
        return new Promise((resolve, reject) => {
        this.http.get(url).subscribe(res => {
          if (res.code === '0000') {
            if (res.data) {

              resolve(true);

              this.dataBase = res.data;
              this.dataBase.detail = {
                id: '',
                flag: '',
                status: '',
              };
              if (this.dataBase.sameFlag != null) {
                this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
              }
              const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
              this.dataBase.detail.id = mainId;
              this.dataBase.detail.flag = flag;
              this.dataBase.detail.status = status;
              this.dataBase.dataList = [];
              this.dataBase.processInstanceTaskId=processInstanceTaskId;
              let  firstArr=[];//前端排序
              this.dataBase.productList.map(vals=>{
                if(vals.productList&&vals.productList.length>0)
                {
                  vals.productList.map((item,index)=>{
                    item.id = item.simulationId;
                    if(item.checked)
                    {
                      firstArr=item;
                      vals.productList.splice(index,1);
                    }

                  })
                  vals.productList.unshift(firstArr)
                }
              })
              for (let i = 0; i < this.dataBase.productList.length; i++) {
                if (!this.dataBase.productList[i].productList) {
                  this.dataBase.productList[i].productList = [];
                }
              }
            }
          } else {
            this.message.create('error', '获取数据失败');
          }
        });
      })
  }
    //获取产品信息
    getProudcut() {

      // /act/preparation/queryMarketBundle
      const url = `/act/preparation/queryMarketBundle?dealFormID=${this.dataBase.dealFormId}`;
      this.http.get(url).subscribe(res => {
        if (res.code == '0000') {
          this.dataBase.count = 0;
          let { children } = res.data;
          children.map(vals => {
            vals.title = vals.simulationId;
            vals.key = vals.id;
            vals.level = 1;
            vals.children.map(val => {
              this.dataBase.count++;
              val.title = val.marketBundleName;
              val.key = val.id;
              val.level = 2;
              val.children.map(item => {
                item.title = item.productName;
                item.key = item.id;
                item.level = 3;
                item.disableCheckbox = true; //第三层禁用
                item.isLeaf = true; //叶子节点
              })
            });
          });
          this.dataBase.dataList = children;
          // console.log('this.dataBase.dataList',this.dataBase.dataList,children)
        }
      });
    }
  getMarks() {
    const param = {
      mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
    };
    this.load = true
    this.http.post(`/act/process/getProcessWorkHisInfo`, param).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        if (rest.data.length > 1) {
          this.completed = true;
        }
      } else {
        this.load = false;
        this.message.create('error', `${rest.msg}`);
      }
    }), (error) => {
      this.load = false;
      this.message.create("error", "请求异常!")
    });
  }
  //保存并提交及保存
  saveContract(e) {
    this.dataBase.status = e;
    const mainId=decodeString(this.activatedRouter.queryParams['_value'].id)
    this.dataBase.mainId = mainId?mainId:"";
    if (this.dataBase.status == '1')
    {
        const cheakData = this.childbase.checkFormData();
        if (!cheakData) {
          this.myskip('pending-tab');
          this.message.create('error', `基础信息有必填项没有填写`);
          return;
        }
        if(this.dataBase.supportFile==""||this.dataBase.supportFile==null||this.dataBase.supportFile==undefined)
        {
          this.myskip('pending-tab');
          this.message.create('error', `请上传支持文件`);
          return;
        }
        // if ((this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.ddpStatus !== '通过') || (this.dataBase.invoiceInformation === 'USD' && this.dataBase.contractDdpStatus !== '通过')) {
        //   this.message.create('warning', 'DDP-Status状态未通过');
        //   this.myskip('pending-tab');
        //   return;
        // }
        const dealFormId = this.dataBase.dealFormId;
        if (dealFormId == '' || dealFormId == undefined || dealFormId == null) {
          this.message.create('warning', '请填写dealFormId');
          return;
        }
        if (!(this.dataBase.productList && this.dataBase.productList.length > 0)) {
          this.message.create('error', '请添加进单单位');
          this.myskip('complete-tab');
          return;
        }
        let productList = this.dataBase.productList;
        let checkPd = productList.some((vals) => vals.productList.length < 1);
        if (checkPd) {
          this.message.create('warning', '有进单单位没有添加产品!');
          return;
        }
        for (let i = 0; i < this.dataBase.productList.length; i++) {
          let productList=this.dataBase.productList[i].productList;
          let checked=productList.some(val=>val.checked);
          if(!checked)
          {
            this.message.create('warning', '有进单单位没有选择主机');
             return;
          }
        }

        //投标公司不能等于外贸公司
        if(this.dataBase.invoiceInformation=='USD'&&this.dataBase.businessModel=='DISTRIBUTOR')
        {
          const tenderingCompany=this.dataBase.tenderingCompany?this.dataBase.tenderingCompany.replace(/\s+/g,""):"";
          const foreignTradeCompany=this.dataBase.foreignTradeCompany?this.dataBase.foreignTradeCompany.replace(/\s+/g,""):"";
          const distributor=this.dataBase.distributor?this.dataBase.distributor.replace(/\s+/g,""):"";
          if(distributor!=tenderingCompany)
          {
              if(tenderingCompany==foreignTradeCompany)
              {
                this.message.create('error', '外贸公司不能等于投标公司,请重新选择外贸公司!');
                    return;
              }
          }
        }
        // 如果是被拒绝的待提交就要验证备注
      if (this.completed === true) {
        let cheakRemarks = this.remarks.checkFormData();
        if (!cheakRemarks) {
          this.myskip('complete-remarks');
          this.message.create('error', '备注信息没有填写');
          return;
        }
      }
    }
   // this.ServesiceService.sofonNosend.emit(this.ckdealformlist.finaSofonQuoation);
   if(this.dataBase.finaSofonQuoation)
   {
      let productList=this.dataBase.productList;
      if(productList&&productList.length>0)
      {
        productList.map(val=>{
          val.sofonNo=this.dataBase.finaSofonQuoation;
        })
      }
   }
    this.load = true;
    this.http.post(`/act/prebook/saveOrSub`, this.dataBase).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        if (e === 1 || e === '1') {
          this.router.navigate(['/igt/my-task']);
        }
        else{
          if(rest.data)
          {
            this.dataBase.id=rest.data.mainId;
            this.dataBase.mainId=rest.data.mainId;
            this.dataBase.processInstanceTaskId=rest.data.processInstanceTaskId;
          }
        }
        this.load = false;
      }
      else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
        return;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器请异常！");
    }));

  }
  //取消按钮
  public cancelContract(): void {
    this.router.navigate(['/igt/my-task']);
  }


  cancelFn() {
    this.router.navigate(['/igt/my-task']);
  }

  toReturn() {
    window.history.back();
  }
}
