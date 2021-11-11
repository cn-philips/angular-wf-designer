import {Component, Input, OnInit} from '@angular/core';
import {HttpService} from '../services';


@Component({
  selector: 'approval-flowline',
  templateUrl: './approval-flowline.component.html',
  styleUrls: ['./approval-flowline.component.scss']
})
export class ApprovalFlowlineComponent implements OnInit {

  @Input()
  diagramType: string;
  @Input()
  componentParams: Object = {};

  listStep: any[];


  constructor(private http: HttpService) {
  }

  ngOnInit() {
    let id;
    if (this.diagramType == 'processDefinitionDiagram') {
      id = this.componentParams['processDefinitionId'];
    } else if (this.diagramType == 'processInstanceDiagram') {
      id = this.componentParams['processInstanceId'];
    }
    this.http.get(`/act/task/getTaskFlowInfo/${id}`).subscribe(res => {
      if (res.code === '0000') {
        this.listStep = res.data;
      }
    });
  }

}
