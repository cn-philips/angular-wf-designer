import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { FileService } from '../services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MdmUploadService {

  constructor(private http: HttpClient, private fileService: FileService) { }

  pushRuleFileToStorage(file: File): Observable<HttpEvent<{}>> {
    const formdata: FormData = new FormData();
    formdata.append('file', file);
 
    const url = '/act/masterdata/upload';
    const req = new HttpRequest('POST', this.fileService.getFullHref(url), formdata, {
      reportProgress: true,
      responseType: 'text'
    });

    return this.http.request(req);
  }

  pushMasterDataFileToStorage(file: File): Observable<HttpEvent<{}>> {
    const formdata: FormData = new FormData();
    formdata.append('file', file);
 
    const url = '/act/masterdata/upload';
    const req = new HttpRequest('POST', this.fileService.getFullHref(url), formdata, {
      reportProgress: true,
      responseType: 'text'
    });
 
    return this.http.request(req);
  }
 
  // getFiles(): Observable<any> {
  //   return this.http.get('/getallfiles');
  // }
}
