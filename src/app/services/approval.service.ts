import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';   
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  private _approvalParams: any = null;

  constructor(private http: HttpService) { }

  public get approvalParams(): any {
    return this._approvalParams;
  }

  public set approvalParams(value: any) {
    this._approvalParams = value;
  }

  async getTaskData(activitiTask: any) {
    let result = undefined;
    if (activitiTask) {
      const uri = '/act/task/genericTaskPage';
      const params = activitiTask;
      const res = await this.http.post(uri, params).toPromise();
      if ('0000' === res['code']) {
        result = res.data;
      }
      return result;
    }
  }

  async getTaskRouter(activitiTask: any) {
    let result = undefined;
    const res = await this.getTaskData(activitiTask);
    if(res && res['taskSimpleRouterMap']) {
      result = res['taskSimpleRouterMap'];
    }
    return result;
  }

  async getDraftData(activitiTask: any) {
    let result = undefined;
    if(activitiTask) {
      const uri = '/act/task/genericTaskPage';
      const params = activitiTask;
      const res = await this.http.post(uri, params).toPromise();
      if ('0000' === res['code']) {
        const draftDataTmp = res.data['taskFormComponentList']['globalVariables']['draftData'];
        let draftDataJson;
        if (typeof (draftDataTmp) === 'object') {
          draftDataJson = draftDataTmp;
        } else {
          draftDataJson = JSON.parse(draftDataTmp);
        }
        result= draftDataJson;
      }
      return result;
    }
  }

  async getFormData(activitiTask: any) {
    let result = undefined; 
    const res = await this.getDraftData(activitiTask);
    if(res && res['formData']) {
      result = JSON.parse(res['formData']);
    }
    return result;
  }

  getTotalAndCTP(quotation: any) {
    let result: any = {
      'contractpriceall': '  ',
      'ctpall': '  ',
      'ctpallRatio': '',
      'prefix': '',
      'qlist':[]
      };

    console.log('==> getTotalAndCTP:', quotation);
    const type = quotation['type']; // '1'通用, '0'特价
    const quotationObj = quotation['obj'];
    result['type'] = type;

    //获取合同总价
    if (quotationObj['totalAllList'] && quotationObj['totalAllList'].length > 0) {
      const totalAllList = quotationObj['totalAllList'];
      for(const item of totalAllList) {
        if ('contractpriceall' === item['totalall_name']) {
          result['contractpriceall'] = item['money'];
          break;
        }
      }
    }

    //获取总CTP 
    if (quotationObj['quotationBaseInfo']) {
      const baseInfo = quotationObj['quotationBaseInfo'];
      let prefix = '1' == baseInfo['currencyType'] ? '$ ' : '￥ ';
      result['prefix'] = prefix;
      if(baseInfo['ctpall']) {
        result['ctpall'] = prefix + baseInfo['ctpall'];
      }

      if (baseInfo['ctpallRatio']) {
        result['ctpallRatio'] = baseInfo['ctpallRatio'] + '%';
      }
    }

    //获取quotationList
    if (quotationObj['quotationList']) {
      result['qlist'] = quotationObj['quotationList'];
    }

    return result;

  }

  
}
