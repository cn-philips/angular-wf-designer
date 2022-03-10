import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import { NzMessageService } from 'ng-zorro-antd';
import { ProcessStatusPipe } from '../../pipes/process-status.pipe';
import { TimeFormatePipe } from '../../pipes/time-formate.pipe';
import {codeString} from '../../../assets/js/tools';

@Component({
  selector: 'app-shome',
  templateUrl: './shome.component.html',
  styleUrls: ['./shome.component.scss'],
  providers: [ProcessStatusPipe,TimeFormatePipe],

})
export class ShomeComponent implements OnInit {

  myTasksTotal = 0;
  myInitiateTotal = 0;
  myDraftTotal = 0;
  public myEntrust = 0;
  menuList:any=[];
  public user:any;
  public biddingAuthorizationModeList:any; //授权列表
  constructor(
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    private  changeDetectorRef: ChangeDetectorRef
  ) { }

  public CheckId: any = 'none';
  public mode: any = [
    {title: '招标授权的申请', id: '123'},
    {title: '进单准备表', id: '123'},
  ];



  // Apply_type: "bidding"
  // Bidding_name: "test"
  // Process_status: "ZBSQ"
  // Process_time: "2021-04-29T09:57:19.000+0000"
  // node: "DBA"
  // status: 1
 public mytaks:any=[];
  myinitiate = [];
  mydraft = [];
  myun = [
    // {name: 'xxx角色短期代理', infor: 'Sales角色', time: '2021-09-09'},
    // {name: 'xxx任务转发', infor: 'Sales中标备案申请', time: '2021-09-09'},
    // {name: 'xxx任务Owner转移', infor: 'Sales角色', time: '2021-09-09'}
  ];

