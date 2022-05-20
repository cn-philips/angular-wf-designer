const DEFAULT_SUCCESS_MESSAGE = "操作成功";
const SUCCESS_MESSAGE = {
  DELETE_DRAFT: "删除成功",
  CANCEL_REQUEST: "取消成功",
  WITHDRAW_REQUEST: "撤回成功",
  SUBMIT: "提交成功",
  SAVE_DRAFT: "保存成功",
  FEEDBACK: "反馈成功",
  APPROVE: "审批成功",
};

const DEFAULT_LOADING_MESSAGE = "正在加载...";
const LOADING_MESSAGE = {
  DELETE_DRAFT: "正在删除...",
  CANCEL_REQUEST: "正在取消...",
  WITHDRAW_REQUEST: "正在撤回..",
  SUBMIT: "正在提交...",
  SAVE_DRAFT: "正在保存...",
  FEEDBACK: "正在提交...",
  APPROVE: "正在提交...",
};

const DEFAULT_ERROR_MESSAGE = "数据加载失败, 请稍候重试";
const ERROR_MESSAGE = {
  DELETE_DRAFT: "删除失败, 请稍候重试",
  CANCEL_REQUEST: "取消失败, 请稍候重试",
  WITHDRAW_REQUEST: "撤回失败, 请稍候重试",
  SUBMIT: "提交失败, 请稍候重试",
  SAVE_DRAFT: "保存失败, 请稍候重试",
  FEEDBACK: "反馈失败, 请稍候重试",
  APPROVE: "审批失败, 请稍候重试",
};

enum BUSINESS_MODEL {
  DIRECT_DEAL = "direct",
  DISTRIBUTOR_DEAL = "distributor",
}

const BUSINESS_MODEL_MAP = {
  [BUSINESS_MODEL.DIRECT_DEAL]: "Direct Deal",
  [BUSINESS_MODEL.DISTRIBUTOR_DEAL]: "Distributor Deal",
};

const BUSINESS_MODEL_LIST = [
  { label: "Direct Deal", value: BUSINESS_MODEL.DIRECT_DEAL },
  { label: "Distributor Deal", value: BUSINESS_MODEL.DISTRIBUTOR_DEAL },
];

const APPLY_TYPE = {
  PRODUCTION:  "production",
  EXT_WARRANTY: "warranty",
  EXT_INSTALL_COST: "installcost",
  LOGISTICSCOST: "logisticscost",
  LC_AMENDMENT: "lcamendment",
  RDD_OIT: 'rddoit180reserv',
  MACHINE_EXCHANGE: "machineexchange",
  TRANSFER_LIB: "transferlib",
  CANCEL_ORDER: "cancelorder",
  SPECIAL_DELIVERY:"delivery", //特批发货
}

const APPLY_TYPE_MAP = {
  [APPLY_TYPE.PRODUCTION]: { label: "特批开始生产", dictGroup: 'sp_production_apply_item' },
  [APPLY_TYPE.EXT_WARRANTY]: { label: '延长保修', dictGroup: 'sp_warranty_apply_item' },
  [APPLY_TYPE.EXT_INSTALL_COST]: { label: "额外安装费用及其他", dictGroup: 'sp_installcost_apply_item' },
  [APPLY_TYPE.LOGISTICSCOST]: { label: "物流运输", dictGroup: 'sp_logisticscost_apply_item' },
  [APPLY_TYPE.LC_AMENDMENT]: { label: "LC Amendments申请", dictGroup: 'sp_lcamendment_apply_item' },
  [APPLY_TYPE.RDD_OIT]: { label: "RDD-OIT>180天订单保留", dictGroup: 'sp_rddoit180reserv_apply_item' },
  [APPLY_TYPE.MACHINE_EXCHANGE]: { label: "机器互换", dictGroup: 'sp_machineexchange_apply_item' },
  [APPLY_TYPE.TRANSFER_LIB]: { label: "转库", dictGroup: 'sp_transferlib_apply_item' },
  [APPLY_TYPE.CANCEL_ORDER]: { label: "Cancel Order申请", dictGroup: 'sp_cancelorder_apply_item' },
  [APPLY_TYPE.SPECIAL_DELIVERY]: { label: "特批发货", dictGroup: 'sp_delivery_apply_item' },
};


