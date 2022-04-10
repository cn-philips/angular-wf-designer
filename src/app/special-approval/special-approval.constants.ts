const DEFAULT_SUCCESS_MESSAGE = '操作成功'
const SUCCESS_MESSAGE = {
  DELETE_DRAFT: '删除成功',
  CANCEL_REQUEST: '取消成功',
  WITHDRAW_REQUEST: '撤回成功',
  SUBMIT: '提交成功',
  SAVE_DRAFT: '保存成功',
  FEEDBACK: '反馈成功',
  APPROVE: '审批成功',
}

const DEFAULT_LOADING_MESSAGE = '正在加载...'
const LOADING_MESSAGE = {
  DELETE_DRAFT: '正在删除...',
  CANCEL_REQUEST: '正在取消...',
  WITHDRAW_REQUEST: '正在撤回..',
  SUBMIT: '正在提交...',
  SAVE_DRAFT: '正在保存...',
  FEEDBACK: '正在提交...',
  APPROVE: '正在提交...',
}

const DEFAULT_ERROR_MESSAGE = '数据加载失败, 请稍候重试'
const ERROR_MESSAGE = {
  DELETE_DRAFT: '删除失败, 请稍候重试',
  CANCEL_REQUEST: '取消失败, 请稍候重试',
  WITHDRAW_REQUEST: '撤回失败, 请稍候重试',
  SUBMIT: '提交失败, 请稍候重试',
  SAVE_DRAFT: '保存失败, 请稍候重试',
  FEEDBACK: '反馈失败, 请稍候重试',
  APPROVE: '审批失败, 请稍候重试',
}

enum BUSINESS_MODEL {
  DIRECT_DEAL = 'direct',
  DISTRIBUTOR_DEAL = 'distributor'
}

const BUSINESS_MODEL_MAP = {
  [BUSINESS_MODEL.DIRECT_DEAL]: 'Direct Deal',
  [BUSINESS_MODEL.DISTRIBUTOR_DEAL]: 'Distributor Deal',
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
}