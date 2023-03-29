import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DictService } from "@core/services";
import { BiddingApprovalEntriesComponent } from "./components/bidding-approval-entries/bidding-approval-entries.component";
import { OrderApprovalEntriesComponent } from "./components/order-approval-entries/order-approval-entries.component";
import { PrebookApprovalEntriesComponent } from "./components/prebook-approval-entries/prebook-approval-entries.component";
import { SpecialApprovalEntriesComponent } from "./components/special-approval-entries/special-approval-entries.component";
@Component({
  selector: "app-approval-dialog",
  templateUrl: "./approval-dialog.component.html",
  styleUrls: ["./approval-dialog.component.scss"],
})
export class ApprovalDialogComponent implements OnInit {
  @Input("type")
  type: string = "sp";
  @Input("backgroundColor")
  backgroundColor: string = "#FF7F97";
  title: string = "sp";
  isVisible: boolean = false;
  @ViewChild("sp")
  sp: SpecialApprovalEntriesComponent;
  @ViewChild("bidding")
  bidding: BiddingApprovalEntriesComponent;
  @ViewChild("order")
  order: OrderApprovalEntriesComponent;
  @ViewChild("prebook")
  prebook: PrebookApprovalEntriesComponent;
  sharePointLinkList: any = [];
  constructor(private dictService: DictService,
    private router: Router,) {}

  ngOnInit(): void {
  }
  get hasMenus() {
    let result = false;
    if (this.sp) result = this.sp.hasMenus;
    // if (this.bidding) result = this.bidding.hasMenus;
    // if (this.order) result = this.order.hasMenus;
    return result;
  }
  public show(dialog) {
    this.title = dialog || this.title;
    this.initToSharepointLink();
    this.isVisible = true;
  }
  public hide() {
    if (this.sp) this.sp.reset();
    if (this.bidding) this.bidding.reset();
    if (this.prebook) this.prebook.reset();
    if (this.order) this.order.reset();
    this.isVisible = false;
  }
  public handleSharePoint(url) {
    window.open(url, "_blank");
  }
  initToSharepointLink() {
    var userRoleList = JSON.parse(window.localStorage.getItem("roles"));
    this.dictService.dictData("SP_SHAREPOINT_LINK").subscribe((dictData) => {
      this.sharePointLinkList = dictData
        .map((item) => {
          const [label, hint] = item.tag.split(";");
          const dictTypeList = item.type.split(";");
          let show = false;
          const roles = userRoleList.filter((item) =>
            dictTypeList.includes(item)
          );
          if (roles.length > 0) {
            show = true;
          }
          return {
            ...item,
            label,
            value: item.label, //url
            isShow: show,
            hint,
          };
        })
        .filter((i) => i.isShow);
    });
  }
  navigateToCP1() {
    switch (this.type) {
      case "bid":
        this.router.navigate(["/bidding"]);
        break;
      case "order":
        this.router.navigate(["/pre-order"]);
        break;
      case "prebook":
        this.router.navigate(["/pre-book"]);
        break;
    }
  }
  navigateToCP2() {
    switch (this.type) {
      case "bid":
        this.router.navigate(["/bidding-v3"]);
        break;
      case "order":
        this.router.navigate(["/order-v3"]);
        break;
      case "prebook":
        this.router.navigate(["/prebook-v3"]);
        break;
    }
  }
}
