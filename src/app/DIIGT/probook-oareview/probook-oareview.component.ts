import { Component, OnInit,Input } from '@angular/core';
import {decodeString} from '../../../assets/js/tools';
import {ActivatedRoute} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import { HttpService } from '../../services';
import {
  cheakbox,
  ServesiceService,
} from '../preOrder/servesice.service';

@Component({
  selector: 'app-probook-oareview',
  templateUrl: './probook-oareview.component.html',
  styleUrls: ['./probook-oareview.component.scss']
})
export class ProbookOareviewComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private http: HttpService,
    private ServesiceService:ServesiceService,)
    {

    }

  ngOnInit() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const status = this.activatedRouter.queryParams['_value'].status;
    this.getBase(mainId);
    switch(status)
    {
      case "prebook_oa_approval":
        this.title='PREBOOK-OA Review PREBOOK-OA审核';
        break
      case "prebook_district_leader_approval":
        this.title='District Leader Review District Leader审核';
        break
      case "prebook_sales_leader_approval":
        this.title="Sales Leader Review Sales Leader审核";
        break
    }
  }
  activedId: any = "pending-tab";
  public disa:any=false;
  public title:any;
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };
  public myskip(val): void { // 外部触发tab选项卡的事件
    this.activedId = val;
  }
  //查询
  getBase(mainId)
  {
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const url = `/act/prebook/getPreBookInformation?mainId=${mainId}`;
    const status = this.activatedRouter.queryParams['_value'].status;
    this.disa = flag === '1' ? true : false;
        // 获取基础信息数据
        return new Promise((resolve, reject) => {
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
              this.dataBase.dataList = [];
              let  firstArr=[];//前端排序
              this.dataBase.productList.map(vals=>{
                vals.productList.map((item,index)=>{
                  if(item.checked)
                  {
                    firstArr=item;
                    vals.productList.splice(index,1);
                  }

                })
                vals.productList.unshift(firstArr)
              })
              resolve(true);
            }
          } else {
            this.message.create('error', '获取数据失败');
          }
        });
      })
  }

  toReturn() {
    window.history.back();
  }
}
