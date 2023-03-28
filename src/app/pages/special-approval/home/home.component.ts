import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { APPLY_TYPE, APPLY_TYPE_MAP } from "../special-approval.constants";
import { SpecialApprovalService } from "../special-approval.service";
import { DictService } from "@core/services/dict.service";

interface Template {
  name: string;
  typeIndex: number;
  type: string;
  typeName: string;
  item?: number;
  desc: string;
  bg: string;
}

const MENU_ID = {
  SPECIAL_APPROVAL: "1606e61d-8c13-493b-9c54-169cdf0be84d",
  REQUEST: "164fa7ed-0cf8-45e9-9942-aa30afe30ef1",
  DRAFT: "312bf823-a05b-4ec7-90a9-b4b070a9928a",
  WAITING_APPROVE: "aaee93a2-ed0a-4db9-9537-f72bb500c2fc",
  APPROVED: "2ed165ff-7ebf-4733-80e5-9d49836388e1",
  VIEW: "4c9bc88e-59a0-48ac-8b23-994f75cbff8d",
};

interface Card {
  id: string;
  total: number;
  list: Array<any>;
  title: string;
  path: string;
}

interface Tab {
  title: string;
  value: string;
}

const DEFAULT_SEARCH_PARAMS = {
  pageNo: 1,
  pageSize: 3,
  orderByClause: "createTime desc",
};

