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
  DELIVERY: "delivery",
  EXT_WARRANTY: "warranty",
  EXT_INSTALL_COST: "installcost",
  LOGISTICSCOST: "logisticscost",
}

const APPLY_TYPE_MAP = {
  [APPLY_TYPE.PRODUCTION]: {
    label: "特批开始生产",
    items: [
      { label: "未付款", value: "sp_production_apply_item_1" },
      { label: "场地未好", value: "sp_production_apply_item_2" },
    ],
  },
  [APPLY_TYPE.DELIVERY]: {
    label: "特批发货",
    items: [
      { label: "未付款", value: "sp_delivery_apply_item_1" },
      { label: "场地未好", value: "sp_delivery_apply_item_2" },
    ],
  },
  [APPLY_TYPE.EXT_WARRANTY]: {
    label: "延长保修",
    items: [
      { label: "合同设备晚到（或未到全）", value: "sp_warranty_apply_item_1" },
      { label: "设备货损", value: "sp_warranty_apply_item_2" },
      { label: "配置性能异议或故障", value: "sp_warranty_apply_item_3" },
      { label: "设备试运行", value: "sp_warranty_apply_item_4" },
      { label: "其他", value: "sp_warranty_apply_item_5" },
    ],
  },
  [APPLY_TYPE.EXT_INSTALL_COST]: {
    label: "额外安装费用及其他",
    items: [
      { label: "Additional cost during install", value: "sp_installcost_apply_item_1" }
    ],
  },
  [APPLY_TYPE.LOGISTICSCOST]: {
    label: "物流运输",
    items: [
      {label: '特别仓储、物流费用', value: 'sp_logisticscost_apply_item_1'}
    ]

  }
};

const APPLY_TYPES = [
  { label: "特批开始生产", value: APPLY_TYPE.PRODUCTION },
  { label: "特批发货", value: APPLY_TYPE.DELIVERY },
  { label: "延长保修", value: APPLY_TYPE.EXT_WARRANTY },
  { label: "额外安装费用及其他", value: APPLY_TYPE.EXT_INSTALL_COST },
  { label: "物流运输-特别仓储", value: APPLY_TYPE.LOGISTICSCOST },
];

const STAND_WARRANTY_MONTH = {
  "PD&IGT": 12,
  US: 15,
  CC: 12,
};

const BG_LIST = [
  { label: "PD&IGT(excl. US)", value: "PD&IGT" },
  { label: "US", value: "US" },
  { label: "CC", value: "CC" },
];

// BG与BMC的关联列表
const BG_BMC_MAP = {
  "PD&IGT": [
    { label: "AMI", value: "AMI" },
    { label: "CT", value: "CT" },
    { label: "DXR", value: "DXR" },
    { label: "EDI-CI", value: "EDI-CI" },
    { label: "EDI-ICAP", value: "EDI-ICAP" },
    { label: "IGT-S", value: "IGT-S" },
    { label: "MR", value: "MR" },
    { label: "PDS-RadOnc", value: "PDS-RadOnc" },
    { label: "Professional Service", value: "Professional Service" },
  ],
  US: [{ label: "US", value: "US" }],
  CC: [
    { label: "HPM", value: "HPM" },
    { label: "VAD", value: "VAD" },
    { label: "DFM", value: "DFM" },
    { label: "DECG", value: "DECG" },
    { label: "AED", value: "AED" },
  ],
};

