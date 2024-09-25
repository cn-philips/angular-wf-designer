import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { decodeString, upLoadFileNew } from '@core/util/tools';
import { HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
@Component({
  selector: 'ecos-thirdcheck-info',
  templateUrl: './third-check-info.component.html',
  styleUrls: ['./third-check-info.component.scss']
})
export class ThirdCheckInfoComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private message: NzMessageService, private fb: FormBuilder, private http: HttpService) { }
  @Input() formValue:FormGroup;
  @Input() applyId:string;
  thirdPartyList: any = [];
  load: any = false;


  public formData: FormGroup = this.fb.group({
    id: [],
    tpcId: [],
    needThirdPartyAudit: [{ value: false, disabled: true }], // 是否需要三方核查
    checkDurationId: [{ value: null, disabled: true }], // 抽查周期
    dealFormId: [{ value: null, disabled: true }], // Deal Form ID
    orderCode: [{ value: null, disabled: true }], // 订单需求编号
    icfRegistrationTime: [{ value: null, disabled: true }], // ICF登记时间
    icfSignTime: [{ value: null, disabled: true }], // ICF签署时间
    dealerProvideMaterialDeadline: [{ value: null, disabled: true }], // 需要经销商提供核查的材料截止时间（签署时间+3个月）
    isOverdue: [{ value: false, disabled: true }], // 经销商是否超期提供核查材料
    auditReport: [{ value: [], disabled: false }, [Validators.required]], // 核查报告
    auditReportUploadTime: [{ value: null, disabled: false }, [Validators.required]], // 核查报告上传时间
    dealerProvideMaterialRealtime: [{ value: null, disabled: true }], // 经销商提供核查的材料实际时间
    auditStartTime: [{ value: null, disabled: false }, [Validators.required]], // 开始三方核查时间
    auditComments: [{ value: null, disabled: false }, [Validators.required]], // 三方核查要求备注
    auditAttachment: [{ value: null, disabled: false }, [Validators.required]], // 三方核查要求附件
    dealerDelayTime: [{ value: null, disabled: false }], // dealer_delay_time
    oaAuditEndTime: [{ value: null, disabled: false }, [Validators.required]], // OA完成核查时间
    cpAuditTotalPrice: [{ value: null, disabled: true }], // CP系统审核完成的三方审核总价
    cosAuditTotalPriceExclude: [{ value: null, disabled: false }, [Validators.required]], // COS实际核查总三方价格含税（不含未评估三方）
    // Deviation Percentage（不含未评估三方）：系统计算= 【COS实际核查总三方价格含税（不含未评估三方）- CP评估三方总价】(结果取绝对值）/ CP评估三方总价
    deviationPercentageExclude: [{ value: null, disabled: true }],
    cosAuditTotalPriceInclude: [{ value: null, disabled: false }, [Validators.required]], // COS实际核查总三方价格含税（含未评估三方）

    // Deviation Percentage （含未评估三方）：系统计算= 【COS实际核查总三方价格含税（含未评估三方）- CP评估三方总价】(如差值为负数-结果取绝对值，如差异为正数-结果为0）/ CP评估三方总价​
    deviationPercentageInclude: [{ value: null, disabled: true }],
    deviationTypeExclude: [{ value: null, disabled: false }, [Validators.required]], // Deviation 类型（不含未评估三方）
    deviationTypeInclude: [{ value: null, disabled: false }, [Validators.required]], // Deviation 类型（含未评估三方）
    auditStatus: [{ value: null, disabled: false }, [Validators.required]], // 三方核查状态
    oaAuditComments: [{ value: null, disabled: false }, [Validators.required]], // OA三方核查备注
    oaAuditAttachments: [{ value: null, disabled: false }, [Validators.required]], // OA三方核查备注附件
    processStatus: [{ value: null, disabled: true }],
    auditFiles: [{ value: [], disabled: false }, [Validators.required]], // 核查报告
  })

  ngOnInit() {
    console.log("applyId", this.applyId);
    // let productVerification = this.thirdCheckFormData.get('productVerificationInformation').value;
    // if(productVerification == '已经交付'){
    //   this.thirdCheckFormData.get('productVerificationInformation').disable();
    // } else {
    //   this.thirdCheckFormData.get('productVerificationInformation').enable();
    // }
    // this.getEntryModeList();
    this.queryDetails(this.applyId) 
  }

  queryDetails(applyId) {
    this.load = true
    this.http.post(`/act/ecos/thirdParty/detail/${applyId}`).subscribe((res => {
      if (res.code === '0000') {
        const data = res.data;
        this.formData.patchValue({
          ...data
        })
        this.load = false;
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }
  
  public getEntryModeList() {
    const params = {
      dictGroup: 'thirdVerificationSelect',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.thirdPartyList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  checkFormData = (paramForm) => {
    for (const i in paramForm.controls) {
      paramForm.controls[i].markAsDirty();
      paramForm.controls[i].updateValueAndValidity();
    }
    return paramForm.valid;
  };

  public saveFormData() {
    const valid = this.checkFormData(this.formData);

    if (valid) {
      console.log("提交保存");
      
    }
  }

}