const APPLY_TYPES = [
  { label: "特批开始生产", value: APPLY_TYPE.PRODUCTION },
  { label: "延长保修", value: APPLY_TYPE.EXT_WARRANTY },
  { label: "额外安装费用及其他", value: APPLY_TYPE.EXT_INSTALL_COST },
  { label: "物流运输-特别仓储", value: APPLY_TYPE.LOGISTICSCOST },
  { label: "LC Amendment申请", value: APPLY_TYPE.LC_AMENDMENT },
  { label: "RDD-OIT>180天订单保留", value: APPLY_TYPE.RDD_OIT },
  { label: "机器互换", value: APPLY_TYPE.MACHINE_EXCHANGE },
  { label: "转库", value: APPLY_TYPE.TRANSFER_LIB },
  { label: "Cancel Order申请", value: APPLY_TYPE.CANCEL_ORDER },
  { label: "特批发货", value: APPLY_TYPE.SPECIAL_DELIVERY },
];

const STAND_WARRANTY_MONTH = {
  default_warranty_month_pdigt: 'PD&IGT',
  default_warranty_month_us: 'US',
  default_warranty_month_cc: 'CC'
};

const BG_LIST = [
  { label: "PD&IGT(excl. US)", value: "PD&IGT" },
  { label: "US", value: "US" },
  { label: "CC", value: "CC" },
];

const ORDER_TYPES = [
  { label: "OIT", value: "OIT" },
  { label: "Pre-book", value: "Pre-book" },
];

const CURRENCIES =  [
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' }
]

const CC_TYPES = [
  { label: '每个审批节点', value: 'all' },
  { label: '最终节点-通过及拒绝', value: 'lastnode' },
  { label: '最终节点通过', value: 'lastapproved' },
]

const NODE_ACTION = {
  APPROVE: 'approve',
  FEEDBACK: 'feedback'
}

const PROCESS_STATUS = {
  START: 'START',
  DRAFT: 'DRAFT',
  COMPLETED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAW: 'WITHDRAW',
  CANCELLED: 'CANCELLED',
}

const PROCESS_STATUS_MAP = {
  [PROCESS_STATUS.START]: '待审批',
  [NODE_ACTION.FEEDBACK]: '待反馈',
  [PROCESS_STATUS.DRAFT]: '草稿',
  [PROCESS_STATUS.COMPLETED]: '已完成',
  [PROCESS_STATUS.REJECTED]: '已退回',
  [PROCESS_STATUS.WITHDRAW]: '已撤回',
  [PROCESS_STATUS.CANCELLED]: '已取消',
}

const LOGISTICS_STATUS = [
  {
    label: '已出厂未到货',
    value: 0
  },
  {
    label: '已到货',
    value: 1
  },
  {
    label: '未出厂',
    value: 2
  }
]

// status: 0-已取消, 1-未取消
// nodeAction: approve, feedback
// processStatus: START, DRAFT, APPROVED, REJECTED, WITHDRAW

// 换货类型
const EXCHANGE_TYPE_LIST = () => {
  return [
    {label: 'within ORU', value: 'within ORU'},
    {label: 'HK90-CN90', value: 'HK90-CN90'},
    {label: 'CN90-HK90', value: 'CN90-HK90'}
  ]
}

// 换货方式
const EXCHANGE_METHODS_LIST = () => {
  return [
    {label: '单向', value: '单向'},
    {label: '互换', value: '互换'}
  ]
}
// 换货角色 转入
const EXCHANGE_IMPORT_ROLES = () => {
  return [
    {label: '转入', value: '转入'},
    {label: '转出/转入', value: '转出/转入'}
  ]
}
// 换货角色 转出
const EXCHANGE_EXPORT_ROLES = () => {
  return [
    {label: '转出', value: '转出'},
    {label: '转出/转入', value: '转出/转入'}
  ]
}
export {
  DEFAULT_SUCCESS_MESSAGE,
  SUCCESS_MESSAGE,
  DEFAULT_LOADING_MESSAGE,
  LOADING_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
  ERROR_MESSAGE,
  BUSINESS_MODEL,
  BUSINESS_MODEL_MAP,
  APPLY_TYPE,
  APPLY_TYPE_MAP,
  APPLY_TYPES,
  STAND_WARRANTY_MONTH,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
  CC_TYPES,
  PROCESS_STATUS,
  NODE_ACTION,
  PROCESS_STATUS_MAP,
  EXCHANGE_TYPE_LIST,
  EXCHANGE_METHODS_LIST,
  LOGISTICS_STATUS,
  EXCHANGE_IMPORT_ROLES,
  EXCHANGE_EXPORT_ROLES,
};