const US_PRODUCT_LIST = [
  { label: "Affiniti30", value: "Affiniti30" },
  { label: "Affiniti50", value: "Affiniti50" },
  { label: "Affiniti70", value: "Affiniti70" },
  { label: "AI", value: "AI" },
  { label: "ClearVue350", value: "ClearVue350" },
  { label: "ClearVue550", value: "ClearVue550" },
  { label: "ClearVue650", value: "ClearVue650" },
  { label: "ClearVue850", value: "ClearVue850" },
  { label: "CX50", value: "CX50" },
  { label: "EPIQ CVx", value: "EPIQ CVx" },
  { label: "EPIQ Elite", value: "EPIQ Elite" },
  { label: "EPIQ EliteW", value: "EPIQ EliteW" },
  { label: "EPIQ5", value: "EPIQ5" },
  { label: "EPIQ5C", value: "EPIQ5C" },
  { label: "EPIQ7", value: "EPIQ7" },
  { label: "EPIQ7C", value: "EPIQ7C" },
  { label: "HD8", value: "HD8" },
  { label: "Innosight", value: "Innosight" },
  { label: "ISCV", value: "ISCV" },
  { label: "Lumify", value: "Lumify" },
  { label: "Lumify报告", value: "Lumify报告" },
  { label: "Off-Cart Qlab", value: "Off-Cart Qlab" },
  { label: "PS", value: "PS" },
  { label: "SPARQ", value: "SPARQ" },
  { label: "Tomtec", value: "Tomtec" },
  { label: "远程", value: "远程" },
];

const ORDER_TYPES = [
  { label: "OIT", value: "OIT" },
  { label: "Pre-Book", value: "	Pre-Book" },
];

const BIG_SMALL_AREA_LIST = [
  {
    label: "West",
    value: "West",
    children: [{ label: "West", value: "West" }],
  },
  {
    label: "South",
    value: "South",
    children: [{ label: "South", value: "South" }],
  },
  {
    label: "East",
    value: "East",
    children: [{ label: "East", value: "East" }],
  },
  {
    label: "North2",
    value: "North2",
    children: [{ label: "North2", value: "North2" }],
  },
  {
    label: "North1",
    value: "North1",
    children: [{ label: "North1", value: "North1" }],
  },
  {
    label: "Solution",
    value: "Solution",
    children: [
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  {
    label: "RadOnc",
    value: "RadOnc",
    children: [
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  {
    label: "Private",
    value: "Private",
    children: [
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  {
    label: "Primary Business",
    value: "Primary Business",
    children: [
      { label: "China", value: "China" },
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  { label: "GBA", value: "GBA", children: [{ label: "GBA", value: "GBA" }] },
  {
    label: "Fighter Team",
    value: "Fighter Team",
    children: [{ label: "China", value: "China" }],
  },
  {
    label: "DXR",
    value: "DXR",
    children: [
      { label: "China", value: "China" },
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  {
    label: "CTVAD",
    value: "CTVAD",
    children: [
      { label: "China", value: "China" },
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  { label: "BV", value: "BV", children: [{ label: "China", value: "China" }] },
  {
    label: "US",
    value: "US",
    children: [
      { label: "East", value: "East" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
      { label: "US-Private", value: "US-Private" },
      { label: "US-VAD", value: "US-VAD" },
    ],
  },
  {
    label: "HPM",
    value: "HPM",
    children: [
      { label: "North", value: "North" },
      { label: "West", value: "West" },
      { label: "East2", value: "East2" },
      { label: "East1", value: "East1" },
      { label: "South", value: "South" },
    ],
  },
  { label: "VAD", value: "VAD", children: [{ label: "GCN", value: "GCN" }] },
  { label: "DFM", value: "DFM", children: [{ label: "DFM", value: "DFM" }] },
  {
    label: "DECG",
    value: "DECG",
    children: [{ label: "DECG", value: "DECG" }],
  },
  { label: "AED", value: "AED", children: [{ label: "AED", value: "AED" }] },
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

const PROCESS_STATUS = {
  START: 'START',
  DRAFT: 'DRAFT',
  COMPLETED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAW: 'WITHDRAW',
  CANCELLED: 'CANCELLED',
}

const NODE_ACTION = {
  APPROVE: 'approve',
  FEEDBACK: 'feedback'
}

// status: 0-已取消, 1-未取消
// nodeAction: approve, feedback
// processStatus: START, DRAFT, APPROVED, REJECTED, WITHDRAW

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
  BG_BMC_MAP,
  US_PRODUCT_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  BIG_SMALL_AREA_LIST,
  CURRENCIES,
  CC_TYPES,
  PROCESS_STATUS,
  NODE_ACTION,
};