  ngOnInit() {
    this.getBiddingAuthorizationModeList();
    this.user=localStorage.getItem("ng_philips_code1");
    this.user=this.user.toLowerCase();
    //我发起的参数
    const params = {
      flag:"",
      pageNo: 1,
      pageSize:5,
    };
    //我的任务
    const Myparams={
      flag: 0,
      pageNo: 1,
      pageSize:5,
    }
    //获取菜单
    this.http.post('/act/role/getDiigtUserInfo').subscribe(res=>{
      if("0000"==res.code)
      {
        let menuList=res.data.jurisdictions;
        if(menuList.length>0)
        {
         menuList.map(res=>{
            if(res.id=="621997df-0501-40a3-bd7e-9062291dd4c3"&&res.children&&res.children.length>0)
            {
                this.menuList=[...res.children];
                return true
            }
          })
         const jump=menuList.some(res=>res.id==="621997df-0501-40a3-bd7e-9062291dd4c3")
         !jump?this.router.navigate(["/roleslist"]):"";
        }
      }
    })

    // 我的任务
    this.http.post(`/act/ecom/homepage/showMoreMyToDoTask`,Myparams).subscribe(rest => {
      if (rest.code === '0000') {
        this.mytaks = [...rest.data.rows];
        this.mytaks.map(vals=>{
          vals.processor=vals.processor?vals.processor.toLowerCase():"";
          if(vals.children&&vals.children.length>0)
          {
            vals.children.map(val=>{
              val.processor=val.processor?val.processor.toLowerCase():"";
            })
          }
        })
        this.myTasksTotal = rest.data.total;
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
    // 我发起的
    this.http.post(`/act/ecom/homepage/showMoreMyTaskProcessOnwer`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.myinitiate = [...rest.data.rows];
        this.myinitiate.map(vals=>{
          vals.processor=vals.processor?vals.processor.toLowerCase():"";
          if(vals.children&&vals.children.length>0)
          {
            vals.children.map(val=>{
              val.processor=val.processor?val.processor.toLowerCase():"";
            })
          }
        })
        this.myInitiateTotal = rest.data.total;
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
    // 我的草稿
    // http://localhost:9090/act/ecom/homepage/myTaskDraft
    this.http.post(`/act/ecom/homepage/showMoreMyDraft`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.mydraft = [...rest.data.rows];
        this.mydraft.map(vals=>{
          vals.processor=vals.processor?vals.processor.toLowerCase():"";
          if(vals.children&&vals.children.length>0)
          {
            vals.children.map(val=>{
              val.processor=val.processor?val.processor.toLowerCase():"";
            })
          }
        })
        this.myDraftTotal = rest.data.total;
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });

    // 我的委托
    // const url = '/act/ecom/homepage/getMyEntrust';
    // this.http.post(url, params).subscribe(res => {
    //   if (res.data) {
    //     this.myun = [...res.data.rows];
    //     this.myEntrust = res.data.total;
    //     this.changeDetectorRef.markForCheck(); // 数据更新检查
    //     this.changeDetectorRef.detectChanges();
    //   }
    // }, error => {
    // });
  }
  //转换业务模式
  ProAppType(e) {
    // biddingAuthorizationModeList
    // switch (e) {
    //   case 'BINDING':
    //     return 'Bidding 授权';
    //   default:
    //     return e;
    // }
    if(this.biddingAuthorizationModeList&&this.biddingAuthorizationModeList.length>0)
    {
      for (let i = 0; i < this.biddingAuthorizationModeList.length; i++) {
        if (this.biddingAuthorizationModeList[i].code === e) {
          return this.biddingAuthorizationModeList[i].label;
        }
      }
    }
    return e;
  }
    //跳转到详情
    goToDetail(item, param) {
      switch (item.task_status) {
        case 'DZLCSH':
        case 'JDEND':
        case 'CANCELLED':
        case 'CLOSED':
          if (param == 0) {
            this.router.navigate(['/igt/my-task'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
              },
            });
          }
          else if (param == 1) { // 我发起的跳转
            this.router.navigate(['/igt/my-started'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
              },
            });
          }
          else if (param == 2) {
            this.router.navigate(['/igt/my-draft'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
              },
            });
          }
          break;
        case 'DTJ':
          if (item.type === 'ZBSQ') {
            this.router.navigate(['/applytendermodif'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
                flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              },
            });
          } else {
            this.router.navigate(['/preordermodifs'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
                flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
                edit: true,
              },
            });
          }
          break;
        case 'DBA':
          this.router.navigate(['/bid'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
            },
          });
          break;
        case 'DSWYSH':
          this.router.navigate(['/tenderreview'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              status: item.task_status,
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
            },
          });
          break;
        case 'XSBMDMSH':
        case 'XSBMZSLSH':
        case '2JSH':
          this.router.navigate(['/tenderreview_sale'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              status: item.task_status,
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              taskid:item.taskID
            },
          });
         break;
        case 'DSWZYSQ':
          this.router.navigate(['/emp'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              sale:item.sale,
              taskid:item.taskID
            },
          });
          break;
         case 'WZB':
           this.router.navigate(['/bid'], {
             skipLocationChange: false,
             queryParams: {
               id: codeString(item.main_id),
               flag: (item.processor.indexOf(this.user) != -1 && param != 1) ? 0 : 1,
               status: item.task_status,
             },
           });
           break;
        case '2CKBZZ':
          this.router.navigate(['/bid'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag: 1
            },
          });
          break;
         case '2CKB':
           this.router.navigate(['/igt/my-task'], {
             skipLocationChange: false,
             queryParams: {
               id: codeString(item.main_id),
               flag: item.processor.indexOf(this.user) != -1 ? 0 : 1
             },
           });
          break;
         case 'DOACS':
         case 'DCDSH':
         this.router.navigate(['/preorderaudit'], {
          skipLocationChange: false,
          queryParams: {
            id: codeString(item.main_id),
            flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
            state: item.task_status,
            taskid:item.taskID
          },
        });
        break;
        case 'DSWZYQR':
        case 'YZBQR':
        this.router.navigate(['/winning'], {
          skipLocationChange: false,
          queryParams: {
            id: codeString(item.main_id),
            flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
            status:item.task_status,
            taskid:item.taskID
          },
        });
        break;
        case 'YZBQRDBCWJ':
          this.router.navigate(['/support-up'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              status:item.task_status,
              taskid:item.taskID
            },
          });
        break;
        case 'DHTQS':
          this.router.navigate(['/consign'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              status: item.task_status,
              sale:item.sale,
              taskid:item.taskID
            },
          });
          break;
          case 'DXSBMSH':
          case 'DXSBM2JSH':
          case 'DOAJDQR':
          case 'DFBSH':
          case 'DTPJDSH':
          case 'DHTOASH':
          this.router.navigate(['/igt/examine-order'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              status: item.task_status,
              taskID: item.taskID,
            },
          });
          break;
          case 'DHTGYBTX':
          case 'XJDHTGYBTX':
            this.router.navigate(['/inconmodif'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
                flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
                status: item.task_status,
                taskID: item.taskID,
              },
            });
            break;
          case 'DTXHT':
            this.router.navigate(['/inorder'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
                flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
                state: item.task_status,
                taskID: item.taskID,
              },
            });
            break;
          case 'DODSH':
            this.router.navigate(['/inorderexam'], {
              skipLocationChange: false,
              queryParams: {
                id: codeString(item.main_id),
                flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
                state: item.task_status,
              },
            });
            break;
        case 'YZBQRYBCWJ':
          this.router.navigate(['/winning'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:1,
              state: item.task_status,
            },
          });
          break;
        case 'DOITWJSC':
        case 'JDEND':
        case 'OITEND':
          let params;
          if (item.dealerAudit == '1') {
            params = 'third';
          } else if (item.oaName == '1') {
            params = 'realTime';
          }
          this.router.navigate(['/completeOit'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.main_id),
              flag:item.processor.indexOf(this.user)!=-1? 0 : 1,
              status: item.task_status,
              param:params,
              sale:item.sale
            },
          });
          break;
        case 'BIDCANCELLED':
          this.router.navigate(['/winning'], {
            skipLocationChange: false,
            queryParams: {
              id: codeString(item.id),
              flag: 1,
              status: item.task_status,
            },
          });
          break;

      }

    }

    toEntrust(item) {
      this.router.navigate(['/changeonwer'], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1
        },
      });
    }

    // 招标授权模式
    public getBiddingAuthorizationModeList () {
      const params = {
        dictGroup: 'AUTHORIZATION_MODE',
      };
      this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          this.biddingAuthorizationModeList = rest.data;
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    }
  linkToApplyTender(parm) {
    parm.id=="5ba74962-a4e4-4408-9973-25380f12ea79"?this.router.navigate(['preOrder']):this.router.navigate(['applyTender']);
  }
}
