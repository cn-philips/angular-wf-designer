import { Component, ElementRef, OnInit, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../services';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'approval-diagram',
  templateUrl: './approval-diagram.component.html',
  styleUrls: ['./approval-diagram.component.scss']
})
export class ApprovalDiagramComponent implements OnInit {

  @Input()
  diagramType: string;
  @Input()
  componentParams: Object = {};

  diagramImage: any;
  isImageLoading: boolean = true;


  constructor(private http: HttpService,
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer) {
    this.isImageLoading = true;
  }

  ngOnInit() {
    // console.log('diagramType->' + this.diagramType);
    // console.log(this.componentParams);
    if(this.diagramType == 'processDefinitionDiagram') {
      const processDefinitionId = this.componentParams['processDefinitionId'];

      const uri = '/act' + '/task/viewProcessDefinitionDiagram/' + processDefinitionId;
      this.getDiagramImage(uri);

    } else if(this.diagramType == 'processInstanceDiagram') {
      const processInstanceId = this.componentParams['processInstanceId'];

      const uri = '/act' + '/task/viewProcessInstanceDiagram/' + processInstanceId;
      this.getDiagramImage(uri);

    }
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.diagramImage = reader.result;
    }, false);

    if (image) {
       reader.readAsDataURL(image);
    }
 }

 getDiagramImage(uri) {
  this.isImageLoading = true;

  this.http.getImage(uri).subscribe(data => {
    this.createImageFromBlob(data);
    this.isImageLoading = false;
  }, error => {
    this.isImageLoading = false;
    console.log(error);
  });
}

}
