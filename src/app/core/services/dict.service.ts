import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Dict, ApiDict } from '../domain/dict';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class DictService {
  constructor(private http: HttpService) {}

  dictList: Dict[] = [];
  dictList$ = new BehaviorSubject<Dict[]>([])
  dictMap: { [key: string]: Dict[] } = {};

  public initDictList() {
    const uri = `/act/ecom/dictData/queryGroupDictData`;
    this.http.post(uri).subscribe((res) => {
      if ('0000' == res.code) {
        const data = res.data as ApiDict[];
        this.dictList = data.map(
          ({
            dictGroup,
            dictSort,
            dictId,
            dictLabel,
            dictValue,
            dictKey,
            listClass,
            dictType,
          }) => ({
            group: dictGroup,
            sort: dictSort,
            code: dictKey,
            label: dictValue,
            tag: dictLabel,
            value: dictId,
            class: listClass,
            type: dictType,
          })
        );
        this.dictList$.next(this.dictList)
      }
    });
  }

  getDictListByGroupName(groupName) {
    let dictList = this.dictMap[groupName];
    if (dictList && dictList.length > 0) {
      return dictList;
    } else {
      dictList = this.dictList
        .filter(({ group }) => group === groupName)
        .sort((left, right) => left.sort - right.sort);
      this.dictMap[groupName] = dictList;
      return dictList;
    }
  }

  getDictList(allDictList, groupName): Dict[] {
    if (allDictList.length === 0) { return [] }
    let dictList = this.dictMap[groupName];
    if (dictList && dictList.length > 0) {
      return dictList;
    } else {
      dictList = allDictList
        .filter(({ group }) => group === groupName)
        .sort((left, right) => left.sort - right.sort);
      this.dictMap[groupName] = dictList;
      return dictList;
    }
  }

  dictData(groupName): Observable<Dict[]> {
    return new Observable(subscriber => {
      this.dictList$.subscribe((dictList) => {
        subscriber.next(this.getDictList(dictList, groupName))
      })
    })
  }

  dictDatas(groupNames: string[]): Observable<Dict[][]> {
    return new Observable(subscriber => {
      this.dictList$.subscribe((dictList) => {
        const result = []
        groupNames.forEach(groupName => {
          const dictData = this.getDictList(dictList, groupName)
          result.push(dictData)
        })
        subscriber.next(result)
      })
    })
  }
}
