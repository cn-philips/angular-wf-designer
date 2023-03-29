// 省份
export const PROVINCES = [
  { label: "北京市", value: "北京市" },
  { label: "上海市", value: "上海市" },
  { label: "河北省", value: "河北省" },
  { label: "天津市", value: "天津市" },
  { label: "山西省", value: "山西省" },
  { label: "内蒙古自治区", value: "内蒙古自治区" },
  { label: "辽宁省", value: "辽宁省" },
  { label: "吉林省", value: "吉林省" },
  { label: "黑龙江省", value: "黑龙江省" },
  { label: "江苏省", value: "江苏省" },
  { label: "浙江省", value: "浙江省" },
  { label: "安徽省", value: "安徽省" },
  { label: "福建省", value: "福建省" },
  { label: "江西省", value: "江西省" },
  { label: "山东省", value: "山东省" },
  { label: "河南省", value: "河南省" },
  { label: "湖北省", value: "湖北省" },
  { label: "湖南省", value: "湖南省" },
  { label: "广东省", value: "广东省" },
  { label: "广西壮族自治区", value: "广西壮族自治区" },
  { label: "海南省", value: "海南省" },
  { label: "重庆市", value: "重庆市" },
  { label: "四川省", value: "四川省" },
  { label: "贵州省", value: "贵州省" },
  { label: "云南省", value: "云南省" },
  { label: "西藏自治区", value: "西藏自治区" },
  { label: "陕西省", value: "陕西省" },
  { label: "甘肃省", value: "甘肃省" },
  { label: "青海省", value: "青海省" },
  { label: "宁夏回族自治区", value: "宁夏回族自治区" },
  { label: "新疆维吾尔自治区", value: "新疆维吾尔自治区" },
  { label: "香港特别行政区", value: "香港特别行政区" },
  { label: "澳门特别行政区", value: "澳门特别行政区" },
  { label: "台湾省", value: "台湾省" },
];

// 招标类型
export const BIDDING_TYPES = [
  { label: "国内公开标", value: "国内公开标" },
  { label: "国际公开标", value: "国际公开标" },
  { label: "其他类型", value: "其他类型" },
];

// 客户类型
export const CUSTOMER_TYPES = [
  { label: "公立医院", value: "公立医院" },
  { label: "民营医院", value: "民营医院" },
  { label: "其他", value: "其他" },
];

// 投标公司信息
export const BIDDING_COMPANIES = [
  {
    label: "飞利浦（中国）投资有限公司",
    value: "飞利浦（中国）投资有限公司",
    bidderRegistAddress: "上海市静安区灵石路718号A1幢",
    bidderRegistLocation: "中国",
    currency: 'CNY'
  },
  {
    label: "飞利浦电子香港有限公司",
    value: "飞利浦电子香港有限公司",
    bidderRegistAddress: "香港新界沙田香港科學園科技大道東5號5E大樓3樓",
    bidderRegistLocation: "中国香港",
    currency: 'USD'
  },
];

export const CURRENCIES = [
  { label: "CNY", value: "CNY" },
  { label: "USD", value: "USD" },
];

// 协议经销商类型
export const DISTRIBUTOR_TYPES = [
  { label: '年度协议', value: '年度协议' },
  { label: '开放区域', value: '开放区域' },
  { label: '非开放区域超出协议范围', value: '非开放区域超出协议范围' },
]

// 协议经销商DDP状态
export const DISTRIBUTOR_DDP_STATUS_LIST = [
  { label: '通过', value: '通过' },
  { label: '未通过', value: '未通过' },
  { label: '非飞利浦授权二级经销商', value: '非飞利浦授权二级经销商' },
]

// 投标公司DDP状态
export const BIDDER_DDP_STATUS_LIST = [
  { label: '通过', value: '通过' },
  { label: '未通过', value: '未通过' },
  { label: '非飞利浦授权二级经销商', value: '非飞利浦授权二级经销商' },
]

export const BUSINESS_MODEL_DIRECT = 'DIRECT'
