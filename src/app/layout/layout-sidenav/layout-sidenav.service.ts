import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// export interface TblFunction {
//     id? : number;
//     name: string;
//     url: string;
//     type: string;
//     comment: string;
// }

@Injectable({
  providedIn: 'root'
})
export class LayoutSidenavService {

  constructor() {}

//   getDynamicSidenavMenu() : Observable<TblFunction>{
//       console.log(123);
//   }

//   pushFileToStorage(file: File): Observable<HttpEvent<{}>> {
//     const formdata: FormData = new FormData();
//     formdata.append('file', file);

//     const req = new HttpRequest('POST', '/act/masterdata/upload', formdata, {
//       reportProgress: true,
//       responseType: 'text'
//     });

//     return this.http.request(req);
//   }


  // getFiles(): Observable<any> {
  //   return this.http.get('/getallfiles');
  // }
}
