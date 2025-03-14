import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  templateUrl: "./sign.component.html",
  styleUrls: ["./sign.component.scss"],
})
export class SignComponent implements OnInit {
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {}

  public bestSignTemplateList: any = [];

  ngOnInit() {
    this.getBestSignTemplateList();
  }

  getBestSignTemplateList() {
    this.http
      .get("/act/contract-sign-template/bestSignTemplateList")
      .subscribe((res) => {
        const { code, data, msg } = res;
        if (code === "0000") {
          this.bestSignTemplateList = data;
        }
      });
  }
}
