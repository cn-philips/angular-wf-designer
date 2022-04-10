import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import {HttpService} from '../../services';
import {decodeString,NumberThousandth} from '../../../assets/js/tools';

@Component({
  selector: 'app-viewsubprocesse',
  templateUrl: './viewsubprocesse.component.html',
  styleUrls: ['./viewsubprocesse.component.scss']
})
export class ViewsubprocesseComponent implements OnInit {

  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };

  constructor(
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private http: HttpService
  ) { }

  ngOnInit() {
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const status = this.activatedRouter.queryParams['_value'].status;
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
          if (this.dataBase.sameFlag != null) {
            this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
          }
          this.dataBase.detail.id = mainId;
          this.dataBase.detail.flag = flag;
          this.dataBase.detail.status = status;
          this.dataBase.isPrebookApply= this.dataBase.isPrebookApply!=null?this.dataBase.isPrebookApply.toString():'0';
          const productList = this.dataBase.productList;
          let firstArr = [];//前端排序
         if (productList.length > 0) {
          productList.map(vals => {
            vals.isPrebookApply=vals.isPrebookApply!=null?vals.isPrebookApply.toString():'0';
            let financialPrice=vals.financialPrice;
            financialPrice&&(vals.financialPrice=this.returnFloat(vals.financialPrice,2)); //金融方案价格
            let totalContractPrice=vals.totalContractPrice;
            totalContractPrice&&(vals.totalContractPrice=this.returnFloat(vals.totalContractPrice,4)); //金融方案价格
            if (vals.productList && vals.productList.length > 0) {
              vals.productList.map((val,index) => {
                if (val.checked) {
                  firstArr = val;
                  vals.productList.splice(index, 1);
                }
                val.modalityBmc=val.modalityBmcs?val.modalityBmcs:[]; //modalityBmc用于判定是否显示磁共振和三方塔吊;
                val.id = val.simulationId;
              });
              vals.productList.unshift(firstArr)
            }
           });
         }
        }
      } else {
        this.message.create('error', '获取数据失败');
      }
    });
  }

  //小数后自动补零
  returnFloat(value: any, num) {
    var a, b, c, i;
    a = value.toString();
    b = a.indexOf(".");
    c = a.length;
    if (num == 0) {
      if (b != -1) {
        a = a.substring(0, b);
      }
    } else {//如果没有小数点
      if (b == -1) {
        a = a + ".";
        for (i = 1; i <= num; i++) {
          a = a + "0";
        }
      } else {//有小数点，超出位数自动截取，否则补0
        a = a.substring(0, b + num + 1);
        for (i = c; i <= b + num; i++) {
          a = a + "0";
        }
      }
    }
    return a;
  }

  toReturn() {
    window.history.back();
  }
}
