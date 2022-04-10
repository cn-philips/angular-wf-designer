import { Component, OnInit } from '@angular/core';
import {decodeString} from '../../../assets/js/tools';
import {ActivatedRoute} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import { HttpService } from '../../services';
import {
  cheakbox,
  ServesiceService,
} from '../preOrder/servesice.service';
@Component({
  selector: 'app-preorderaudit',
  templateUrl: './preorderaudit.component.html',
  styleUrls: ['./preorderaudit.component.scss']
})
export class PreorderauditComponent implements OnInit {

  constructor(
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private http: HttpService,
    private ServesiceService:ServesiceService,
  ) { }
  public activedId: any;
  public paySwitch = false;
  public installSwitch = false;
  public state = '';
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };

  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId=val.nextId;
  }
  public myskip(val): void { //外部触发tab选项卡的事件
    this.activedId = val;
  }
  public updateDataBase(value: any) {
    console.log('value', value);
    console.log('this.dataBase', this.dataBase);
    // values.forEach()
    // this.dataBase = {};
  }
  ngOnInit() {
    // 获取mainid
    
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const status = this.activatedRouter.queryParams['_value'].state;
    this.state = status;
    if(status==="DCDSH"||status==="DHTOASH")
    {
      const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
        let param={
          mainId:mainId
        }
        // 获取基础信息数据
        this.http.post(url,param).subscribe(res => {
            if (res.code === '0000') {
              if (res.data) {
                this.dataBase = res.data;
                this.dataBase.detail = {
                  id: '',
                  flag: '',
                  status: '',
                };
                if (this.dataBase.sameFlag != null) {
                  this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
                }
                this.dataBase.detail.id = mainId;
                this.dataBase.detail.flag = flag;
                this.dataBase.detail.status = status;
                this.dataBase.isPrebookApply= this.dataBase.isPrebookApply!=null?this.dataBase.isPrebookApply.toString():'0';
              }
            } else {
              this.message.create('error', '获取数据失败');
            }
          });
    }
    else if(status==="DOACS")
    {
      const url = `/act/ecom/order/application/getPerOrder?mainId=${mainId}`;
      // 获取基础信息数据
      this.http.get(url).subscribe(res => {
          if (res.code === '0000') {
            if (res.data) {
              this.dataBase = res.data;
              this.dataBase.detail = {
                id: '',
                flag: '',
                status: '',
              };            
             this.dataBase.isPrebookApply=this.dataBase.isPrebookApply.toString();
             let  firstArr=[];//前端排序
              this.dataBase.productList.map(vals=>{ 
                vals.priceDifferent =vals.priceDifferent !=null?vals.priceDifferent :'0';
                vals.isPrebookApply=vals.isPrebookApply!=null?vals.isPrebookApply.toString():'0';            
                vals.productList.map((item,index)=>{
                  if(item.checked)
                  {
                    firstArr=item;
                    vals.productList.splice(index,1);
                  }
                  item.modalityBmc=item.modalityBmcs?item.modalityBmcs:[]; //用于接收bmcs的数据
                })
                vals.productList.unshift(firstArr)
              })
              if (this.dataBase.sameFlag != null) {
                this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
              }
              this.dataBase.detail.id = mainId;
              this.dataBase.detail.flag = flag;
              this.dataBase.detail.status = status;
             // this.ServesiceService.host.emit();


             // 将读取的文件便利到对应的变量    *** 上传控件要显示已上传的文件  （可编辑）
          // filetake2(字符串) 读取的文件变量
          // filetake(数组) 要将filetake2的值赋给filetake

          // filetake 和 filetake2 值对应，顺序不变
          const filetake = [
            'mrShieldingCompanyFileList', // 磁共振屏蔽公司
            'confirmationFileFileList', // IGT第三方吊塔确认文件
            'paymentProvisionFileNameFileList', // 付款条件
            'shipmentDeliveryFileNameFileList', // 装运及交货
            'sitePreparationFileNameFileList', // 场地准备
            'installationWarrantyFileNameFileList', // 安装，验收及保修
            'amountDifferenceFileNameFileList', // 直投订单合同金额和中标金额有价差
            'performanceBondFileNameFileList', // 履约保函
            'afterSalesFileNameFileList', //是否售后
            'supportFileMissingFileNameFileList', // 支持文件缺失需特批进单
            'otherFilNameFileList' // 其他条款
          ];
          const filetake2 = [
            { id: 'mrShieldingCompany', name: "mrShieldingCompanyNames" }, // 磁共振屏蔽公司
            { id: 'confirmationFile', name: "confirmationFileNames" }, // IGT第三方吊塔确认文件
            { id: 'paymentProvisionFileName', name: "paymentProvisionFileNames" }, // 付款条件
            { id: 'shipmentDeliveryFileName', name: "shipmentDeliveryFileNames" }, // 装运及交货
            { id: 'sitePreparationFileName', name: "sitePreparationFileNames" }, // 场地准备
            { id: 'installationWarrantyFileName', name: "installationWarrantyFileNames" }, // 安装，验收及保修
            { id: 'amountDifferenceFileName', name: "amountDifferenceFileNames" }, // 直投订单合同金额和中标金额有价差
            { id: 'performanceBondFileName', name: "performanceBondFileNames" }, // 履约保函
            { id: 'afterSalesFileName', name: "afterSalesFileNames" }, // 是否售后
            { id: 'supportFileMissingFileName', name: "supportFileMissingFileNames" }, // 支持文件缺失需特批进单
            { id: 'otherFilName', name: "otherFilNames" } // 其他条款
          ];
          for (let j = 0; j < filetake.length; j++) {
            this.takeFile(filetake[j], filetake2[j]);
          }
            }
          } else {
            this.message.create('error', '获取数据失败');
          }
        });

    }

  }

   // 处理文件 将读取的文件显示在页面上
  // 将字符文件变量 便利成数组对象
  takeFile(filename, filename2) {
    // console.log('处理文件变量');
    for (let i = 0; i < this.dataBase.productList.length; i++) {
      // this.dataBase.productList[i].paymentProvisionFileNameFileList = [];
      // this.dataBase.productList[i].paymentProvisionFileNameFileList.push(this.dataBase.productList[i].paymentProvisionFileName);
      // this.dataBase.productList[i].paymentProvisionFileName = this.dataBase.productList[i].paymentProvisionFileName;
      if (!this.dataBase.productList[i].productList) {
        this.dataBase.productList[i].productList = [];
      }
      if (this.dataBase.productList[i][filename2.id] && this.dataBase.productList[i][filename2.id] !== '' && this.dataBase.productList[i][filename2.id] != undefined) {
        this.dataBase.productList[i][filename] = [];
        const obj = { uid: '', name: '', fileId: '' };
        obj.uid = this.dataBase.productList[i][filename2.id];
        obj.fileId = this.dataBase.productList[i][filename2.id];
        obj.name = this.dataBase.productList[i][filename2.name];
        this.dataBase.productList[i][filename].push(obj);
      }
    }
    // console.log('处理完成');
    // console.log(this.dataBase);
  }

  toReturn() {
    window.history.back();
  }
}
