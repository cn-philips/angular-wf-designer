enum APPROVE_NODE_MODE {
  SEQUENCE = "sequence",
  PARALLEL = "parallel",
  NONE = "none",
}

const APPROVE_NODE_MODE_MAP = {
  [APPROVE_NODE_MODE.SEQUENCE]: "顺序审批",
  [APPROVE_NODE_MODE.PARALLEL]: "并行审批",
  [APPROVE_NODE_MODE.NONE]: "无",
};

const APPROVE_NODE_MODE_LIST = [
  {
    label: APPROVE_NODE_MODE_MAP[APPROVE_NODE_MODE.SEQUENCE],
    value: APPROVE_NODE_MODE.SEQUENCE,
  },
  {
    label: APPROVE_NODE_MODE_MAP[APPROVE_NODE_MODE.PARALLEL],
    value: APPROVE_NODE_MODE.PARALLEL,
  },
  {
    label: APPROVE_NODE_MODE_MAP[APPROVE_NODE_MODE.NONE],
    value: APPROVE_NODE_MODE.NONE,
    disabled: true,
  },
];

enum APPROVE_NODE_ACTION {
  APPLY = "apply",
  APPROVE = "approve",
  FEEDBACK = "feedback",
  VALIDATE = "validate",
  SUPPLEMENT = "supplement"
}

const APPROVE_NODE_ACTION_MAP = {
  [APPROVE_NODE_ACTION.APPLY]: "申请",
  [APPROVE_NODE_ACTION.APPROVE]: "审批",
  [APPROVE_NODE_ACTION.FEEDBACK]: "反馈",
  [APPROVE_NODE_ACTION.VALIDATE]: "验证",
  [APPROVE_NODE_ACTION.SUPPLEMENT]: '补充信息'
};

const APPROVE_NODE_ACTION_LIST = [
  {
    label: APPROVE_NODE_ACTION_MAP[APPROVE_NODE_ACTION.APPLY],
    value: APPROVE_NODE_ACTION.APPLY,
    disabled: true,
  },
  {
    label: APPROVE_NODE_ACTION_MAP[APPROVE_NODE_ACTION.APPROVE],
    value: APPROVE_NODE_ACTION.APPROVE,
  },
  {
    label: APPROVE_NODE_ACTION_MAP[APPROVE_NODE_ACTION.FEEDBACK],
    value: APPROVE_NODE_ACTION.FEEDBACK,
  },
  {
    label: APPROVE_NODE_ACTION_MAP[APPROVE_NODE_ACTION.VALIDATE],
    value: APPROVE_NODE_ACTION.VALIDATE,
  },
];

enum CC_PERSON_TYPE {
  SYSTEM_ROLE = '1', // 系统角色
  ASSIGN_USER = '2', // 指定用户
  SP_APPLICANT = '3', // 特批申请人
}

const CC_PERSON_TYPES = [
  { label: '系统角色', value: CC_PERSON_TYPE.SYSTEM_ROLE },
  { label: '指定用户', value: CC_PERSON_TYPE.ASSIGN_USER },
  { label: '特批申请人', value: CC_PERSON_TYPE.SP_APPLICANT },
]

enum APPROVE_USER_TYPE {
  SYSTEM_ROLE = 'systemrole', // 系统角色
  ASSIGN_USER = 'preuser', // 指定用户
  USER_SELECT = 'userselect', // 用户选择
}

const APPROVE_USER_TYPES = [
  { label: '系统角色', value: APPROVE_USER_TYPE.SYSTEM_ROLE },
  { label: '指定用户', value: APPROVE_USER_TYPE.ASSIGN_USER },
  { label: '用户选择', value: APPROVE_USER_TYPE.USER_SELECT },
]

enum CC_TRIGGER_TYPE {
  APPROVED = "approved",
  REJECT = "reject",
  BOTH = 'both',
  SUBMIT = "submit",
  WITHDRAW = "withdraw",
  ALL = 'all',
}

const CC_TRIGGER_TYPE_MAP = {
  [APPROVE_NODE_ACTION.APPLY]: [
    { label: '点击提交后', value: CC_TRIGGER_TYPE.SUBMIT },
    { label: '任意条件', value: CC_TRIGGER_TYPE.ALL },
  ],
  [APPROVE_NODE_ACTION.APPROVE]: [
    { label: '点击通过后', value: CC_TRIGGER_TYPE.APPROVED },
    { label: '点击拒绝后', value: CC_TRIGGER_TYPE.REJECT },
    { label: '点击通过或拒绝后', value: CC_TRIGGER_TYPE.BOTH },
    { label: '点击撤回后', value: CC_TRIGGER_TYPE.WITHDRAW },
    { label: '任意条件', value: CC_TRIGGER_TYPE.ALL },
  ],
  [APPROVE_NODE_ACTION.VALIDATE]: [
    { label: '点击通过后', value: CC_TRIGGER_TYPE.APPROVED },
    { label: '点击拒绝后', value: CC_TRIGGER_TYPE.REJECT },
    { label: '点击通过或拒绝后', value: CC_TRIGGER_TYPE.BOTH },
    { label: '点击撤回后', value: CC_TRIGGER_TYPE.WITHDRAW },
    { label: '任意条件', value: CC_TRIGGER_TYPE.ALL },
  ],
  [APPROVE_NODE_ACTION.FEEDBACK]: [
    { label: '点击通过后', value: CC_TRIGGER_TYPE.APPROVED },
    { label: '任意条件', value: CC_TRIGGER_TYPE.ALL },
  ],
}

const CC_TRIGGER_TYPES = [
  { label: '点击通过后', value: CC_TRIGGER_TYPE.APPROVED },
  { label: '点击拒绝后', value: CC_TRIGGER_TYPE.REJECT },
  { label: '点击通过或拒绝后', value: CC_TRIGGER_TYPE.BOTH },
  { label: '点击提交后', value: CC_TRIGGER_TYPE.SUBMIT },
  { label: '点击撤回后', value: CC_TRIGGER_TYPE.WITHDRAW },
  { label: '任意条件', value: CC_TRIGGER_TYPE.ALL },
]

export {
  APPROVE_NODE_MODE,
  APPROVE_NODE_MODE_MAP,
  APPROVE_NODE_ACTION,
  APPROVE_NODE_ACTION_MAP,
  APPROVE_NODE_MODE_LIST,
  APPROVE_NODE_ACTION_LIST,
  CC_PERSON_TYPE,
  CC_PERSON_TYPES,
  APPROVE_USER_TYPE,
  APPROVE_USER_TYPES,
  CC_TRIGGER_TYPE,
  CC_TRIGGER_TYPES,
  CC_TRIGGER_TYPE_MAP,
};
