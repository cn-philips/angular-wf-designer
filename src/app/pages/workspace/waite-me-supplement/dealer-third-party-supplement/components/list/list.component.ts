import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { Router } from "@angular/router";
import { DictService, HttpService } from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "dealer-third-party-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class DealerThirdPartyListComponent implements OnInit {
  @Input() tableData = [];
  @Input() total = 0;
  @Input() loading: any = false;
  @Input() type: any;
  @Input() flag: any;
  @Input() isHandle = 0;
  @Input() randomStatus = []

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  public userList = [];
  public entryModeList = [];
  public isOAAdmin = false
  public isAuditor = false

  constructor(
    private router: Router,
    private message: NzMessageService,
  ) {}

  ngOnInit() {
    const roleList = JSON.parse(localStorage.getItem("roles"));
    this.isOAAdmin = roleList.includes("OA Admin")
  }

  //重置分页
  resetPage() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
  }

  operate(data: any) {
    const url = "/order-v3/editRandomCycle";
    this.router.navigate([url], {
      queryParams: {
        id: data.id,
        type: 'edit',
      },
    });
  }

  changePageIndex(pageNo: number) {
    if (pageNo == 0) {
      pageNo = 1;
    }
    this.pageParams.pageNo = pageNo;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  changePageSize(pageSize: number) {
    // console.log('pageSize', pageSize);
    this.pageParams.pageSize = pageSize;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  transferStatus(value) {
    const label = this.randomStatus.filter(item => item.value === value).map(obj => obj.label)[0]
    return label ? label : '-'
  }

}
