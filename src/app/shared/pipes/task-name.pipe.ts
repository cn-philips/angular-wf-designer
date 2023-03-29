import { Pipe, PipeTransform } from "@angular/core";
import { DictService } from "@core/services/index";
import { BehaviorSubject, Observable } from "rxjs";

@Pipe({
  name: "TaskNamePipe",
})
export class TaskNamePipe implements PipeTransform {
  dataLoaded$ = new BehaviorSubject<Boolean>(false);

  constructor(private dictService: DictService) {
    this.dictService.dictData("TASK_VIEW_ECOS").subscribe((data) => {
      data.forEach((item) => {
        this.dictMap.set(item.code, item.label);
      });
      this.dataLoaded$.next(true);
    });
  }

  dictMap = new Map<string, string>();

  transform(value: any, args?: any): Observable<string> {
    if (value !== null && value !== undefined && value !== "") {
      return new Observable((subscriber) => {
        this.dataLoaded$.subscribe((loaded) => {
          if (loaded) {
            const taskName = this.dictMap.get(value) || "";
            subscriber.next(taskName);
          }
        });
      });
    } else {
      return null;
    }
  }
}
