import { Component, OnInit, NgModule, Input} from '@angular/core';
import { FileService, HttpService } from '../../../services';
import { NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-prebook-no',
  templateUrl: './prebook-no.component.html',
  styleUrls: ['./prebook-no.component.scss']
})
export class PrebookNoComponent implements OnInit {

  constructor(private http: HttpService,private message: NzMessageService) { 

  }
  
  ngOnInit() {
  }
  public agentDatas:any=[];
  public nzLoading:any=false;
  @Input() public pageParam:any={
    total:0,
    pageNo:1,
    pageSize:5,
    marketBundleName:"",
    distribtuor:"",
    dealFormId:"",
    endUserName:"",
    foreignTradeCompany:"",
  }
 @Input() public dataBase:any={}; 
agentChange(index){ 
  this.agentDatas.map((res,i)=>{
       res.radio=index==i?true:false;
  })
}
//分页页码参数pageNo
changePageIndex(index)
{
  this.pageParam.pageNo = index;
  this.agentInit()

}
//返回选中的值
selectFind()
{
    let arr=this.agentDatas.filter(item=>item.radio==true)
    return arr;
}
//分页页码参数pageSize
changePageSize(index)
{
  this.pageParam.pageSize=index;
  this.agentInit()
}
agentInit()
{   
  //prebook列表  
  this.nzLoading=true
  this.http.post(`/act/prebook/queryPreBookApply`,this.pageParam).subscribe((rest => {      
    if (rest.code === '0000') {      
      this.agentDatas=rest.data.rows;
      const productList= this.dataBase.productList ;
      this.agentDatas.map(vals=>{
        vals.radio=vals.id==this.pageParam.prebookProductId?true:false;
        if(productList)
        {
          productList.map(val=>{
            vals.id==val.prebookProductId&&(vals.disa=true);          
          }) 
        }      
      });      
      this.pageParam.total=rest.data.total;
      this.nzLoading=false;
    }
  }), (error => {
    this.nzLoading=false;
    this.message.create("error", "请求异常")
  }));
}

}
