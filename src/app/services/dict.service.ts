import { Injectable } from "@angular/core";
import { Dict, ApiDict } from "../domian/tbl_dict";
import { HttpService } from "./http.service";

@Injectable({
  providedIn: "root",
})
export class DictService {
  constructor(private http: HttpService) {}

  dictList: Dict[] = [];

  dictMap: { [key: string]: Dict[] } = {};

  public initDictList() {
    const uri = `/act/ecom/dictData/queryGroupDictData`;
    this.http.post(uri).subscribe((res) => {
      if ("0000" == res.code) {
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
}
