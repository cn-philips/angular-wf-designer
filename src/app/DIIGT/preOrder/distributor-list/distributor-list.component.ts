import { Component, OnInit, NgModule, Input } from '@angular/core';
import { FileService, HttpService } from '../../../services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-distributor-list',
  templateUrl: './distributor-list.component.html',
  styleUrls: ['./distributor-list.component.scss']
})
export class DistributorListComponent implements OnInit {

  constructor(private http: HttpService, private message: NzMessageService) { }

  ngOnInit() {
  }
  ngOnChanges() {
   // this.pageParam = Object.assign({}, this.pageParam);
   // this.agentInit()
  }
  public agentDatas: any = [];
  public filteredOptions: any = [];
  public loading:any=false;
  @Input() public pageParam: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    agreementNo:"", //协议号
    dealerCode:"", //经销code
    dealerName:"", //经销商名称
    selectName:"", //当前选中
   }
  onInput(value: string): void {
    let obj = {
      pageNo: 1,
      pageSize: 10,
      dealerName: ""
    }
    obj.dealerName = value;
    this.seachData(obj)
  }
  clearAll()
  {
    this.pageParam.dealerName="";
    this.agentInit();
  }
  //分页页码参数pageNo
  changePageIndex(index)
  {
    this.pageParam.pageNo = index;
    this.agentInit()

  }
  //分页页码参数pageSize
  changePageSize(index)
  {
    this.pageParam.pageSize=index;
    this.agentInit()
  }
  //代理商单选事件
  agentChange(index){
    this.agentDatas.map((res,i)=>{
         res.radio=index==i?true:false;
    })
  }
  //模糊搜索
  seachData(param) {
    this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, param).subscribe((rest => {
      if (rest.code === '0000') {
        this.filteredOptions = rest.data.rows;
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }
  //返回选中的值
  selectFind()
  {
      let arr=this.agentDatas.filter(item=>item.radio==true)
      return arr;
  }
  agentInit() {
    //经销用户列表
    this.loading=true;
    this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, this.pageParam).subscribe((rest => {
      if (rest.code === '0000') {
        this.loading=false;
        this.agentDatas = rest.data.rows;
        this.agentDatas.map(vals => {
          vals.dealerName == this.pageParam.selectName && (vals.radio = true);
        });
        this.pageParam.total = rest.data.total;
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }

  searchClick() {
    this.pageParam.pageNo = 1;
    this.agentInit();
  }

}
