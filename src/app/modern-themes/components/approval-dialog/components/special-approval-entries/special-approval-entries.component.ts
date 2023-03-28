import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { TabsComponent } from "@app/modern-themes/components/tabs/tabs.component";
import { DictService } from "@core/services";
import { APPLY_TYPE, APPLY_TYPE_MAP } from "@pages/special-approval/special-approval.constants";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";

interface Template {
  name: string;
  typeIndex: number;
  type: string;
  typeName: string;
  item?: number;
  sample?: string;
  desc: string;
  bg: string;
  path?: string;
}

interface Tab {
  title: string;
  value: string;
}

@Component({
  selector: "app-special-approval-entries",
  templateUrl: "./special-approval-entries.component.html",
  styleUrls: ["./special-approval-entries.component.scss"],
})
export class SpecialApprovalEntriesComponent implements OnInit {
  // @Input("type")
  // type: string = "sp";
  @Input("backgroundColor")
  backgroundColor: string = "#FF7F97";
  @ViewChild("tabs")
  tabs: TabsComponent;
  isVisible: boolean = false;
  index = 0;

  allTemplateList: Template[] = [];
  filteredTemplateList: Template[] = [];
  tabList: Tab[] = [];

  reqTotalCount = 1;
  reqSuccessCount = 0;
  pageLoading = true;
  showQuickLink = false;

  constructor(
    private router: Router,
    private spService: SpecialApprovalService,
    private dictService: DictService
  ) {}
  get hasMenus() {
    return this.allTemplateList.length > 0;
  }

  ngOnInit(): void {
    this.pageLoading = true;

    this.initTemplateList();
  }
  initTemplateList() {
    // if (this.type === "sp") {
    this.spService
      .getTemplateList()
      .then((templateList) => {
        if (templateList.length > 0) {
          this.showQuickLink = true;
        }

        const tabSet = new Set();
        const applyTypeItemMap = new Map<string, Set<string>>();
        this.allTemplateList = templateList
          .filter(({ applyType, applyItem, bg }) => {
            if (applyType === APPLY_TYPE.LOGISTICSCOST) {
              return true;
            }
            if (!applyType || !APPLY_TYPE_MAP[applyType]) {
              return false;
            }
            // 筛去相同applyType和applyItem的数据
            const applyItemSet = applyTypeItemMap.get(applyType);
            if (applyItemSet) {
              if (applyItemSet.has(bg + applyItem)) {
                return false;
              } else {
                applyItemSet.add(bg + applyItem);
                return true;
              }
            } else {
              applyTypeItemMap.set(applyType, new Set<string>().add(bg + applyItem));
              return true;
            }
          })
          .map(({ bg, applyType, applyItem, remark, applyNodeApproveRole }) => {
            if (!tabSet.has(applyType)) {
              this.tabList.push({
                title: APPLY_TYPE_MAP[applyType].label,
                value: applyType,
              });
              tabSet.add(applyType);
            }
            return {
              name: `${this.formatApplyTypeItem({ applyType, applyItem })}(适用于${bg})`,
              type: applyType,
              typeName: APPLY_TYPE_MAP[applyType].label,
              item: applyItem,
              desc: remark,
              bg,
              role: applyNodeApproveRole,
            };
          });
        this.filteredTemplateList = Object.assign([], this.allTemplateList);
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
      })
      .catch(({ message }) => {
        console.error(`获取template列表失败, ${message}`);
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
      });
    // }
    // if (this.type === "bid") {
    //   this.filteredTemplateList = [
    //     {
    //       name: "导入<span style='color:var(--COLOR_PRIMARY);'>CP1</span>数据发起",
    //       typeIndex: 1,
    //       type: "string",
    //       typeName: "string",
    //       item: 1,
    //       sample: "我的deal form ID/Simulation ID形如2132",
    //       desc: "CP1 deal form/Simulation ID:纯数字",
    //       bg: "string",
    //       path: "bidding/apply-tender",
    //     },
    //     {
    //       name: "导入<span  style='color:var(--COLOR_PRIMARY);'>CP2</span>数据发起",
    //       typeIndex: 2,
    //       type: "string",
    //       typeName: "string",
    //       item: 1,
    //       sample:
    //         "我的deal form ID/Simulation ID形如 D-202208000007, S-MR-202207000157",
    //       desc: `CP2 deal form ID/Simulation ID:D/S-BMC-YYYYMM（年月）-5位顺序号`,
    //       bg: "string",
    //       path: "bidding-v3",
    //     },
    //   ];
    // }
    // if (this.type === "order") {
    //   this.filteredTemplateList = [
    //     {
    //       name: "导入<span style='color:var(--COLOR_PRIMARY);'>CP1</span>数据发起",
    //       typeIndex: 1,
    //       type: "string",
    //       typeName: "string",
    //       item: 1,
    //       sample: "我的deal form ID形如2132",
    //       desc: "CP1 deal form:纯数字",
    //       bg: "string",
    //       path: "pre-order",
    //     },
    //     {
    //       name: "导入<span style='color:var(--COLOR_PRIMARY);'>CP2</span>数据发起",
    //       typeIndex: 2,
    //       type: "string",
    //       typeName: "string",
    //       item: 1,
    //       sample: "我的deal form ID形如D-202208000007",
    //       desc: "CP2 deal form ID:D-BMC-YYYYMM（年月）-5位顺序号",
    //       bg: "string",
    //       path: "order-v3",
    //     },
    //   ];
    // }
  }
  formatApplyTypeItem({ applyType, applyItem = "" }) {
    const { label } = APPLY_TYPE_MAP[applyType];
    const items = this.spService.getApplyItems(applyType) || [];
    const item = items.find(({ value }) => value == applyItem);
    if (item) {
      return `${label}-${item.label}`;
    } else {
      return label;
    }
  }
  onFilterChange(tab: Tab) {
    this.filteredTemplateList.splice(0);
    this.allTemplateList
      .filter(({ type }) => type === tab.value)
      .map((i) => {
        this.filteredTemplateList.push(i);
      });
  }
  onNavigateToNewRequest({ type, item, bg, role }) {
    this.router.navigate(["/special-approval/new-request"], {
      queryParams: { type, item, bg, role },
    });
  }
  handleTo(path) {
    this.router.navigate([path]);
  }
  public reset() {
    this.tabs.active(0);
  }
}
