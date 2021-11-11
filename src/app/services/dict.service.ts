import {Inject, Injectable} from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import {TblDict} from '../domian';
import {HttpService} from './http.service';

@Injectable()
export class DictService {
  constructor(@Inject('BASE_CONFIG') private config,
  private http: HttpService) {
    
  }

  dictList: TblDict[] = [];

  // getDictListByPid(pid:string, opt:string): Observable<TblDict[]> {
    // const uri = `/act/dict/query?pid=`+pid;
    // if('0'==opt){
      // this.dictList.unshift({name:'--请选择--', value:''} as TblDict);
    // }
    // this.http.get(uri).subscribe(res =>{
    //   if('0000' == res.code) {
    //      res.data.map(res => res.json() as TblDict[]);
    //   }
    //   return this.dictList;
    // });
    // this.http.get(uri);

    // console.log(this.dictList);
    // return this.dictList;
  // }
}