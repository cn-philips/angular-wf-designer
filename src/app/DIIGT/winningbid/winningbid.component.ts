import { Component, OnInit } from '@angular/core';
import {
  formatDates,
  formatDate,
  decodeString,
  chNumber,
  NumberThousandth
} from '../../../assets/js/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-winningbid',
  templateUrl: './winningbid.component.html',
  styleUrls: ['./winningbid.component.scss']
})
export class WinningbidComponent implements OnInit {
  mainId: any = '';
  // 基础信息
  public dataBase: any = {};
  // 绑定其他复选框
  othercheck: any = false;
  odata: any = {
    // 中标通知书
    bidWinningNotice: false,
    // 中标公告
    bidWinningAnnouncement: false,
    // 缺要货函，用场地报告代替
    demandLetter: false,
    // 公立医院，招标编号-其他类型
    otherTypes: false,
    // 其他
    other: ''
  };
  fileList: any = {
    fileSpecialList: [], // 特批文件
    filesupplementList: [], // 补充文件
    filesupplementsList: [], // 补充文件2
    filesupplementssList: [] // 补充文件3
  };
  data = {
    remarks: ''
  };
  constructor(
    private router: Router,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
  ) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.mainId = mainId;
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {
      console.log(res);
      if (res.code === '0000') {
        this.dataBase = res.data;
        if(this.dataBase.tenderPriceCurrency != null && this.dataBase.tenderPriceCurrency != ''){
          this.dataBase.tenderPriceCurrency=chNumber(this.dataBase.tenderPriceCurrency); 
          this.dataBase.tenderPriceCurrency=NumberThousandth(this.dataBase.tenderPriceCurrency); 
         }  
         if (this.dataBase && this.dataBase.totalPrice!=''&&this.dataBase.totalPrice!=null) {
          this.dataBase.totalPrice = chNumber(this.dataBase.totalPrice);
           this.dataBase.totalPrice = NumberThousandth(this.dataBase.totalPrice);
         }
         if (this.dataBase && this.dataBase.performanceBonds!=''&&this.dataBase.performanceBonds!=null) {
          this.dataBase.performanceBonds = chNumber(this.dataBase.performanceBonds);
          this.dataBase.performanceBonds = NumberThousandth(this.dataBase.performanceBonds);
         } 
      }
    });
  }
  public flag: any = 0;
  ngOnInit() {
  }

}
