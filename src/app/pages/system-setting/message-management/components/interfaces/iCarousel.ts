import { message } from "./iMessage";

export interface carousel extends message {
  // 背景图地址
  image: String;
  // 跳转地址
  link: String;
}
