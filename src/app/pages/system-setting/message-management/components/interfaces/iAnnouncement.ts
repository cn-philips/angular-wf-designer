import { message } from "./iMessage";

export interface announcement extends message {
  // 是否强制阅读
  isForceRead: boolean;
  // 阅读时长
  readTime: number;
  // 是否长显
  alwaysShow:boolean;
}
