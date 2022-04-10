import { Component, OnInit,ViewChild} from '@angular/core';

@Component({
  selector: 'app-winningsupple',
  templateUrl: './winningsupple.component.html',
  styleUrls: ['./winningsupple.component.scss']
})
export class WinningsuppleComponent implements OnInit {

  constructor() { }
  @ViewChild('child1')child1
  @ViewChild('child2')child2

  ngOnInit() {

  }
  public selectedValue:any="";
  public isBid: boolean = false; //投标弹出选择代理商;
  public isAgre: boolean = false; //协议商弹出框;
  public isFilloff: boolean = false;
  public stockCode: any = 1; // 业务模型选中值;
  empowerList: any = [{ name: "Direct Deal", value: 1 },
  { name: "Distributor Deal", value: 2 },
  ];
  public company: any = {
    "nameEn": "",
    "nameCn": "",
  }//代理商
  public radioValue: any = "1";//是否投标授权
  public secondLevel: any = "1";//是否二级代理商
  public agreement: any ={
    "nameEn": "",
    "nameCn": "",
  }; //协议商
  public models: boolean = true; //是否显示
  public adopt: any = '1';
  public stats: any = [
    { name: "通过", value: '1' },
    { name: "开始", value: '2' },
    { name: "飞利浦授权二级代理商", value: '3' }]
  selectChange()  //业务模式下拉框
  {
    switch (this.stockCode) {
      case 1:
        this.models = true;
        break;
      case 2:
        this.models = false;
        break;
    }
  }
  //弹出协议商选择弹出框  
  showAgre() {
    this.isAgre = true;
  }
  //取消弹窗
  isAgreCancel() {
    this.isAgre = false;
  }
  //选择代理商确定
  isAgregentOk() {
    let arr= this.child2.selectFind()
    this.agreement.nameEn=arr[0].nameEn;
    this.agreement.nameCn=arr[0].nameCn;
    this.isBid = false;
    this.isAgre = false;
  }

  //弹出投标选择代理商
  showAgent() {
    this.isBid = true;
  }
  //取消弹窗
  isBidCancel() {
    this.isBid = false;
  }
  //选择代理商确定
  isBidagentOk() {
    let arr= this.child1.selectFind()
    this.company.nameEn=arr[0].nameEn;
    this.company.nameCn=arr[0].nameCn;
    this.isBid = false;
  }

  //填写弹出窗口
  showFill() {
    this.isFilloff = true;
  }
  fillCancel() {
    this.isFilloff = false;
  }
  fillOk() {
    this.isFilloff = false;
  }
}
