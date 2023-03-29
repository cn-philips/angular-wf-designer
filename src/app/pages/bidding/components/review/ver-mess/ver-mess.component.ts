import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';
import { decodeString } from '@core/util/tools';

@Component({
  selector: 'app-ver-mess',
  templateUrl: './ver-mess.component.html',
  styleUrls: ['./ver-mess.component.scss']
})
export class VerMessComponent implements OnInit {

  public messList: any = [];

  constructor(
    public activatedRouter: ActivatedRoute,
    private http: HttpService,
  ) { }


  ngOnInit() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.http.post(`/act/ecom/tender/application/getTenderApproved?mainId=${mainId}`).subscribe(rest => {
      if (rest && rest.data) {
        if (rest.data.changeOpportunity == true || rest.data.changeOpportunity === 'true') {
          this.messList.push('Opportunity');
        }
        if (rest.data.changeBusinessType == true || rest.data.changeBusinessType === 'true') {
          this.messList.push('业务模式');
        }
        if (rest.data.changeProduct == true || rest.data.changeProduct === 'true') {
          this.messList.push('产品');
        }
        if (rest.data.changeSupResult == true || rest.data.cangeSupResult === 'true') {
          this.messList.push('物流审批条款');
        }
        if (rest.data.changeQaResult == true || rest.data.changeQaResult === 'true') {
          this.messList.push('投标保证金及履约保证金额');
        }
        if (rest.data.changeMarResult == true || rest.data.changeMarResult === 'true') {
          this.messList.push('技术条款');
        }
        if (rest.data.changeFinResult == true || rest.data.changeFinResult === 'true') {
          this.messList.push('付款方式');
        }
        if (rest.data.changeProResult == true || rest.data.changeProResult === 'true') {
          this.messList.push('售后维修条款');
        }
        if (rest.data.changeLawResult == true || rest.data.changeLawResult === 'true') {
          this.messList.push('涉及法律条款');
        }
      }
    });
  }

}