@Component({
  selector: "special-approval-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  allTemplateList: Template[] = [];
  filteredTemplateList: Template[] = [];

  pageLoading = true;

  cardList: Card[] = [];

  reqTotalCount = 1;

  reqSuccessCount = 0;

  showQuickLink = false;

  tabList: Tab[] = [];

  sharePointLinkList: any = [];

  constructor(
    private router: Router,
    private spService: SpecialApprovalService,
    private dictService: DictService
  ) {}

  ngOnInit(): void {
    this.pageLoading = true;

    this.initTemplateList();
    this.initToSharepointLink();
    const menuList = JSON.parse(window.localStorage.getItem("menuList"));
    const spMenu = menuList.find(({ id }) => id === MENU_ID.SPECIAL_APPROVAL);
    if (spMenu) {
      spMenu.children.forEach(({ id }) => {
        switch (id) {
          case MENU_ID.REQUEST: // 我的申请
            this.reqTotalCount++;
            this.cardList.push({
              total: 0,
              list: [],
              title: "我的申请",
              id,
              path: "request",
            });
            this.getRequestList();
            break;
          case MENU_ID.DRAFT: // 我的草稿
            this.reqTotalCount++;
            this.cardList.push({
              total: 0,
              list: [],
              title: "我的草稿",
              id,
              path: "draft",
            });
            this.getDraftList();
            break;
          case MENU_ID.WAITING_APPROVE: // 我的待办
            this.reqTotalCount++;
            this.cardList.push({
              total: 0,
              list: [],
              title: "我的待办",
              id,
              path: "waiting-approve",
            });
            this.getWaitingApproveList();
            break;
          case MENU_ID.APPROVED: // 我的已办
            this.reqTotalCount++;
            this.cardList.push({
              total: 0,
              list: [],
              title: "我的已办",
              id,
              path: "approved",
            });
            this.getApprovedList();
            break;
          case MENU_ID.VIEW: // 我可查看
            this.reqTotalCount++;
            this.cardList.push({
              total: 0,
              list: [],
              title: "我可查看",
              id,
              path: "view",
            });
            this.getViewList();
            break;
        }
      });
    }
  }

  initTemplateList() {
    this.spService
      .getTemplateList()
      .then((templateList) => {
        if (templateList.length > 0) {
          this.showQuickLink = true;
        }

        const tabSet = new Set();
        const applyTypeItemMap = new Map<string, Set<string>>();
        this.allTemplateList = templateList
          .filter(({ applyType, applyItem }) => {
            if (!applyType || !APPLY_TYPE_MAP[applyType]) {
              return false;
            }
            // 筛去相同applyType和applyItem的数据
            const applyItemSet = applyTypeItemMap.get(applyType);
            if (applyItemSet) {
              if (applyItemSet.has(applyItem)) {
                return false;
              } else {
                applyItemSet.add(applyItem);
                return true;
              }
            } else {
              applyTypeItemMap.set(applyType, new Set<string>().add(applyItem));
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
              name: this.formatApplyTypeItem({ applyType, applyItem }),
              type: applyType,
              typeName: APPLY_TYPE_MAP[applyType].label,
              item: applyItem,
              desc: remark,
              bg,
              role: applyNodeApproveRole
            };
          });
        this.filteredTemplateList = this.allTemplateList;
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
      })
      .catch(({ message }) => {
        console.error(`获取template列表失败, ${message}`);
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
      });
  }

  initToSharepointLink() {
    var userRoleList = JSON.parse(window.localStorage.getItem("roles"));
    this.sharePointLinkList = this.dictService
      .getDictListByGroupName("SP_SHAREPOINT_LINK")
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
      });
  }

  onFilterChange(tab: Tab) {
    this.filteredTemplateList = this.allTemplateList.filter(
      ({ type }) => type === tab.value
    );
  }

  async getRequestList() {
    try {
      const { rows, total } = await this.spService.getRequestList(
        DEFAULT_SEARCH_PARAMS
      );
      this.cardList = this.cardList.map((card) =>
        card.id === MENU_ID.REQUEST ? { ...card, list: rows, total } : card
      );
    } catch ({ message }) {
      console.error(`获取我的申请列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
    }
  }

  async getApprovedList() {
    try {
      const { rows, total } = await this.spService.getApprovedList(
        DEFAULT_SEARCH_PARAMS
      );
      this.cardList = this.cardList.map((card) =>
        card.id === MENU_ID.APPROVED ? { ...card, list: rows, total } : card
      );
    } catch ({ message }) {
      console.error(`获取我的已办列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
    }
  }

  async getWaitingApproveList() {
    try {
      const { rows, total } = await this.spService.getWaitingApproveList(
        DEFAULT_SEARCH_PARAMS
      );
      this.cardList = this.cardList.map((card) =>
        card.id === MENU_ID.WAITING_APPROVE
          ? { ...card, list: rows, total }
          : card
      );
    } catch ({ message }) {
      console.error(`获取我的待办列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
    }
  }

  async getViewList() {
    try {
      const { rows, total } = await this.spService.getViewList(
        DEFAULT_SEARCH_PARAMS
      );
      this.cardList = this.cardList.map((card) =>
        card.id === MENU_ID.VIEW ? { ...card, list: rows, total } : card
      );
    } catch ({ message }) {
      console.error(`获取我可查看列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
    }
  }

  async getDraftList() {
    try {
      const { rows, total } = await this.spService.getDraftList(
        DEFAULT_SEARCH_PARAMS
      );
      this.cardList = this.cardList.map((card) =>
        card.id === MENU_ID.DRAFT ? { ...card, list: rows, total } : card
      );
    } catch ({ message }) {
      console.error(`获取我的草稿列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount;
    }
  }

  onNavigateToNewRequest({ type, item, bg, role }) {
    this.router.navigate(["/special-approval/new-request"], {
      queryParams: { type, item, bg, role },
    });
  }

  onNavigateToListPage(path) {
    this.router.navigate([`/special-approval/${path}`]);
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

  // 跳转到申请详情
  onNavigateToRequestDetail({ applyId, id, taskInstId }, { title }) {
    this.router.navigate(["/special-approval/request", applyId || id], {
      queryParams: { taskId: title === '我的待办' ? taskInstId : null },
    });
  }

  // 打开SharePoint链接
  linkToSharepoint(url) {
    window.open(url, "_blank");
  }
}
