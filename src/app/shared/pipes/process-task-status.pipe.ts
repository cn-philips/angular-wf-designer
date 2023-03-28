import { Pipe, PipeTransform } from "@angular/core";
import { DictService } from "@core/services/index";
import { BehaviorSubject, Observable } from "rxjs";

@Pipe({
  name: "ProcessTaskStatusPipe",
})
export class ProcessTaskStatusPipe implements PipeTransform {
  dataLoaded$ = new BehaviorSubject<Boolean>(false);

  constructor(private dictService: DictService) {
    this.dictService.dictData("NODE_ECOS").subscribe((data) => {
      data.forEach((item) => {
        this.dictMap.set(item.code, item.label);
      });
      this.dataLoaded$.next(true);
    });
  }

  dictMap = new Map();

  getProcessStatusLabel(statusList, statusCode) {
    const status = statusList.find(({ code }) => code === statusCode);
    return status ? status.label : "";
  }

  transform(value: any, args?: any): Observable<string> {
    if (value !== null && value !== undefined && value !== "") {
      return new Observable((subscriber) => {
        this.dataLoaded$.subscribe((loaded) => {
          if (loaded) {
            const processStatusLabel = this.dictMap.get(value) || "";
            subscriber.next(processStatusLabel);
          }
        });
      });
    } else {
      return null;
    }
  }
}
