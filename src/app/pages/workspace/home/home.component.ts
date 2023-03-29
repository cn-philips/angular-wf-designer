import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
import { codeString } from "@core/util/tools";
import { TaskListComponent } from "@pages/workspace/home/components";
import { WorkspaceListService } from "../services/workspace-list.service";
import { ListFunctionCollectionsService } from "../services/list-function-collections.service";
import * as Driver from "driver.js";
import { SpecialApprovalService } from "../../special-approval/special-approval.service";
interface iCard {
  referenceId: String;
  name: String;
  type: String;
  color: String;
  date: String;
}
@Component({
  selector: "page-workspace-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  @ViewChild("listComponent") listComponent: TaskListComponent;

  listTitle: any = "myTodo";
  isLoading: boolean = true;
  cardList: any[] = [
    {
      // 临时数据
      actionName: "我的待办",
      name: "myTodo",
      amount: 0,
      class: "mytask",
      hasPermission: false,
    },
    {
      actionName: "我的已办",
      name: "myDone",
      amount: 0,
      class: "done",
      hasPermission: false,
    },
    {
      actionName: "我的申请",
      name: "myApply",
      amount: 0,
      class: "appli",
      hasPermission: false,
    },
    {
      actionName: "我的草稿",
      name: "myDraft",
      amount: 0,
      class: "draft",
      hasPermission: false,
    },
    {
      actionName: "我可查看",
      name: "myView",
      amount: 0,
      class: "view",
      hasPermission: false,
    },
    {
      actionName: "我的报表",
      name: "myReport",
      amount: null,
      class: "report",
      hasPermission: false,
    },
  ];
  viewTaskList: iCard[] = [];
  listsCollection = {
    myTodo: {
      data: [],
      show: true,
      isLoading: false,
    },
    myDone: {
      data: [],
      show: false,
      isLoading: false,
    },
    myApply: {
      data: [],
      show: false,
      isLoading: false,
    },
    myDraft: {
      data: [],
      show: false,
      isLoading: false,
    },
    myView: {
      data: [],
      show: false,
      isLoading: false,
    },
    myReport: {
      data: [],
      show: false,
      isLoading: false,
    },
  };

  taskList: any = {
    myTasks: false, //我的任务
    applied: false, //我发起的
    drafts: false, //我的草稿
    assigned: false, //我的委托
  };
  menuList: any = [];
  public user: any;
  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private listService: WorkspaceListService,
    private listFunctionService: ListFunctionCollectionsService,
    private route: ActivatedRoute,
    private spService: SpecialApprovalService
  ) {}

  onClickTab(name: string) {
    this.listTitle = name;
    switch (name) {
      case "myTodo":
        this.getMyTodo();
        this.show(name);
        break;
      case "myDone":
        this.getMyDone();
        this.show(name);
        break;
      case "myApply":
        this.getMyTask();
        this.show(name);
        break;
      case "myDraft":
        this.getMyDraft();
        this.show(name);
        break;
      case "myView":
        this.getMyView();
        this.show(name);
        break;
      case "myReport":
        // this.getMyReport();
        this.router.navigate(["ecos/my-report"]);
        // this.show(name);
        break;
    }
    this.listComponent.playAnimate();
  }
  show(tabName) {
    for (var i in this.listsCollection) {
      this.listsCollection[i].show = false;
    }
    this.listsCollection[tabName].show = true;
  }

  ngOnInit() {
    this.user = localStorage.getItem("ecom_ng_philips_code1");
    this.user = this.user.toLowerCase();
    this.initMenus();
    this.getMyTodo();
    this.getMyDone();
    this.getMyTask();
    this.getMyDraft();
    this.getMyView();
    this.getMyReport();
    // this.startGuide();
  }

  public myShortAgent = [];
  initMenus() {
    //获取菜单
    this.http.post("/act/role/getDiigtUserInfo").subscribe((res) => {
      if ("0000" == res.code) {
        let menuList = res.data.jurisdictions;
        if (menuList.length > 0) {
          menuList.map((vals) => {
            if (
              vals.id == "621997df-0501-40a3-bd7e-9062291dd4c3" &&
              vals.children &&
              vals.children.length > 0
            ) {
              this.menuList = [...vals.children];
              return true;
            }
            if (vals.id == "71ccd232-7888-4f4e-888e-03eaddb76560") {
              vals.children.map((val) => {
                switch (val.id) {
                  case "5502a4da-75d7-4fe5-aa16-77279767b241":
                    this.cardList.find(
                      (i) => i.name === "myTodo"
                    ).hasPermission = true; //我的待办
                    break;
                  case "0c14eb29-dc6e-4598-9505-81d2af98faf6":
                    this.cardList.find(
                      (i) => i.name === "myDone"
                    ).hasPermission = true; //我的已办
                    break;
                  case "1ced17bf-2802-4210-b30d-05269df07a25":
                    this.cardList.find(
                      (i) => i.name === "myApply"
                    ).hasPermission = true; //我的申请
                    break;
                  case "e29cc299-18d3-4045-bf57-c3bce8716893":
                    this.cardList.find(
                      (i) => i.name === "myDraft"
                    ).hasPermission = true; //我的草稿
                    break;
                  case "e3dc39ff-9595-4de0-9448-5230c0264cdd":
                    this.cardList.find(
                      (i) => i.name === "myView"
                    ).hasPermission = true; //我可查看
                    break;
                  case "b053a4ce-8b35-42a7-a26e-679d712312c0":
                    this.cardList.find(
                      (i) => i.name === "myReport"
                    ).hasPermission = true; //我的报表 V3
                    break;
                }
              });
            }
          });
        }
      }
    });
  }
  getMyTodo() {
    this.listsCollection.myTodo.isLoading = true;
    this.listService
      .getMyTodo({
        pageNo: 1,
        pageSize: 12,
      })
      .subscribe(
        async ({ data, total }) => {
          let SP = await this.spService.getWaitingApproveList({
            pageNo: 1,
            pageSize: 12,
          });
          let spCount = SP.total;

          let card = this.cardList.find((i) => i.class == "mytask");
          if (card) {
            card.amount = total + spCount;
          }

          this.listsCollection.myTodo.data = data
            .concat(
              SP.rows.map((i) => {
                i._applyType = "SPECIAL_APPROVAL";
                return i;
              })
            )
            .filter((i) => i)
            .sort(
              (pre, next) =>
                new Date(next.createTime).getTime() -
                new Date(pre.createTime).getTime()
            )
            .map((ticket) => this.formatCard(ticket))
            .slice(0, 12);

          this.listsCollection.myTodo.isLoading = false;
        },
        (error) => {
          this.listsCollection.myTodo.isLoading = false;
          this.message.create("error", "服务器异常");
        }
      );
  }
  getMyDone() {
    this.listsCollection.myDone.isLoading = true;
    this.listService
      .getMyDone({
        pageNo: 1,
        pageSize: 12,
      })
      .subscribe(
        async ({ data, total }) => {
          let SP = await this.spService.getApprovedList({
            pageNo: 1,
            pageSize: 12,
          });
          let spCount = SP.total;

          let card = this.cardList.find((i) => i.class == "done");
          if (card) {
            card.amount = total + spCount;
          }

          this.listsCollection.myDone.data = data
            .concat(
              SP.rows.map((i) => {
                i._applyType = "SPECIAL_APPROVAL";
                return i;
              })
            )
            .filter((i) => i)
            .sort(
              (pre, next) =>
                new Date(next.createTime).getTime() -
                new Date(pre.createTime).getTime()
            )
            .map((ticket) => this.formatCard(ticket))
            .slice(0, 12);

          this.listsCollection.myDone.isLoading = false;
        },
        (error) => {
          this.listsCollection.myDone.isLoading = false;
          this.message.create("error", "服务器异常");
        }
      );
  }
  getMyTask() {
    this.listsCollection.myApply.isLoading = true;
    this.listService
      .getMyTask({
        pageNo: 1,
        pageSize: 12,
      })
      .subscribe(
        async ({ data, total }) => {
          let SP = await this.spService.getRequestList({
            pageNo: 1,
            pageSize: 12,
          });
          let spCount = SP.total;

          let card = this.cardList.find((i) => i.class == "appli");
          if (card) {
            card.amount = total + spCount;
          }
          this.listsCollection.myApply.data = data
            .concat(
              SP.rows.map((i) => {
                i._applyType = "SPECIAL_APPROVAL";
                return i;
              })
            )
            .filter((i) => i)
            .sort(
              (pre, next) =>
                new Date(next.createTime).getTime() -
                new Date(pre.createTime).getTime()
            )
            .map((ticket) => this.formatCard(ticket))
            .slice(0, 12);

          this.listsCollection.myApply.isLoading = false;
        },
        (error) => {
          this.listsCollection.myApply.isLoading = false;
          this.message.create("error", "服务器异常");
        }
      );
  }
  getMyDraft() {
    this.listsCollection.myDraft.isLoading = true;
    this.listService
      .getMyDraft({
        pageNo: 1,
        pageSize: 12,
      })
      .subscribe(
        async ({ data, total }) => {
          let SP = await this.spService.getDraftList({
            pageNo: 1,
            pageSize: 12,
          });
          let spCount = SP.total;

          let card = this.cardList.find((i) => i.class == "draft");
          if (card) {
            card.amount = total + spCount;
          }

          this.listsCollection.myDraft.data = data
            .concat(
              SP.rows.map((i) => {
                i._applyType = "SPECIAL_APPROVAL";
                return i;
              })
            )
            .filter((i) => i)
            .sort(
              (pre, next) =>
                new Date(next.createTime).getTime() -
                new Date(pre.createTime).getTime()
            )
            .map((ticket) => this.formatCard(ticket))
            .slice(0, 12);

          this.listsCollection.myDraft.isLoading = false;
        },
        (error) => {
          this.listsCollection.myDraft.isLoading = false;
          this.message.create("error", "服务器异常");
        }
      );
  }
  getMyView() {
    this.listsCollection.myView.isLoading = true;
    this.listService
      .getMyView({
        pageNo: 1,
        pageSize: 12,
      })
      .subscribe(
        async ({ data, total }) => {
          let SP = await this.spService.getViewList({
            pageNo: 1,
            pageSize: 12,
          });
          let spCount = SP.total;

          let card = this.cardList.find((i) => i.class == "view");
          if (card) {
            card.amount = total + spCount;
          }

          this.listsCollection.myView.data = data
            .concat(
              SP.rows.map((i) => {
                i._applyType = "SPECIAL_APPROVAL";
                return i;
              })
            )
            .filter((i) => i)
            .sort(
              (pre, next) =>
                new Date(next.createTime).getTime() -
                new Date(pre.createTime).getTime()
            )
            .map((ticket) => this.formatCard(ticket))
            .slice(0, 12);

          this.listsCollection.myView.isLoading = false;
        },
        (error) => {
          this.listsCollection.myView.isLoading = false;
          this.message.create("error", "服务器异常");
        }
      );
  }
  getMyReport() {
    // this.listService.getMyReport({
        //   pageNo: 1,
        //   pageSize: 12,
        // }).subscribe(
    //   (data) => {
    //     console.log("data", data);
    //   },
    //   (error) => {
    //     this.message.create("error", "服务器异常");
    //   }
    // );
  }

  handleMyTodoClick(data) {
    if (data._applyType) {
      const { applyId, taskInstId } = data;
      this.router.navigate(["/special-approval/request", applyId], {
        queryParams: { taskId: taskInstId },
      });
    } else {
      this.listFunctionService.setFlag(0);
      this.listFunctionService.setDraft(false);
      this.listFunctionService.setTask(true);
      this.handleClick(data);
    }
  }
  handleMyDoneClick(data) {
    if (data._applyType) {
      const { applyId } = data;
      this.router.navigate(["/special-approval/request", applyId]);
    } else {
      this.listFunctionService.setFlag(1);
      this.listFunctionService.setDraft(false);
      this.listFunctionService.setTask(false);
      this.handleClick(data);
    }
  }
  handleMyApplyClick(data) {
    if (data._applyType) {
      const { id } = data;
      this.router.navigate(["/special-approval/request", id]);
    } else {
      this.listFunctionService.setFlag(1);
      this.listFunctionService.setDraft(false);
      this.listFunctionService.setTask(false);
      this.handleClick(data);
    }
  }
  handleMyViewClick(data) {
    if (data._applyType) {
      const { id } = data;
      this.router.navigate(["/special-approval/request", id]);
    } else {
      this.listFunctionService.setFlag(1);
      this.listFunctionService.setDraft(false);
      this.listFunctionService.setTask(false);
      this.handleClick(data);
    }
  }

  handleMyReportClick(data) {}
  handleMyDraftClick(data) {
    if (data._applyType) {
      const { id } = data;
      this.router.navigate(["/special-approval/request", id]);
    } else {
      this.listFunctionService.setFlag(0);
      this.listFunctionService.setDraft(true);
      this.listFunctionService.setTask(false);
      this.handleClick(data);
    }
  }

  handleClick(data) {
    // <!-- 三期操作 -->
    if (data.procPhase === "p3") {
      this.listFunctionService.operate(data);
      //       <!-- 一期操作 -->
    }
    // <!--进单oa and 场地审核-->
    else if (data.taskStatus === "DCDSH" || data.taskStatus === "DOACS") {
      this.listFunctionService.goToPreorderaudit(data);
    } else if (data.taskStatus === "DTJ") {
      this.listFunctionService.goToApplyTenderModif(data);
    } else if (data.taskStatus === "DBA") {
      this.listFunctionService.goToBid(data);
    } else if (
      // <!--已中标确认-->
      data.taskStatus === "YZBQR" ||
      data.taskStatus === "YZBQRYBCWJ" ||
      data.taskStatus === "BIDCANCELLED"
    ) {
      this.listFunctionService.goToWinningBid2(data);
    } else if (data.taskStatus === "DSWZYQR") {
      this.listFunctionService.goToWinningBid(data);
    } else if (data.taskStatus === "YZBQRDBCWJ") {
      this.listFunctionService.goToSupportUp(data);
    } else if (
      data.taskStatus === "DSWYSH" ||
      data.taskStatus === "XSBMDMSH" ||
      data.taskStatus === "XSBMZSLSH" ||
      data.taskStatus === "2JSH"
    ) {
      this.listFunctionService.goTenderreview(data);
    } else if (data.taskStatus === "DSWZYSQ") {
      this.listFunctionService.goEmp(data);
    }
    // <!--合同子流程审核  查看-->
    else if (
      data.taskStatus === "DZLCSH" ||
      data.taskStatus === "JDEND" ||
      data.taskStatus === "CANCELLED" ||
      data.taskStatus === "CLOSED"
    ) {
      this.listFunctionService.goUn(data);
    } else if (data.taskStatus === "DOITWJSC") {
      this.listFunctionService.goCompleteOit(data);
    } else if (data.taskStatus === "OITEND") {
      this.listFunctionService.goCompleteOit(data);
    } else if (data.taskStatus === "OITEND") {
      this.listFunctionService.goCompleteOit(data);
    } else if (data.taskStatus === "OITENDDBCWJSC") {
      this.listFunctionService.goCompleteOitFile(data);
    } else if (data.taskStatus === "DBCWJSC") {
      this.listFunctionService.goSuppfile(data);
    }
    // <!--审核order summary -->
    else if (data.taskStatus === "DODSH") {
      this.listFunctionService.goExaminesummary(data);
    }

    // <!-- 审核合同概要表 -->
    // <!-- 待销售部门审核 -->
    // <!--OA审核-->
    // <!--特批进单审核-->
    else if (
      data.taskStatus === "DXSBMSH" ||
      data.taskStatus === "DXSBM2JSH" ||
      data.taskStatus === "DOAJDQR" ||
      data.taskStatus === "DHTOASH" ||
      data.taskStatus === "DFBSH" ||
      data.taskStatus === "DTPJDSH" ||
      data.taskStatus === "cancel_oa_leader_approval" ||
      data.taskStatus === "cancel_sales_approval" ||
      data.taskStatus === "reject_sales_approval" ||
      data.taskStatus === "close_dm_approval" ||
      data.taskStatus === "close_oa_leader_approval" ||
      data.taskStatus === "reject_oa_leader_approval"
    ) {
      this.listFunctionService.goExamineOrder(data);
    }
    // <!--修改合共概要表-->
    // <!--取消进单或者关闭合同概要表-->
    else if (
      data.taskStatus === "CANCELLEDSUB" ||
      data.taskStatus === "CLOSEDSUB"
    ) {
      this.listFunctionService.goExamineOrderEnd(data);
    }
    // <!--取消进单 end-->
    else if (
      data.taskStatus === "DHTGYBTX" ||
      data.taskStatus === "XJDHTGYBTX"
    ) {
      this.listFunctionService.goInconmodif(data);
    }
    // <!--合同签署-->
    else if (data.taskStatus === "DHTQS") {
      this.listFunctionService.goConsign(data);
    } else if (data.taskStatus === "DTXHT") {
      this.listFunctionService.goOrdersummary(data);
    } else if (data.taskStatus === "DBCWJSC") {
      this.listFunctionService.goSuppfile(data);
    } else if (
      // <!--未中标 二次开标 已办查看-->
      (data.taskStatus === "WZB" || data.taskStatus === "2CKB") &&
      1 === this.listFunctionService.flag
    ) {
      this.listFunctionService.goToBid2(data);
    }
    // confirmBidding 你确定要执行待备案的操作
    // else if(){
    //    this.listFunctionService.goToApplyTenderModif(data)
    // }
    // 你确定要执行二次开标的操作
    // else if(){
    //    this.listFunctionService.goToApplyTenderModif(data)
    // }
    else if (
      (data.taskStatus === "ZBSQ" ||
        data.taskStatus === "2CKB" ||
        data.taskStatus === "2CKBZZ") &&
      0 === this.listFunctionService.flag // flag === 0
    ) {
      this.listFunctionService.goEmp2(data);
    }
    // <!--项目终止-二次开标 -->
    else if (data.taskStatus === "2CKBZZ") {
      this.listFunctionService.goToBid(data);
    }
    // <!--改单审批-->
    else if (
      data.taskStatus === "change_oit_approval" ||
      data.taskStatus === "change_oit"
    ) {
      this.listFunctionService.goChangeApproval(data);
    }
    // <!--发起改单-->
    else if (
      data.taskStatus === "prebook_dtj" ||
      data.taskStatus === "prebook_sales_apply"
    ) {
      this.listFunctionService.getPrebook(data);
    }
    // <!--ZPM核查场地状态-->
    else if (
      data.taskStatus === "prebook_zpm_approval" ||
      data.taskStatus === "prebook_dsi_approval"
    ) {
      this.listFunctionService.getPrebookzmp(data);
    }
    // <!--PREBOOK-OA审核 sale leader dsi leader 审核-->
    else if (
      data.taskStatus === "prebook_oa_approval" ||
      data.taskStatus === "prebook_district_leader_approval" ||
      data.taskStatus === "prebook_sales_leader_approval"
    ) {
      this.listFunctionService.getPrebookOA(data);
    } else if (data.taskStatus === "prebook_oa_supplement") {
      this.listFunctionService.getPrebookSupplement(data);
    } else if (
      data.taskStatus === "prebook_om_backfill" ||
      data.taskStatus === "prebook_end"
    ) {
      this.listFunctionService.getPrebookom(data);
    }
    // <!--PREBOOK-om中止的-->
    else if (data.taskStatus === "PREBOOKCANCELLED") {
      this.listFunctionService.getPrebookend(data);
    }
  }
  formatCard(ticket): iCard {
    // console.log(ticket.applyType, ticket._applyType);
    if (!ticket) return null;
    if (ticket._applyType) {
      return {
        ...ticket,
        name: `${ticket._applyType}-${ticket.bidderName}`,
        ...this.formatType(ticket),
        date: ticket.createTime,
      };
    } else {
      return {
        ...ticket,
        name: `${ticket.applyType}-${ticket.bidderName}`,
        ...this.formatType(ticket),
        date: ticket.createTime,
      };
    }
  }
  formatType(ticket) {
    if (ticket._applyType) {
      return {
        type: ticket._applyType,
        color: this.formatColor(ticket),
      };
    } else {
      return {
        type: ticket.applyType,
        color: this.formatColor(ticket),
      };
    }
  }
  formatColor(ticket) {
    let color = "";
    switch (ticket.applyType) {
      case "ZBSQ":
      case "BIDDING":
        color = "#13B474";
        break;
      case "JDZB":
      case "OIT_MAIN":
      case "OIT_SUB":
        color = "#587FDC";
        break;
      case "PREBOOK":
        color = "#FF893B";
        break;
      // case "SPECIAL_APPROVAL":
      //   color = "#FF7F97";
      //   break;
    }
    if (ticket._applyType === "SPECIAL_APPROVAL") {
      color = "#FF7F97";
    }
    return color;
  }
  startGuide() {
    this.route.params.subscribe((res) => {
      let { isGuide } = res;
      if (isGuide) {
        // card-wrapper
        const driver = new Driver({
          allowClose: false,
          overlayClickNext: true,
          showButtons: true,
          keyboardControl: false,
          onNext: (Element: any) => {
            localStorage.setItem("GuideDone", "true");
            this.router.navigate(["/home"]);
          },
        });
        driver.defineSteps([
          {
            element: ".card-wrapper",
            popover: {
              className: "navbar-nav-popover", // fixed的需要设置class Name 并在theme/guide/index.scss中添加position:fixed
              title: "新版工作台首页",
              description: "您可以在这里快速查看您的申请！",
              position: "bottom",
            },
          },
        ]);

        setTimeout(() => {
          driver.start();
        }, 500);
      }
    });
  }
}
