import { Component, OnInit, NgModule, Input} from '@angular/core';
import { FileService, HttpService } from '../../../services';
import { NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-agentshow',
  templateUrl: './agentShow.html',
  styleUrls: ['./agentShow.scss']
})
@NgModule({

})
export class AgentshowComponent implements OnInit {

  constructor(private http: HttpService,private message: NzMessageService,) { }
  ngOnChanges()
  {
   this.params=Object.assign({},this.params);
   this.agentDatas=Object.assign({},this.agentDatas);
   // this.agentInit()
  }
  ngOnInit() {
  }
  public agentDatas:any=[];
  public loading = false;
  @Input()params:any={
    total:0,
    pageNo:1,
    pageSize:5,
    dealerName:""
  }
public agentData:any=[];
clearAll()
{
  this.params.dealerName="";
  this.agentInit();
}
//分页页码参数pageNo
changePageIndex(index)
{
  this.params.pageNo = index;
  this.agentInit()

}
//分页页码参数pageSize
changePageSize(index)
{
  this.params.pagaSize=index;
  this.agentChange(this.params);
}

 //加载代理商数据
agentInit()
{
  const url=`/act/ecom/bidding/selAgentOnly`;
  this.loading = true;
  this.http.post(url,this.params).subscribe((res=>{
    if(res.code=='0000')
    {
      this.agentDatas=res.data.rows;
      this.agentDatas.map(res=>{
        res.radio=false;
      })
      this.params.total=res.data.total;
    }
    else{
      this.message.create('error', res.msg);
    }
    this.loading = false;
  }),
  ((error)=>{
    this.message.create("error","请求异常!");
    this.loading = false;
  }))
}
 //代理商单选事件
 agentChange(index){
  this.agentDatas.map((res,i)=>{
       res.radio=index==i?true:false;
  })
}

 //返回选中的值
 selectFind()
 {
     let arr=this.agentDatas.filter(item=>item.radio==true)
     return arr;
 }


}
