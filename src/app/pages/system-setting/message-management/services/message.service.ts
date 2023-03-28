import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { CookieService } from "ngx-cookie-service";
import { map } from "rxjs/operators";
import { message, messageTypeEnum } from "../components/interfaces/iMessage";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  constructor(
    private http: HttpService,
    private cookiesService: CookieService
  ) {}
  public queryMessage(
    page: number = 1,
    size: number = 10,
    messageType: messageTypeEnum
  ) {
    let uri = "/act/ecos/message";
    return this.http
      .post(uri, {
        pageNo: page,
        pageSize: size,
        messageType,
      })
      .pipe(
        map((i) => {
          if (i.code === "0000") {
            return i.data;
          } else {
            throw new Error(i.msg);
          }
        })
      );
  }
  public getMessage(message: message) {
    let uri = `/act/ecos/message/${message.id}`;
    return this.http.get(uri).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
  public createMessage(message: message) {
    let uri = `/act/ecos/message/add`;
    return this.http.post(uri, message).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
  public updateMessage(message: message) {
    let uri = `/act/ecos/message/${message.id}`;
    return this.http.post(uri, message).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
  public deleteMessage(message: message) {
    let uri = `/act/ecos/message/${message.id}`;
    return this.http.delete(uri).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }

  public toggleEnable(message: message) {
    let uri = `/act/ecos/message/toggleEnabled/${message.id}`;
    return this.http.post(uri, message).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
  public retrieveMessage(messageType: messageTypeEnum) {
    let uri = `/act/ecos/message/query/${messageType}`;
    return this.http.get(uri).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
  public hasRead(id: String) {
    let readList: any = localStorage.getItem("readList");
    if (!readList) {
      localStorage.setItem("readList", JSON.stringify([]));
    }
    readList = JSON.parse(localStorage.getItem("readList"));
    // 兼容长期显示已阅读
    let longTermMessageReadRecords = decodeURIComponent(this.cookiesService.get(
      "longTermMessageReadRecords"
    ));
    if (longTermMessageReadRecords) {
      console.log("longTermMessageReadRecords", longTermMessageReadRecords);
      readList = readList.concat(longTermMessageReadRecords.split(",").filter(i=>i));
    }
    let readId = readList.find((i) => id.trim() === i.trim());
    if (readId) {
      return true;
    } else {
      return false;
    }
  }
  public setRead(id: String) {
    let readList: any = localStorage.getItem("readList");
    if (!readList) {
      localStorage.setItem("readList", JSON.stringify([]));
    }
    readList = JSON.parse(localStorage.getItem("readList"));
    readList.push(id);
    readList = readList.filter((i) => i);
    localStorage.setItem("readList", JSON.stringify(readList));
  }
  public removeRead(id: String) {
    let readList: any = localStorage.getItem("readList");
    if (!readList) {
      localStorage.setItem("readList", JSON.stringify([]));
    }
    readList = JSON.parse(localStorage.getItem("readList"));
    readList = readList.filter((i) => i);
    readList = readList.filter((i) => i !== id);
    localStorage.setItem("readList", JSON.stringify(readList));
  }
  public retrieveImages() {
    let uri = `/act/ecos/message/imageStorage`;
    return this.http.get(uri).pipe(
      map((i) => {
        if (i.code === "0000") {
          return i.data;
        } else {
          throw new Error(i.msg);
        }
      })
    );
  }
}
