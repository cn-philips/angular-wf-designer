import { message } from "./iMessage";
export enum notificationTypeEnum {
  info = "info",
  danger = "danger",
  warning = "warning",
}
export interface notification extends message {
  // 提醒类型
  type: notificationTypeEnum;
}
