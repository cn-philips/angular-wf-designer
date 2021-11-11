import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {formatDates} from '../../../assets/js/tools';
import {HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {
  decodeString,
  NumberThousandth,
  chNumber
} from '../../../assets/js/tools';

@Component({
  selector: 'app-emp',
  templateUrl: './emp.component.html',
  styleUrls: ['./emp.component.scss']
})
export class EmpComponent implements OnInit {

  constructor(private http: HttpService,
              private message: NzMessageService,
              private activeRoute: ActivatedRoute,
              private router: Router) { }

  data:any={};
  mainid:any;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.mainid = decodeString(params['id']);
      //console.log(this.mainid);
      if(this.mainid!=null&&this.mainid!='')
        this.getData();
    });

  }
  //获取数据
  getData() {
    let url='/act/ecom/tender/application/getTenderApplicationDto?mainId=';
    this.http.get(url+this.mainid).subscribe(res =>{
      console.log(res);
      Object.assign(this.data, res.data);
      if(this.data.tenderPriceCurrency != null && this.data.tenderPriceCurrency != ''){
        this.data.tenderPriceCurrency=chNumber(this.data.tenderPriceCurrency);
        this.data.tenderPriceCurrency=NumberThousandth(this.data.tenderPriceCurrency); 
       }  
       if (this.data && this.data.totalPrice!=''&&this.data.totalPrice!=null) {
        this.data.totalPrice = chNumber(this.data.totalPrice);
         this.data.totalPrice = NumberThousandth(this.data.totalPrice);
       }
       if (this.data && this.data.performanceBonds!=''&&this.data.performanceBonds!=null) {
        this.data.performanceBonds = chNumber(this.data.performanceBonds);
        this.data.performanceBonds = NumberThousandth(this.data.performanceBonds);
       }   
      // this.data = res.data;
    });
  }

}
