import { Component, OnInit, NgModule, Input} from '@angular/core';
import { FileService, HttpService } from '../../../services';
import { NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-end-user-list',
  templateUrl: './end-user-list.component.html',
  styleUrls: ['./end-user-list.component.scss']
})
export class EndUserListComponent implements OnInit {

  constructor(private http: HttpService,private message: NzMessageService) { }

  ngOnInit(){   
  }
  ngOnChanges()
  {
   this.pageParam=Object.assign({},this.pageParam);  
   this.agentInit()
  }
  @Input() public pageParam:any={
    total:0,
    pageNo:1,
    pageSize:5,
    customerName:"",
    endUserId:"",
  }
  public agentDatas:any=[];
  public filteredOptions:any=[];
  onInput(value: string): void {    
    let obj={     
      pageNo:1,
      pageSize:10,
      customerName:""
    }
    obj.customerName=value;
    this.seachData(obj)
  }
  clearAll()
{
  this.pageParam.customerName="";
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
seachData(param)
{
  this.http.post(`/act/preparation/getEndUser`,param).subscribe((rest => {      
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
agentInit()
{   
  //最终用户列表   
  this.http.post(`/act/preparation/getEndUser`,this.pageParam).subscribe((rest => {      
    if (rest.code === '0000') {
      this.agentDatas=rest.data.rows;      
      this.agentDatas.map(vals=>{
        vals.no==this.pageParam.endUserId&&(vals.radio=true);
      });      
      this.pageParam.total=rest.data.total;
    }
  }), (error => {
    this.message.create("error", "请求异常")
  }));
}
}
