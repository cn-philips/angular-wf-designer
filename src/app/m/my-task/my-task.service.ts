import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
// @Injectable()
export class MyTaskService {

  private _taskObj: any = {};

  private _taskData: any = {};

  constructor() { }

  public get taskObj(): any {
    return this._taskObj;
  }

  public set taskObj(value: any) {
    this._taskObj = value;
  }

  public get taskData(): any {
    return this._taskData;
  }

  public set taskData(value: any) {
    this._taskData = value;
  }
}
