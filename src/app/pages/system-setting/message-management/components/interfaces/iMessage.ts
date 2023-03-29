export enum messageTypeEnum {
  Notification = "Notification",
  Announcement = "Announcement",
  Carousel = "Carousel",
}
export interface message {
  // ID
  id: String;
  // 标题
  title: String;
  // 内容（富文本）
  content: String;
  // 生效日期
  startDate: Date;
  // 结束日期
  endDate: Date;
  // 排序
  order: number;
  // 是否启用
  isEnable: boolean;
  // 什么类型的消息
  messageType: messageTypeEnum;
}
