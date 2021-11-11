import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {DatePipe} from '@angular/common';

// @Injectable()
@Injectable({
  providedIn: 'root'
})
export class FileService {
  base_href = environment.base_href;
  progress: number = 0;
  progressSubject = new Subject();
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  // ngUnsubscribe: Subject<void> = new Subject<void>();


  constructor(private http: HttpService, private httpClient: HttpClient, private datePipe: DatePipe) {

  }

  uploadFileByFormData(url: string, formData?: FormData, successCallBack?: (res?: any) => any, errorCallBack?: (res?: any) => any): void {
    const req = new HttpRequest('POST', this.getFullHref(url), formData, {
      reportProgress: true
    });
    this.httpClient.request(req).subscribe(event => {
      if (event instanceof HttpResponse) {
        const res: any = event.body;
        if ('0000' == res.code) {
          console.log('execute success callback');
          successCallBack && successCallBack(res);
        } else {
          errorCallBack && errorCallBack(res);
        }
      }
    }, errorHandler => {
      errorCallBack && errorCallBack(errorHandler);
    });
  }


  uploadFile(url: string, dataMap?: any, successCallBack?: (res?: any) => any, errorCallBack?: (res?: any) => any): void {
    // this.ngUnsubscribe.complete();
    const formData: FormData = new FormData();
    if (dataMap) {
      for (let key in dataMap) {
        formData.append(key, dataMap[key]);
      }
    }
    const req = new HttpRequest('POST', this.getFullHref(url), formData, {
      reportProgress: true
    });
    this.httpClient.request(req).pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event instanceof HttpResponse) {
        const res: any = event.body;
        if ('0000' == res.code) {
          console.log('execute success callback');
          successCallBack && successCallBack(res);
        } else {
          errorCallBack && errorCallBack(res);
        }
        this.progress = 0;
        this.progressSubject.next(this.progress);
      } else if (event.type == HttpEventType.UploadProgress) {
        // console.log('uploading...');
        // console.log('total: ' + event.total);
        // console.log('Upload progress: ', Math.round(event.loaded / event.total * 100) + '%');
        this.progress = Math.round(event.loaded / event.total * 100);
        this.progressSubject.next(this.progress);
      }
    }, errorHandler => {
      errorCallBack && errorCallBack(errorHandler);
      this.progress = 0;
      this.progressSubject.next(this.progress);
    });
  }

  cancelUploading() {
    this.ngUnsubscribe.next();
    this.progress = 0;
    this.progressSubject.next(this.progress);
  }


  base64ToArrayBuffer(base64) {
    console.log('base64ToArrayBuffer', base64);
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  //get file name without extension
  splitFileName(text) {
    let temp = text ? text.substring(0, text.lastIndexOf('.')) : '';
    return text ? ((temp === '') ? text : temp) : '';
  }

  /**
   * 获取最终url
   * @param url 后台接口api
   * @param data 参数
   */
  public getFullHref(path: string): string {
    let fullhref: string;
    if (path.startsWith('/')) {
      fullhref = this.base_href + path;
    } else {
      fullhref = this.base_href + '/' + path;
    }
    return fullhref;
  }


/**
 * 简单校验文件后缀类型
 * @param file
 * @param validExtensions
 */
  fileExtensionValidator(file: File, validExtensions: string[]): boolean {
    let result = false;
    const sFileName = file.name;

    for (var i = 0; i < validExtensions.length; i++) {
      var sCurExtension = validExtensions[i];
      if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        result = true;
        break;
      }
    }

    // if (!blnValid) {
    // alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
    // return false;
    // }

    return result;
  }

  public downloadResponse(fileNamePrefix: string, res: any) {
    // const contentType2 = 'text/csv'; 下载类型：csv
    const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const objectUrl = URL.createObjectURL(blob);
    // 打开新窗口方式进行下载
    // window.open(url);

    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    const fileName = this.datePipe.transform(new Date(), 'yyyyMMddHHmmss');
    a.href = objectUrl;
    a.download = fileNamePrefix + '-' + fileName + '.xlsx';
    a.click();
    window.URL.revokeObjectURL(objectUrl);
  }

}
