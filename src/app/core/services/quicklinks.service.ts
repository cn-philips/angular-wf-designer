import { Injectable } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { HttpService } from "./http.service";

@Injectable({
  providedIn: "root",
})
export class QuickLinksService {
  constructor(private http: HttpService, private message: NzMessageService) {}
  public async initLinks(): Promise<any[]> {
    const params = {
      dictGroup: "LINK_QUICK_LINK",
    };
    return new Promise<any[]>((res, rej) => {
      this.http
        .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
        .subscribe((rest) => {
          if (rest.code === "0000") {
            res(rest.data);
          } else {
            rej(rest.msg);
            this.message.create("error", `${rest.msg}`);
          }
        });
    });
  }
}
