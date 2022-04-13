import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { APPLY_TYPE, APPLY_TYPE_MAP } from '../special-approval.constants'
import { SpecialApprovalService } from '../special-approval.service'

interface Template {
  name: string;
  typeIndex: number;
  type: string;
  typeName: string;
  item?: number;
  desc: string;
  minMon?: number;
  maxMon?: number;
  bg: string;
}

const MENU_ID = {
  SPECIAL_APPROVAL: '1606e61d-8c13-493b-9c54-169cdf0be84d',
  REQUEST: '164fa7ed-0cf8-45e9-9942-aa30afe30ef1',
  DRAFT: '312bf823-a05b-4ec7-90a9-b4b070a9928a',
  WAITING_APPROVE: 'aaee93a2-ed0a-4db9-9537-f72bb500c2fc',
  APPROVED: '2ed165ff-7ebf-4733-80e5-9d49836388e1',
  VIEW: '4c9bc88e-59a0-48ac-8b23-994f75cbff8d',
}

const activeTemplate = {
  [APPLY_TYPE.PRODUCTION]: true,
  [APPLY_TYPE.DELIVERY]: false,
  [APPLY_TYPE.EXT_INSTALL_COST]: false,
  [APPLY_TYPE.EXT_WARRANTY]: true
}

interface Card {
  id: string;
  total: number;
  list: Array<any>;
  title: string;
  path: string;
}

const DEFAULT_SEARCH_PARAMS = { pageNo: 1, pageSize: 3, orderByClause: 'createTime desc' }

