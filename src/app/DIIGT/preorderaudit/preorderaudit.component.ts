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
             let  firstArr=[];//前端排序
              this.dataBase.productList.map(vals=>{ 
                let totalContractPrice=vals.totalContractPrice.split(".")
                vals.totalContractPrice=totalContractPrice[0];              
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
            }
          } else {
            this.message.create('error', '获取数据失败');
          }
        });

    }

  }

}
