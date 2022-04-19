interface SearchParams {
  pageNo: number;
  pageSize: number;
  applyType?: string;
  processStatus?: string;
  nodeAction?: string;
  bg?: string;
  orderBg?: string;
  keyword?: string;
  submitStartTime?: string;
  submitEndTime?: string;
  status?: number;
}

interface RequestItem {
  applyCode: string; // 申请编号
  applyType: string; // 申请类型
  dealerName: string; // 经销商名称
  hospitalName: string; // 医院名称
  sapOrderNo: string; // SAP订单号
  applicant: string; // 发起人/申请人
  nodeAction: string; // 状态
  nodeName: string; // 当前节点
  createTime: string; // 申请时间
  processStatus: string; // 流程状态
  status: number; // 是否取消
  spProcNodeName; // 当前节点名称
}

export {
  SearchParams,
  RequestItem,
}