@Component({
  selector: 'special-approval-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  acitveTemplateIndex: number = 0;

  allTemplateList: Template[] = []
  filteredTemplateList: Template[] = [];

  pageLoading = true

  cardList: Card[] = []

  reqTotalCount = 1

  reqSuccessCount = 0

  showQuickLink = false

  constructor(private router: Router, private spService: SpecialApprovalService) {}

  ngOnInit(): void {
    this.pageLoading = true
    
    this.initTemplateList()
    const menuList = JSON.parse(window.localStorage.getItem("menuList"))
    const spMenu = menuList.find(({ id }) => id === MENU_ID.SPECIAL_APPROVAL)
    if (spMenu) {
      spMenu.children.forEach(({ id }) => {
        switch(id) {
          case MENU_ID.REQUEST: // 我的申请
            this.reqTotalCount++
            this.cardList.push({ total: 0, list: [], title: '我的申请', id, path: 'request' })
            this.getRequestList()
            break
          case MENU_ID.DRAFT: // 我的草稿
            this.reqTotalCount++
            this.cardList.push({ total: 0, list: [], title: '我的草稿', id, path: 'draft'  })
            this.getDraftList()
            break
          case MENU_ID.WAITING_APPROVE: // 我的待办
            this.reqTotalCount++
            this.cardList.push({ total: 0, list: [], title: '我的待办', id, path: 'waiting-approve'  })
            this.getWaitingApproveList()
            break
          case MENU_ID.APPROVED: // 我的已办
            this.reqTotalCount++
            this.cardList.push({ total: 0, list: [], title: '我的已办', id, path: 'approved'  })
            this.getApprovedList()
            break
          case MENU_ID.VIEW: // 我可查看
            this.reqTotalCount++
            this.cardList.push({ total: 0, list: [], title: '我可查看', id, path: 'view'  })
            this.getViewList()
            break
        }
      })
    }
  }

  initTemplateList() {
    this.spService.getTemplateList().then((templateList) => {
      if (templateList.length > 0) {
        this.showQuickLink = true
      }

      const monthSet = new Set()
      this.allTemplateList = templateList.filter(({ applyType, minWarrantyMonths, maxWarrantyMonths }) => {
          if (activeTemplate[applyType]) {
            if (applyType === APPLY_TYPE.EXT_WARRANTY) {
              const month = `${minWarrantyMonths}-${maxWarrantyMonths}`
              if (monthSet.has(month)) {
                return false
              } else {
                monthSet.add(month)
                return true
              }
            }
            return true
          } else {
            return false
          }
        }).map(({ bg, applyType, applyItem, minWarrantyMonths, maxWarrantyMonths, remark }) => ({
          name: this.formatTemplateName({ applyType, applyItem, minWarrantyMonths, maxWarrantyMonths }),
          typeIndex: this.formatTypeIndex(applyType),
          type: applyType,
          typeName: APPLY_TYPE_MAP[applyType].label,
          item: applyType === APPLY_TYPE.PRODUCTION ? applyItem : null,
          desc: remark,
          bg,
          minMon: minWarrantyMonths,
          maxMon: maxWarrantyMonths,
        }))
        this.filteredTemplateList = this.allTemplateList
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
      }).catch(({ message }) => {
        console.error(`获取template列表失败, ${message}`);
        this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
      })
  }

  formatMonth(minWarrantyMonths, maxWarrantyMonths) {
    if (maxWarrantyMonths) {
      return maxWarrantyMonths
    } else {
      return minWarrantyMonths + 1
    }
  }

  formatTypeIndex(applyType) {
    switch(applyType) {
      case APPLY_TYPE.PRODUCTION:
        return 1
      case APPLY_TYPE.EXT_WARRANTY:
        return 2
    }
  }

  formatTemplateName({ applyType, applyItem, minWarrantyMonths, maxWarrantyMonths }) {
    if (applyType === APPLY_TYPE.PRODUCTION) {
      return this.formatApplyTypeItem({ applyType, applyItem })
    } else if (applyType === APPLY_TYPE.EXT_WARRANTY) {
      const prefix = APPLY_TYPE_MAP[applyType].label
      if (minWarrantyMonths > 0 && maxWarrantyMonths > 0) {
          return `${prefix}>${minWarrantyMonths - 1} month&≤${maxWarrantyMonths} month`
      } else if (minWarrantyMonths > 0) {
        return `${prefix}>${minWarrantyMonths - 1} month`
      } else {
        return `${prefix}≤${maxWarrantyMonths} month`
      }
    }
  }

  onFilterChange() {
    if (!this.acitveTemplateIndex) {
      this.filteredTemplateList = this.allTemplateList;
    } else {
      this.filteredTemplateList = this.allTemplateList.filter(({ typeIndex }) => typeIndex === this.acitveTemplateIndex);
    }
  }

  async getRequestList() {
    try {
      const { rows, total } = await this.spService.getRequestList(DEFAULT_SEARCH_PARAMS)
      this.cardList = this.cardList.map((card) => card.id === MENU_ID.REQUEST ? { ...card, list: rows, total } : card)
    } catch ({ message }) {
      console.error(`获取我的申请列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
    }
  }

  async getApprovedList() {
    try {
      const { rows, total } = await this.spService.getApprovedList(DEFAULT_SEARCH_PARAMS)
      this.cardList = this.cardList.map((card) => card.id === MENU_ID.APPROVED ? { ...card, list: rows, total } : card)
    } catch ({ message }) {
      console.error(`获取我的已办列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
    }
  }

  async getWaitingApproveList() {
    try {
      const { rows, total } = await this.spService.getWaitingApproveList(DEFAULT_SEARCH_PARAMS)
      this.cardList = this.cardList.map((card) => card.id === MENU_ID.WAITING_APPROVE ? { ...card, list: rows, total } : card)
    } catch ({ message }) {
      console.error(`获取我的待办列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
    }
  }

  async getViewList() {
    try {
      const { rows, total } = await this.spService.getViewList(DEFAULT_SEARCH_PARAMS)
      this.cardList = this.cardList.map((card) => card.id === MENU_ID.VIEW ? { ...card, list: rows, total } : card)
    } catch ({ message }) {
      console.error(`获取我可查看列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
    }
  }
 
  async getDraftList() {
    try {
      const { rows, total } = await this.spService.getDraftList(DEFAULT_SEARCH_PARAMS)
      this.cardList = this.cardList.map((card) => card.id === MENU_ID.DRAFT ? { ...card, list: rows, total } : card)
    } catch ({ message }) {
      console.error(`获取我的草稿列表失败, ${message}`);
    } finally {
      this.pageLoading = ++this.reqSuccessCount !== this.reqTotalCount
    }
  }

  onNavigateToNewRequest({ type, item, minMon, maxMon, bg }) {
    this.router.navigate(['/special-approval/new-request'], {
      queryParams: {
        type, 
        item,
        minMon,
        maxMon,
        bg,
      }
    })
  }

  onNavigateToListPage(path) {
    this.router.navigate([`/special-approval/${path}`])
  }

  formatApplyTypeItem({ applyType, applyItem }) {
    if (!applyType) { return '' }
    const { label, items } = APPLY_TYPE_MAP[applyType]
    const item = items.find(({ value }) => value == applyItem)
    if (item) {
      return `${label}-${item.label}`
    } else {
      return label
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ applyId, id, taskInstId }) {
    this.router.navigate(['/special-approval/request', applyId || id], {
      queryParams: { taskId: taskInstId }
    })
  }
}
