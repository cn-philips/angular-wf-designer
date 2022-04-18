import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzMessageService, NzModalService, throttleByAnimationFrameDecorator} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../services';
import {codeString, decodeString, formatDate} from '../../../assets/js/tools';

@Component({
  selector: 'app-bid-ck',
  templateUrl: './bid-ck.component.html',
  styleUrls: ['./bid-ck.component.scss']
})
export class BidCkComponent implements OnInit {
  @Input() contractEndDate:any;
  @Input() isVisibleDate:boolean;
  @Input() database:any;
  @Input() data: any;
  @Input() infor: any;
  @ViewChild('bidinfor') bidinfor;
  @ViewChild('price1') price1: ElementRef;

  price1_value: any = '';
  /*
  * url  flag == 1 禁用
  * true 禁用
  * */
  flag: boolean = false;
  public textLen:any=255;//文本输入限制长度


  tab = true;
 public radioValue: any = 'approved';
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    ) {
    /*
  * 验证
  * */
    this.validateForm = this.fb.group({
      price: [null],
      pricetype: [null],
      comp: [null]
    });
  }

  cancelSecondBid(): void {
    this.nzMessageService.info('操作取消');
  }

  confirmSecondBid (item, operation) {
    this.ddpJudge1(this.database.dealerNo, this.database.agreementAgenName, item, operation);
  }
  public ddpJudge1(leaderNo, leaderName, item, operation) {
    if (this.database.businessType !== 'DISTRIBUTOR') {
      this.secondBidding(item, operation);
      return;
    }
    const url = '/act/ecom/bidding/getDdpDateAndValid?dealerCode=' + leaderNo + '&dealerName=' + leaderName;
    this.http.get(url).subscribe(
      res => {
        if (res.data.isValid != null && res.data.isValid) {
          this.secondBidding(item, operation);
          return;
        } else {
          let alertMsg = '';
          if (res.data.isValid != null) {
            alertMsg = '经销商DDP有效日期为' + res.data.ddpDate + ' ,当前已过有效期，是否确认审批通过？';
          } else {
            alertMsg = res.msg + ' 是否确认审批通过？';
          }
          this.modalService.confirm({
            nzTitle: '<h4>提醒</h4>',
            nzContent: alertMsg,
            nzOnOk: () => {
              this.secondBidding(item, operation);
            }
          });
        }
      }, error => {
        this.message.error('请求失败!');
      }
    );
  }
  // 二次开标
  secondBidding (item, operation) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    const params = {
      mainID: mainId,
      operation: operation,
      process: this.data.process,
      processInstanceTaskId: processInstanceTaskId
    };
    this.http.post(`/act/ecom/bidding/secondBidding`, params).subscribe(rest => {
      if (rest.code === '0000') {
        const _this = this;
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
        }, 3000);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  /*
  * 验证
  * */
  validateForm: FormGroup;
  ngOnChanges()
  {

     console.log(this.data)
  }
  ngOnInit() {
    // 从我的已办进来 flag为true

    const flag = this.activatedRouter.queryParams['_value'].flag;
    if (flag && flag === '1') {
      this.flag = true;
    }

    /*
    * 验证
    * */
    this.validateForm = this.fb.group({
      comp: [null, [Validators.required]],
      price: [null, [Validators.required]],
      pricetype: [null, [Validators.required]]
    });
  }

  checkFormData = () => {
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }


  change()
  {

  }
  changetab(e) {
    this.tab = e;
  }
  /*监听input设置数字*/
  toNumber(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price1_value = e;
    }
    if (this.price1 && this.price1.nativeElement) {
      this.price1.nativeElement.value = this.price1_value;
      this.data.biddingPrice = this.price1_value;
    }
  }
}
