import {ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild,  AfterViewInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FileService, HttpService, NgxDatatableService, UtilityService} from '../../services';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import {YnPipe} from '../../pipes/yn.pipe';
import {saveAs} from 'file-saver';
import {NumeralPipe} from 'ngx-numeral';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'
import { TrainingcostModalComponent } from '../../component/trainingcost-modal/trainingcost-modal.component';

@Component({
  selector: 'quotation-main',
  templateUrl: './quotation-main.component.html',
  styleUrls: ['./quotation-main.component.scss'],
  providers: [YnPipe],
  // encapsulation: ViewEncapsulation.None
})
export class QuotationMainComponent implements OnInit, AfterViewInit {

  //upload progress related
  progressCount: number = 0;

  @ViewChild('tableTotal') tableTotal: DatatableComponent;
  @ViewChild('primary_table') table: DatatableComponent;
  @ViewChild('primary_table2') table2: DatatableComponent;
  expanded: any = {};
  expanded2: any = {};
  @ViewChild('configFilesInput') configFilesInput: ElementRef;
  orderType: string;
  showIGM: boolean = false;
  isZhitou: boolean = false;
  specialEdit: boolean = false;
  pageParams: object = {};
  quotationTitle: string = '';
  comments: string = '';
  loadingIndicator = true;
  loadingIndicator2 = true;
  btnLoading: boolean = false;
  customParams: any;
  rows = [];
  rowsOptRows = [];
  selectedRows = []; //已选择的主配置项列表
  showSelectedTableFlag: boolean = false;
  temp = [];
  editing = {};
  @Input()
  disabled: boolean;
  @Input()
  componentParams = {};
  //qlab
  qlabSelects = [];
  qlabSample: object = {};
  qlabList = [];
  //percunav
  percunavSelects = [];
  percunavSample: object = {};
  percunavList = [];
  //discount
  discountSelects = [];
  discountSample: object = {};
  discountList = [];
  //阶梯价
  ladderpriceSelects = [];
  ladderpriceSample: object = {};
  ladderpriceList = [];
  ladderpriceNotFound = false;
  //Vendorprocucts
  vendorprocuctsSelects = [];
  vendorprocuctsSample: object = {};
  vendorprocuctsList = [];
  //Trainingcost
  trainingflag = false;
  trainingType = 'none';
  trainingsubtype: string = '';
  trainingcostSelects = [];
  trainingcostSample: object = {};
  trainingcostList = [];
  mustOnsiteData_change: boolean;
  mustOnsiteData = -1;
  mustGroupData_change: boolean;
  mustGroupData = -1;
  onsiteData_change: boolean;
  onsiteData = -1;
  GroupData_change: boolean;
  GroupData = -1;
  vendorId_Level: string;  //经销商等级
  subTypeBoo: boolean;  //是否有资格培训
  //OtherTraining
  otherTrainingSample: any;
  otherTrainingSelects = [];
  otherTrainingList = [];
  otherTrainingSelectedId: string = '';
  //promotion
  promotionSelects = [];
  promotionSample: object = {};
  promotionList = [];
  //freight运费
  shippingCost: object = {};
  shippingCostList = [];
  serverSideFilterShippingCost = [];
  shippingCostTypeahead = new EventEmitter<string>();
  //安装费
  installationfeeSelects = [];
  installationfeeSample: object = {};
  installationfeeList = [];
  //special
  specialList = [];
  //otherfee
  otherfeeSelects = [{'name': '招标费用'}, {'name': '佣金'}, {'name': '检测费'}, {'name': '其他'}];
  otherfeeSample: String = '';
  otherfeeOther: String = '';
  otherfeeList = [];
  //保修费
  maintenanceSelects = [];
  maintenanceList = [];
  mustMaintenanceYears: number = 0;
  optionMaintenanceYears: number = 0;
  optionMaintenanceYearsDisabled: boolean = false;
  selectedWarrantyItem: any;
  //配置文件
  configfileList = [];
  //总价
  totalList = [];
  //commercial的总价
  totalListCommercial = [];
  //special的总价 二期
  totalListSpecial = [];
  //oldIGM
  oldIGM: string = '';
  @Output() onQuotationDetailChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  currencyType: string = '';//'usd' or 'rmb'
  prefix: string = '';
  hospitalType: string = ''; // 1公立 0民营 2其他
  subTypeId: string; //亚型id
  philipType: string = '';
  philipAuthList: any[] = [];
  clinical: string;   //TODO
  vendorId: string = ''; //经销商id，distributorId
  _6nc: string;
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getCellClassAlt = this.ngxDatatableService.getCellClassAlt;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;
  @ViewChild('quotationDetailForm')
  private quotationDetailForm: ElementRef;
  igmEdited: boolean = false;
  //dynamic tooltips
  otherfeeHeaderTooltip: string;
  //new-trainingcost related
  newtrainingcostPriceTag: boolean = true; //单价显示，默认为true
  trainingcostVer: string; // '2' is for new-trainingcost
  newTrainingcostOnsite: any = {};
  newTrainingcostGroup: any = {};
  newTrainingcostGroupOpt: any[] = [];
  newTrainingcostOther: any[] = [];
  newTrainingcostOtherSum: any = {};
  //new-trainingcost input fields controller
  newTrainingcostInputControl: any = {
    'onsiteTotal': true,
    'onsiteMust': true,
    'onsiteOpt': true,
    'groupTotal':true,
    'groupMust':true,
  };
  //new-maintenance related
  maintenanceVer: string; // '2' is for new-maintenace
  maintenanceSum: any = {
    total: 0,
    totalRaw: 0,
    count: 0,
    countRaw: 0
  };
  isPrivate:number; //P2 added
  formatNumber: any;

  //20200601 可以修改设备总价
  editingCell: any = {};
  //设备总价（原价）
  t70: any = null;

  constructor(private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private toastrService: ToastrService,
    private cd: ChangeDetectorRef,
    private fileService: FileService,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: any,
    private modalService: NgbModal,
    private utilityService: UtilityService) {


    this.formatNumber = this.utilityService.formatPositiveIntNumber;
    // this.showSelectedTableFlag = !!this.disabled;

    this.qlabSample = {
      'col1': '',
      'col2': '',
      'col3': '',
      'col4': '',
      'col5': ''
    };
    this.percunavSample = {
      'col1': '',
      'col2': '',
      'col3': '',
      'col4': '',
      'col5': ''
    };
    this.discountSample = {
      'col1': '',
      'col2': ''
    };
    this.promotionSample = {
      'col1': '',
      'col2': '',
      'col3': '',
      'col4': '',
      'col5': '',
      'col6': '',
      'col7': ''
    };

    this.ladderpriceSample = {
      'col1': '',
      'col2': ''
    };

    this.specialList = [{
      'reason': '',
      'reasonEn': '',
      'usd': '',
      'rmb': ''
    }];

    this.installationfeeSample = {
      col1: '',
      col2: '',
      col3: '',
      col4: '',
      col5: ''
    };
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.table.recalculate();
      if(this.showSelectedTableFlag) {
        this.table2.recalculate();
      }
      }, 500);
  }

  ngOnInit() {
    //file upload progress control
    this.fileService.progressSubject.subscribe(res => {
      this.progressCount = res as number;
    });

    console.log('componentParams', this.componentParams);
    this.customParams = this.componentParams['customParams'];
    // console.log('customParams', this.customParams);

    this.orderType = this.componentParams['orderType'] || undefined;
    this.initTooltipsKey();
    this.showIGM = this.componentParams['igmFlag'] || false;
    if(this.showIGM && this.orderType == '0') { //特价带出的进单才有igm显示
      this.showIGM = false;
    }
    this.isZhitou = this.componentParams['isZhitou'] || false;
    this.specialEdit = this.componentParams['specialEdit'] || false;
    this.currencyType = this.componentParams['currencyType'];
    this.isPrivate = this.componentParams['isPrivate'];
    this.prefix = this.currencyType == 'usd' ? '$' : this.currencyType == 'rmb' ? '￥' : '';
    this.hospitalType = this.componentParams['hospitalType'];
    console.log('init, hospital type ->', this.hospitalType);
    console.log('init, isPrivate ->', this.isPrivate);
    this.hospitalType = (1 === this.isPrivate) ? '0' : this.hospitalType; //p2: 如果isPrivate为1，强制走民营医院的培训费和保修费; hospitalType 0民营 1公立
    console.log('init, hospital type final ->', this.hospitalType);
    this.subTypeId = this.componentParams['subTypeId'];
    this.vendorId = this.componentParams['distributorId'];
    this.clinical = this.componentParams['clinical'];
    this._6nc = this.componentParams['_6nc'];
    this.disabled = this.componentParams['disabled'];
    this.showSelectedTableFlag = !!this.disabled;
    this.philipType = this.componentParams['philipsType'];
    this.philipAuthList = this.componentParams['philipsAuthList'] || [];
    console.log('orderType', this.orderType);
    console.log('subTypeId', this.subTypeId);
    console.log('philipType', this.philipType);
    console.log('philipAuthType', this.philipAuthList);

    this.initPrimaryList();
    if (this.componentParams['qdetail']) {
      //options加载
      if (this.componentParams['qdetail']['rowsOptRows']) {
        this.rowsOptRows = [...this.componentParams['qdetail']['rowsOptRows']];
      }

      //qlab加载
      if (this.componentParams['qdetail']['qlabRows']) {
        this.qlabList = [...this.componentParams['qdetail']['qlabRows']];
      }
      //percunav加载
      if (this.componentParams['qdetail']['percunavRows']) {
        this.percunavList = [...this.componentParams['qdetail']['percunavRows']];
      }
      //discount加载
      if (this.componentParams['qdetail']['discountRows']) {
        this.discountList = [...this.componentParams['qdetail']['discountRows']];
      }

      //promotion加载
      if (this.componentParams['qdetail']['promotionRows']) {
        this.promotionList = [...this.componentParams['qdetail']['promotionRows']];
      }

      //vendorprocucts加载
      if (this.componentParams['qdetail']['vendorprocuctsRows']) {
        this.vendorprocuctsList = [...this.componentParams['qdetail']['vendorprocuctsRows']];
      }

      //trainingcost加载
      if (this.componentParams['qdetail']['trainingcostRows']) {
        this.trainingcostList = this.componentParams['qdetail']['trainingcostRows'];
      }

      //special加载
      if (this.componentParams['qdetail']['specialRows']) {
        this.specialList = [...this.componentParams['qdetail']['specialRows']];
      }

      //otherfee加载
      if (this.componentParams['qdetail']['otherfeeRows']) {
        this.otherfeeList = [...this.componentParams['qdetail']['otherfeeRows']];
      }

      //ladderprice加载
      if (this.componentParams['qdetail']['ladderpriceRows']) {
        this.ladderpriceList = [...this.componentParams['qdetail']['ladderpriceRows']];
        //初始化sample框
        if (this.ladderpriceList.length > 0) {
          let ladderpriceNow = this.ladderpriceList[0];
          this.ladderpriceSample = {
            col1: ladderpriceNow['type'],
            col2: ladderpriceNow['percent'],
          };
        }
      }

      //installationfee加载
      if (this.componentParams['qdetail']['installationfeeRows']) {
        this.installationfeeList = [...this.componentParams['qdetail']['installationfeeRows']];
      }

      //shippingCost加载
      if (this.componentParams['qdetail']['shippingCostRows']) {
        this.shippingCostList = [...this.componentParams['qdetail']['shippingCostRows']];
      }

      //maintenance加载
      if (this.componentParams['qdetail']['maintenanceRows']) {
        this.maintenanceList = [...this.componentParams['qdetail']['maintenanceRows']];
      }

      //培训费相关参数
      if (this.componentParams['qdetail']['trainingcostSample']) {
        this.trainingcostSample = this.componentParams['qdetail']['trainingcostSample'];
      }

      if (this.componentParams['qdetail']['trainingflag']) {
        this.trainingflag = this.componentParams['qdetail']['trainingflag'];
      }

      if (this.componentParams['qdetail']['trainingType']) {
        this.trainingType = this.componentParams['qdetail']['trainingType'];
      }

      if (this.componentParams['qdetail']['mustOnsiteData']) {
        this.mustOnsiteData = this.componentParams['qdetail']['mustOnsiteData'];
      }
      if (this.componentParams['qdetail']['mustGroupData']) {
        this.mustGroupData = this.componentParams['qdetail']['mustGroupData'];
      }
      if (this.componentParams['qdetail']['onsiteData']) {
        this.onsiteData = this.componentParams['qdetail']['onsiteData'];
      }
      if (this.componentParams['qdetail']['GroupData']) {
        this.GroupData = this.componentParams['qdetail']['GroupData'];
      }
      if (this.componentParams['qdetail']['mustOnsiteData_change']) {
        this.mustOnsiteData_change = this.componentParams['qdetail']['mustOnsiteData_change'];
      }
      if (this.componentParams['qdetail']['mustGroupData_change']) {
        this.mustGroupData_change = this.componentParams['qdetail']['mustGroupData_change'];
      }
      if (this.componentParams['qdetail']['onsiteData_change']) {
        this.onsiteData_change = this.componentParams['qdetail']['onsiteData_change'];
      }
      if (this.componentParams['qdetail']['GroupData_change']) {
        this.GroupData_change = this.componentParams['qdetail']['GroupData_change'];
      }

      //其他培训费
      if (this.componentParams['qdetail']['otherTrainingRows']) {
        this.otherTrainingList = [...this.componentParams['qdetail']['otherTrainingRows']];
      }

      //培训费 ver2
      //newtrainingcost ver2 added start
      if (this.componentParams['qdetail']['trainingcostVer']) {
        this.trainingcostVer = this.componentParams['qdetail']['trainingcostVer'];
      }
      if (this.componentParams['qdetail']['newTrainingcostOnsite']) {
        this.newTrainingcostOnsite = this.componentParams['qdetail']['newTrainingcostOnsite'];
      }
      if (this.componentParams['qdetail']['newTrainingcostGroup']) {
        this.newTrainingcostGroup = this.componentParams['qdetail']['newTrainingcostGroup'];
      }
      if (this.componentParams['qdetail']['newTrainingcostGroupOpt']) {
        this.newTrainingcostGroupOpt = [...this.componentParams['qdetail']['newTrainingcostGroupOpt']];
      }
      if (this.componentParams['qdetail']['newTrainingcostOtherSum']) {
        this.newTrainingcostOtherSum = this.componentParams['qdetail']['newTrainingcostOtherSum'];
      }
      if (this.componentParams['qdetail']['newTrainingcostOther']) {
        this.newTrainingcostOther = [...this.componentParams['qdetail']['newTrainingcostOther']];
      }
      //newtrainingcost ver2 added end

      //newMaintenace ver2 added start
      if (this.componentParams['qdetail']['maintenanceVer']) {
        this.maintenanceVer = this.componentParams['qdetail']['maintenanceVer'];
      }
      if (this.componentParams['qdetail']['maintenanceSum']) {
        this.maintenanceSum = this.componentParams['qdetail']['maintenanceSum'];
      }
      //newMaintenace ver2 added end

      //configfiles加载
      if (this.componentParams['qdetail']['configfileRows']) {
        this.configfileList = [...this.componentParams['qdetail']['configfileRows']];
      }

      //老igm
      if (this.componentParams['qdetail']['oldIGM']) {
        this.oldIGM = this.componentParams['qdetail']['oldIGM'] || '';
      }

      //igm是否手动编辑过
      this.igmEdited = this.componentParams['qdetail']['igmEdited'] || false;

      //总价加载
      if (this.componentParams['qdetail']['totalRows']) {
        setTimeout(() => {
          this.totalList = [...this.componentParams['qdetail']['totalRows']];
          console.log(this.oldIGM);

          // commercial进单时的额外数据结构
          if (this.orderType) {
            if (this.orderType == '1' && this.oldIGM === '') {
              this.oldIGM = this.getSingleTotalMoney('T14');
            }
            if (this.componentParams['qdetail']['totalRows']) {
              this.getTotalListCommercial();
            }
          } else {// special时的新的数据结构 二期
            if (this.componentParams['qdetail']['totalRows']) {
              this.getTotalListCommercial();
              this.getTotalListSpecial();
            }
          }
        }, 500);
      }
    }

    this.initQlabSelect();
    this.initPercunavSelect();
    this.initDiscountSelect();
    this.initPromotionSelect();
    this.initLadderpriceSelect();
    this.initInstallationfeeSelect();

    this.initVendorprocucts();
    if (!this.trainingflag) {
      this.trainingsubtype = this.subTypeId;
      this.initTrainingcost();
    }
    this.mustOnsiteData = this.mustOnsiteData == -1 ? 0 : this.mustOnsiteData;
    this.mustGroupData = this.mustGroupData == -1 ? 0 : this.mustGroupData;
    this.onsiteData = this.onsiteData == -1 ? 0 : this.onsiteData;
    this.GroupData = this.GroupData == -1 ? 0 : this.GroupData;

    this.initOtherTrainingSelect();

    if(this.trainingflag) {
      this.initNewTrainingcost();
    }

    this.updateQuotationParams();
    this.serverSideSearchShippingCost();
    this.initMaintenanceCost();

    console.log('currencyType', this.currencyType);

    //TODO below
    console.log('disabled => ', this.disabled);

  }

  //ngOnInit ends

  updateTotalRows() {
    if (this.orderType) {
      if ('0' === this.orderType) {


      } else {

        if (this.oldIGM === '') {


        }
      }
    }

  }


  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);

    this.updateQuotationParams();
  }

  updateValueSelected(event, cell, rowIndex, row) {
    this.selectedRows[rowIndex][cell] = event.target.value;
    this.selectedRows = [...this.selectedRows];
    if(row && row['row']) {
      let changeFlag = false;
      for(let obj of this.rows) {
        if(obj['row'] && obj['row'] == row['row']) {
          obj[cell] = event.target.value;
          changeFlag =true;
          break;
        }
      }
      if(changeFlag) {
        this.rows = [...this.rows];
        this.updateQuotationParams();
      }
    }
  }

  public updateQuotationParams(): void {

    this.pageParams['qTitle'] = this.quotationTitle || '';
    this.pageParams['qComments'] = this.comments;
    this.pageParams['rows'] = this.rows;
    this.pageParams['rowsOptRows'] = this.rowsOptRows;
    this.pageParams['qlabRows'] = this.qlabList;
    this.pageParams['percunavRows'] = this.percunavList;
    this.pageParams['discountRows'] = this.discountList;
    this.pageParams['maintenanceRows'] = this.maintenanceList;

    this.pageParams['vendorprocuctsRows'] = this.vendorprocuctsList;
    this.pageParams['trainingcostRows'] = this.trainingcostList;
    this.pageParams['trainingcostSample'] = this.trainingcostSample;
    console.log('trainingcostSample ->', this.trainingcostSample);
    this.pageParams['mustOnsiteData'] = this.mustOnsiteData;
    this.pageParams['mustGroupData'] = this.mustGroupData;
    this.pageParams['onsiteData'] = this.onsiteData;
    this.pageParams['GroupData'] = this.GroupData;
    this.pageParams['mustOnsiteData_change'] = this.mustOnsiteData_change;
    this.pageParams['mustGroupData_change'] = this.mustGroupData_change;
    this.pageParams['onsiteData_change'] = this.onsiteData_change;
    this.pageParams['GroupData_change'] = this.GroupData_change;
    this.pageParams['trainingflag'] = this.trainingflag;
    this.pageParams['trainingType'] = this.trainingType;
    this.pageParams['otherTrainingRows'] = this.otherTrainingList;
    //newtrainingcost ver2 added start
    this.pageParams['trainingcostVer'] = this.trainingcostVer;
    this.pageParams['newTrainingcostOnsite'] = this.newTrainingcostOnsite;
    this.pageParams['newTrainingcostGroup'] = this.newTrainingcostGroup;
    this.pageParams['newTrainingcostGroupOpt'] = this.newTrainingcostGroupOpt;
    this.pageParams['newTrainingcostOtherSum'] = this.newTrainingcostOtherSum;
    this.pageParams['newTrainingcostOther'] = this.newTrainingcostOther;
    //newtrainingcost ver2 added end
    //newMaintenance ver2 added start
    this.pageParams['maintenanceVer'] = this.maintenanceVer;
    this.pageParams['maintenanceSum'] = this.maintenanceSum;
    //newMaintenance ver2 added end
    this.pageParams['promotionRows'] = this.promotionList;
    this.pageParams['specialRows'] = this.specialList;
    this.pageParams['otherfeeRows'] = this.otherfeeList;
    this.pageParams['ladderpriceRows'] = this.ladderpriceList;
    this.pageParams['installationfeeRows'] = this.installationfeeList;
    this.pageParams['shippingCostRows'] = this.shippingCostList;
    this.pageParams['totalRows'] = this.totalList;
    if (this.orderType) { //commercial时进入
      this.pageParams['configfileRows'] = this.configfileList;
    }
    this.pageParams['oldIGM'] = this.oldIGM;
    this.pageParams['igmEdited'] = this.igmEdited;

    this.onQuotationDetailChanged.emit(this.pageParams);
  }


  togglePrimaryTableExpandRow(row) {
    if (row.details.length > 0) {
      this.table.rowDetail.toggleExpandRow(row);
    }
  }

  toggleSelectedPrimaryTableExpandRow(row) {
    if (row.details.length > 0) {
      this.table2.rowDetail.toggleExpandRow(row);
    }
  }

  primaryTableRowClass(row) {
    return {
      'row-bold': row.bold !== 'false',
    };
  }

  initPrimaryList() {
    this.loadingIndicator = true;
    if (this.componentParams['qdetail']) {
      if (this.componentParams['qdetail']['rows'] && this.componentParams['qdetail']['rows'].length != 0) {
        this.rows = [...this.componentParams['qdetail']['rows']];
        this.quotationTitle = this.componentParams['qdetail']['qTitle'] || '';
        this.comments = this.componentParams['qdetail']['qComments'] || '';
        if (this.showSelectedTableFlag) {
          this.initSelectedPrimaryList();
        }
        setTimeout(() => {
          this.table.recalculate();
          this.loadingIndicator = false;
        }, 50);
        return;
      }
    } else {
      //version control can be applied here
      this.trainingcostVer = '2'; //new-trainingcost
      this.maintenanceVer = '2'; //new-maintenance
    }
    this.http.get(`/act/quotation/queryById/${this.componentParams['quotationId']}`).subscribe(res => {
      if ('0000' == res.code) {

        const {content} = res.data;
        console.log('data123', res.data);
        const {items, title, comments} = content[0];
        this.quotationTitle = title;
        this.comments = '';
        if (comments && comments.length > 0) {
          this.comments = comments.join(' ');
        }
        let primaryList = [];
        let optList = [];
        let optCount = 0;
        let optLeft = 0;
        let optNames = [];
        let optRaw = undefined;

        let primaryData = undefined;
        for (let index = 0; index < items.length; index++) {
          const {QTY, header, row, options, ...others} = items[index];
          if (others['fontColor'] && '0000' === others['fontColor']) {
            others['fontColor'] = '000000';
          }
          const _qty = QTY === '_' ? '' : QTY;
          let optFlag = undefined;
          // if(options) {

          // }
          //生成N选M规则参数 starts
          if(options && optLeft == 0) {
            optCount += 1;
            optNames = [];
            optLeft = Number(options.split('-')[0]) || 0;
            optRaw = options;
          }

          console.log(others['PN']);

          if (optLeft > 0 && (others['PN'])) {
            optNames.push(others['chinese'] || '');
            optFlag = 'option' + optCount;


            optLeft = optLeft -1;

            if(optLeft == 0) {
              let optItem = {
                optFlag : optFlag,
                raw: optRaw,
                optNames:optNames
              };
              this.rowsOptRows.push(optItem);
            }
          }
          //生成N选M规则参数 ends

          if (!!QTY || header === 'Y') {
            if (primaryData) {
              primaryList.push({...primaryData});
            }
            primaryData = {
              maxqty: 999,
              _qty,
              'QTY': QTY,
              row: row,
              optFlag:optFlag,
              details: [],
              ...others,
            };
            if (index === (items.length-1)) {
              primaryList.push({ ...primaryData });
            }
          } else {
            if (primaryData && primaryData['QTY'] && (!!QTY || header === 'Y')) {
              primaryList.push({ ...primaryData });
              primaryData = undefined;
            } else
            if (primaryData) {
              primaryData['details'].push({
                row: row,
                ...others
              });
              if (index === (items.length - 1)) {
                primaryList.push({ ...primaryData });
              }
            } else {
              primaryData = {
                ...items[index],
                details: [],
              };
            }
          }
        }
        console.log('primaryList', primaryList);
        for (let j = 0; j < primaryList.length; j++) {
          if (primaryList[j]['PN'] && '' != primaryList[j]['PN'] && primaryList[j]['QTY']) {
            if ('_' == primaryList[j]['QTY']) {
              primaryList[j]['maxqty'] = 1;
            }
            break;
          }
        }
        this.rows = [...primaryList];
        this.loadingIndicator = false;
        if(this.showSelectedTableFlag) {
          this.initSelectedPrimaryList();
        }
      }
    });
  }

  initSelectedPrimaryList() {
    this.selectedRows = [];
    this.loadingIndicator2 = true;
    this.selectedRows = [];
    const rows = this.rows;
    let sRows = [];
    if(rows) {
      rows.forEach(item => {
        if(item['_qty'] && '' !== item['_qty'] && 0 != item['_qty']) {
          sRows.push(item);
        }
      });
    }
    this.selectedRows = [...sRows];
    console.log('selectedRows', this.selectedRows);
    setTimeout(() => {
      this.table2.recalculate();
      this.loadingIndicator2 = false;
    },  100);
  }


  toggleSelectedPrimaryTable() {
    console.log(this.showSelectedTableFlag);
    if(this.showSelectedTableFlag) {
      this.showSelectedTableFlag = !this.showSelectedTableFlag;
      this.loadingIndicator = true;
      setTimeout(() => {
        this.table.recalculate();
        this.loadingIndicator = false;
      }, 100);
    } else {
      this.showSelectedTableFlag = !this.showSelectedTableFlag;
      this.initSelectedPrimaryList();
    }
  }

  initQlabSelect() {
    this.qlabSelects = undefined;
    this.http.post('/act/masterdata/queryJsonByCondition/qlab', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        console.log('qlab', res.data);
        // this.qlabSelects = JSON.parse(res.data);
        this.qlabSelects = this.filterQlabSelect(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  filterQlabSelect(data) {// if raw data's item has not check column value, dont put it in the selectable list
    let result = [];
    const raw = JSON.parse(data);
    const check = this.currencyType == 'usd' ? 'usd_list_price' : 'rmb_list_price';
    if (raw) {
      for (const qlab of raw) {
        if (qlab[check] && '' != qlab[check]) {
          result.push(qlab);
        }
      }
    }
    return result;
  }

  initPercunavSelect() {
    this.percunavSelects = undefined;
    this.http.post('/act/masterdata/queryJsonByCondition/percunav', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        // this.percunavSelects = JSON.parse(res.data);
        this.percunavSelects = this.filterPercunavSelect(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  filterPercunavSelect(data) {// if raw data's item has not check column value, dont put it in the selectable list
    let result = [];
    const raw = JSON.parse(data);
    const check = this.currencyType == 'usd' ? 'usd_dealer_price' : 'rmb_dealer_price';
    if (raw) {
      for (const percunav of raw) {
        if (percunav[check] && '' != percunav[check]) {
          result.push(percunav);
        }
      }
    }
    return result;
  }

  initDiscountSelect() {
    this.discountSelects = undefined;
    if (this.discountList.length == 0) {
      this.discountList = [{'type': '请选择', 'dicount': ''}];
    }
    this.http.post('/act/masterdata/queryJsonByCondition/generaldiscount', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        this.discountSelects = JSON.parse(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  initPromotionSelect() {
    this.promotionSelects = undefined;
    //aaaa
    // console.log('123123',this.clinical);
    this.http.post('/act/masterdata/queryJsonByCondition/promotion', {
      status: '1',
      'Clinical_Segmentation': this.clinical
    }).subscribe(res => {
      if ('0000' == res.code) {
        this.promotionSelects = this.filterPromotionSelect(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  filterPromotionSelect(data) {
    let result = [];
    const raw = JSON.parse(data);
    const check = this.currencyType == 'usd' ? 'usd' : 'rmb';
    if (raw) {
      for (const promotion of raw) {
        if (promotion[check] && '' != promotion[check]) {
          result.push(promotion);
        }
      }
    }
    return result;
  }

  initLadderpriceSelect() {
    this.ladderpriceSelects = undefined;
    // if ('1' == this.hospitalType) { //仅当公立医院时，享受阶梯价;updated: 任何类型的医院都可以选择阶梯价分类，是民营还是公立
    let ladderpriceRawPub = undefined;
    let ladderpriceRawPri = undefined;
    // let hospitalTypeName = this.hospitalType == '1' ? '公立' : this.hospitalType == '2' ? '民营' : '其他';
    this.http.post('/act/masterdata/queryJsonByCondition/ladderprice', {status: '1', 'subtype_ID': this.subTypeId}).subscribe(res => {
      if ('0000' == res.code) {
        if (res.data && res.data.length > 0) {
          const data = JSON.parse(res.data);
          for (let i = 0; i < data.length; i++) {
            if (data[i]['Hospital_Type'] == '公立') {
              ladderpriceRawPub = data[i];
            }
            if (data[i]['Hospital_Type'] == '民营') {
              ladderpriceRawPri = data[i];
            }
          }

          if (ladderpriceRawPub || ladderpriceRawPri) {
            this.ladderpriceSelects = [];
            if (ladderpriceRawPub) {
              for (const letter of ['A', 'B', 'C', 'D', 'E']) {
                if (ladderpriceRawPub[letter] && '' !== ladderpriceRawPub[letter]) {
                  let item = {'type': letter + '价' + ' - 公立', 'percent': ladderpriceRawPub[letter]};
                  this.ladderpriceSelects.push(item);
                }
              }
            }
            if (ladderpriceRawPri) {
              for (const letter of ['A', 'B', 'C', 'D', 'E']) {
                if (ladderpriceRawPri[letter] && '' !== ladderpriceRawPri[letter]) {
                  let item = {'type': letter + '价' + ' - 民营', 'percent': ladderpriceRawPri[letter]};
                  this.ladderpriceSelects.push(item);
                }
              }
            }

            if (this.ladderpriceSelects.length < 1) {
              this.ladderpriceNotFound = true;
            }
          } else {
            this.ladderpriceNotFound = true;
          }
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  initInstallationfeeSelect() {
    this.installationfeeSelects = undefined;

    const check = this.currencyType == 'usd' ? 'usd' : 'cny';
    let subtype_id = this.subTypeId;
    // console.log(this.subTypeId);

    this.http.post('/act/masterdata/queryJsonByCondition/installationfee', {status: '1', 'subtype_ID': subtype_id}).subscribe(res => {
      if ('0000' == res.code) {
        if (res.data && res.data.length > 0) {
          const data = JSON.parse(res.data);
          this.installationfeeSelects = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i]['subtype_ID'] == this.subTypeId && data[i][check] && '' != data[i][check]) {
              this.installationfeeSelects.push(data[i]);
            }
          }
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  initMaintenanceCost() {
    // const hospitalTypeName = this.hospitalType === '1' ? '公立' : (this.hospitalType === '0' ? '民营' : null);
    const hospitalTypeName = this.hospitalType === '1' ? '公立' : (this.hospitalType === '0' ? '民营' : '其他');
    console.log('_6nc', this._6nc);
    const queryCondition = `6nc = '${this._6nc}' and ${!hospitalTypeName ? 'hospital_type is null' : 'hospital_type = \'' + hospitalTypeName + '\''} and status='1'`;

    this.http.post('/act/masterdata/queryByWhere/warrantycharges', {condition: queryCondition}).subscribe(res => {
      console.log('initMainenanceCost', res);
      const list = this.filterWarrantycharges(res.data);
      //必须加入
      if (list.length > 0) {

        const first = list[0];
        const period = <string>first.Standard_Warranty_Period;
        this.mustMaintenanceYears = period.indexOf('+') > 0 ? parseInt(period.split('+')[1]) : 0;

        const {
          Option_: option,
          Standard_option: standard_option,
          extended_year_1_warranty_usd,
          extended_year_1_warranty_rmb,
          extended_year_2_to_n_warranty_usd,
          extended_year_2_to_n_warranty_rmb,
        } = first;
        const cost1 = this.currencyType === 'usd' ? parseInt(extended_year_1_warranty_usd) : parseInt(extended_year_1_warranty_rmb);
        const cost2 = this.currencyType === 'usd' ? parseInt(extended_year_2_to_n_warranty_usd) : parseInt(extended_year_2_to_n_warranty_rmb);
        this.optionMaintenanceYearsDisabled = !cost2;
        const data = {
          uuid: 'primary_1',
          requireYear: this.mustMaintenanceYears,
          optionYear: this.optionMaintenanceYears,
          cost1,
          cost2,
          name: `主机(${option}:${standard_option})`,
          type: 'primary',
          data: first
        };
        if (this.maintenanceList && this.totalList.length == 0) {
          let needPrimary = true;
          this.maintenanceList.forEach(({type}) => {
            if (type === 'primary') {
              needPrimary = false;
              return false;
            }
          });
          if (needPrimary) {
            this.maintenanceList = [...this.maintenanceList, data];
          } else {
            this.maintenanceList = [...this.maintenanceList];
          }
        }
        // this.maintenanceCostRecalculate();
        if (this.maintenanceList.length > 0) {
          this.optionMaintenanceYears = this.maintenanceList[0]['optionYear'] || 0;
        }
        let index = 0;
        const dataList = list.map((item) => {
          const {
            extended_year_1_warranty_usd,
            extended_year_1_warranty_rmb,
            extended_year_2_to_n_warranty_usd,
            extended_year_2_to_n_warranty_rmb,
            Standard_Warranty_Period,
            Option_,
            Standard_option

          } = item;
          index++;
          return {
            uuid: 'primary_' + index,
            cost1: this.currencyType === 'usd' ? parseInt(extended_year_1_warranty_usd) : parseInt(extended_year_1_warranty_rmb),
            cost2: this.currencyType === 'usd' ? parseInt(extended_year_2_to_n_warranty_usd) : parseInt(extended_year_2_to_n_warranty_rmb),
            name: Option_ + ' ' + Standard_option,
            type: 'primary',
            data: item
          };
        });
        this.maintenanceSelects = [
          ...this.maintenanceSelects,
          ...dataList];
      }
      if (this.maintenanceList.length > 0 && !this.maintenanceList[0]['total'] && 0 !== this.maintenanceList[0]['total'] ) { //2019-11-11 bug fixed
        this.optionMaintenanceYears = 0;
        this.maintenanceCostRecalculate();
      }
      this.initMaintenanceProbeCost();
    });
  }

  filterWarrantycharges(data) {
    let result = [];
    const raw = data;
    const check = this.currencyType == 'usd' ? 'extended_year_1_warranty_usd' : 'extended_year_1_warranty_rmb';
    if (raw) {
      for (const item of raw) {
        if (item[check] && '' != item[check]) {
          result.push(item);
        }
      }
    }
    return result;

  }


  initMaintenanceProbeCost() {
    // console.log(this._6nc);

    const queryCondition = `(6NC = '${this._6nc}' or 6NC is null) and status='1'`;
    this.http.post('/act/masterdata/queryByWhere/probewarrantycharges', {condition: queryCondition}).subscribe(res => {
      console.log('initMaintenanceProbeCost', res);
      if ('0000' == res.code) {
        const list = this.filterProbeWarrantycharges(res.data);
        let index = 0;

        const dataList = list.map((item) => {
          const {
            Transducer_Type,
            extended_year_1_warranty_usd,
            extended_year_1_warranty_rmb,
            extended_year_2_to_n_warranty_rmb,
            extended_year_2_to_n_warranty_usd,
          } = item;
          index++;
          return {
            uuid: 'prod_' + index,
            cost1: this.currencyType === 'usd' ? parseInt(extended_year_1_warranty_usd) : parseInt(extended_year_1_warranty_rmb),
            cost2: this.currencyType === 'usd' ? parseInt(extended_year_2_to_n_warranty_usd) : parseInt(extended_year_2_to_n_warranty_rmb),
            name: Transducer_Type,
            type: 'prod',
            data: item,
          };
        });

        this.maintenanceSelects = [
          ...this.maintenanceSelects,
          ...dataList
        ];
      }
    });
  }

  filterProbeWarrantycharges(data) {
    let result = [];
    const raw = data;
    const check = this.currencyType == 'usd' ? 'extended_year_1_warranty_usd' : 'extended_year_1_warranty_rmb';
    if (raw) {
      for (const item of raw) {
        if (item[check] && '' != item[check]) {
          result.push(item);
        }
      }
    }
    return result;
  }

  changeOptionMaintenanceYears(event) {
    let tmp = this.formatNumber(event, null, '', '0');
    event.target.value = tmp;
    if (event.target.value >= 0) {
      this.optionMaintenanceYears = event.target.value ? event.target.value : 0;
      this.maintenanceCostRecalculate();
    }
    this.updateQuotationParams();
  }

  maintenanceCostRecalculate() {
    const resetList = this.maintenanceList.map(({cost1, cost2, total, ...others}) => {
      const totalYears = parseInt(this.mustMaintenanceYears.toString()) + parseInt(this.optionMaintenanceYears.toString());
      let totalCount = 0;
      if (cost2) {
        totalCount = totalYears > 1 ? (cost1 + (totalYears - 1) * cost2) : totalYears == 1 ? cost1 : 0;
      } else {
        totalCount = totalYears > 1 ? (cost1 + (totalYears - 1) * 0) : totalYears == 1 ? cost1 : 0;
        // totalCount = cost1;
      }
      return {
        ...others,
        cost1,
        cost2,
        requireYear: this.mustMaintenanceYears,
        optionYear: this.optionMaintenanceYears,
        total: totalCount
      };
    });
    // console.log(resetList);
    this.maintenanceList = [...resetList];
    console.log('maintenanceList', this.maintenanceList);
    if('2' === this.maintenanceVer) {
      this.updateMaintenanceSum();
    }
  }

  //除了主机以外可以重复选择探头保修费项目
  selectMaintenanceCost(value) {
    // let duplicate = false;
    // this.maintenanceList.forEach(item => {
    //   if (item.uuid === value.uuid) {
    //     duplicate = true;
    //     return false;
    //   }
    // });
    // if (duplicate) {
    //   console.log('选择重复！', value.uuid);
    //   return;
    // }
    // console.log('maintenanceSelect', value);
    if (!value) {
      return;
    }
    this.selectedWarrantyItem = value;

    const isPrimary = value.type === 'primary';
    if (isPrimary) {

      this.optionMaintenanceYearsDisabled = !value.cost2;
      const period = <string>value.data.Standard_Warranty_Period;
      const {
        Option_: option,
        Standard_option: standard_option,
      } = value.data;


      this.mustMaintenanceYears = period.indexOf('+') > 0 ? parseInt(period.split('+')[1]) : 0;
      this.maintenanceList = [
        {
          ...value,
          name: `主机(${option}:${standard_option})`,
        },
        ...this.maintenanceList.filter(item => {
          return item.type !== 'primary';
        }),
      ];
      console.log('selectMaintenanceCost', this.maintenanceList);
    } else {
      this.maintenanceList = [
        ...this.maintenanceList,
        {
          ...value,
          name: value.name,
        }];
      console.log('selectMaintenanceCost', this.maintenanceList);
    }
    this.maintenanceCostRecalculate();
    this.updateQuotationParams();
    setTimeout(() => {
      this.selectedWarrantyItem = null;
    }, 200);
  }

  maintenanceCostgroupByFunction = (item) => {
    return item.type === 'primary' ? '主机' : '探头';
  };

  removeMaintenanceData = ({uuid}) => {
    this.maintenanceList = this.maintenanceList.filter(item => {
      return item.uuid != uuid;
    });
    if('2' === this.maintenanceVer) {
      this.updateMaintenanceSum();
    }
    this.updateQuotationParams();
  };


  selectShippingCost(value) {
    if (!!value) {
      const {Delivery_Fee, USD, RMB} = value;
      const data = [{
        name: Delivery_Fee,
        cost: this.currencyType === 'usd' ? USD : RMB
      }];
      this.shippingCostList = [...data];
      this.updateQuotationParams();
      return;
    }
    this.shippingCostList = [];
    this.updateQuotationParams();
  }

  serverSideSearchShippingCost() {
    this.serverSideFilterShippingCost = undefined;
    this.http.post('/act/masterdata/queryJsonByCondition/shippingcost', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        console.log('shippingcost', res.data);
        this.serverSideFilterShippingCost = this.filterShippingcost(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });

    // this.shippingCostTypeahead.pipe(
    //   distinctUntilChanged(),
    //   debounceTime(500),
    //   switchMap(term => !!term && term.length > 2 ? this.http.post('/act/masterdata/queryByWhere/shippingcost', {condition: `delivery_fee like '%${term}%' and status='1'`}) : new Observable)
    // ).subscribe(res => {
    //   this.cd.markForCheck();
    //   this.serverSideFilterShippingCost = res.data;
    // }, (err) => {
    //   console.log(err);
    //   this.serverSideFilterShippingCost = [];
    // });
  }

  filterShippingcost(data) {// if raw data's item has not check column value, dont put it in the selectable list
    let result = [];
    const raw = JSON.parse(data);
    const check = this.currencyType == 'usd' ? 'USD' : 'RMB';
    if (raw) {
      for (const shippingcost of raw) {
        if (shippingcost[check] && '' != shippingcost[check]) {
          result.push(shippingcost);
        }
      }
    }
    return result;
  }

  addQlab() {
    if (this.isObjEmpty(this.qlabSample) || '' == this.qlabSample['col1']) {
      this.toastrService.warning('请选择QLAB后进行添加！');
      return;
    }
    this.qlabList.push({
      id: this.qlabSample['col5'],
      counts: 1,
      article_number: this.qlabSample['col5'],
      usd_list_price: this.qlabSample['col4'],
      rmb_list_price: this.qlabSample['col3'],
      qlab_10_option_chinese: this.qlabSample['col2'],
      qlab_10_option: this.qlabSample['col1']
    });
    this.qlabList = [...this.qlabList];
    this.qlabSample = {};
    this.updateQuotationParams();
  }

  async checkTrainingcostSample() {


    let hospitalParam = (this.hospitalType == '1' ? '公立' : (this.hospitalType == '0' ? '民营' : '其他'));
    let subTypeParam = this.subTypeId;
    let clinicalsegmentationParam = this.clinical;
    let res = await this.http.post('/act/masterdata/queryJsonByCondition/trainingcost', {
      'status': '1',
      'hospital': hospitalParam,
      'subtype_id': subTypeParam,
      'clinicalsegmentation': clinicalsegmentationParam
    }).toPromise();

    let newTrainingCost = {};
    if ('0000' == res['code']) {
      this.trainingcostSelects = JSON.parse(res['data']);
      for (let i = 0; i < this.trainingcostSelects.length; i++) {
        const element = this.trainingcostSelects[i];
        // if (this.philipType.indexOf('HTA') > -1) {// change logic from philipType to philipAuthList
        if (this.philipAuthList.indexOf('HTAUS') > -1) {
          if (element['hospitalproperties'] == 'HTA') {
            newTrainingCost = element;
            break;
          }
        } else {
          if (!element['hospitalproperties'] || element['hospitalproperties'] != 'HTA') {
            newTrainingCost = element;
            break;
          }
        }
      }

      // below if added recently
      // cr: 针对公立医院，如AuthorityList 中包含 “HTAUS”属性，但未维护 HTA的培训费，按 公立其他培训费执行。
      if (this.hospitalType == '1' && this.isObjEmpty(newTrainingCost) && this.philipAuthList.indexOf('HTAUS') > -1 && this.trainingcostSelects.length > 0 ) {
        console.log("HTAUS but has no HTA trainingcost data, used publlic and other tranining");
        newTrainingCost = this.trainingcostSelects[0];
      }
      // console.log("trainingcost mastardata ->", );

      // let isChanged = false;
      if (this.isObjEmpty(newTrainingCost) && this.isObjEmpty(this.trainingcostSample)) {
        //need nothing
      } else if (this.isObjEmpty(newTrainingCost) && !this.isObjEmpty(this.trainingcostSample)) {
        // isChanged = true;
        this.setTrainingInputs('none');
      } else {
        this.trainingcostSample = newTrainingCost;
        if (this.isZhitou || newTrainingCost['distributortraining'] == '否') {//直投时，必须是飞利浦培训
          if (this.trainingType == 'unable') {
          } else {
            this.setTrainingInputs('unable');
          }
        } else if (newTrainingCost['distributortraining'] == '是') {
          let distributorIdParam = this.vendorId.toUpperCase();
          let res2 = await this.http.post('/act/masterdata/queryJsonByCondition/distributor_eligibility', {
            status: '1',
            'Distributor_ID': distributorIdParam
          }).toPromise();
          if ('0000' === res2['code']) {
            const distributor_eligibility_temp = JSON.parse(res2['data']);
            // console.log('distributor_eligibility', distributor_eligibility_temp);

            let distributor_eligibility = undefined;
            if (distributor_eligibility_temp.length > 0) {
              distributor_eligibility = distributor_eligibility_temp[0];
            }

            if (!distributor_eligibility) {//distributor_eligibility 表中无相关记录, same as无资质
              if (this.trainingType == 'unable') {
              } else {
                this.setTrainingInputs('unable');
              }
              return;
            } else {
              this.vendorId_Level = distributor_eligibility['Level'];
              console.log('this.vendorId_Level =' + this.vendorId_Level);
              let res3 = await this.http.post('/act/masterdata/queryJsonByCondition/distributor_eligibility_level', {
                status: '1',
                level: this.vendorId_Level
              }).toPromise();
              if ('0000' === res3['code']) {

                const distributor_eligibility_level_temp = JSON.parse(res3['data']);
                console.log('distributor_eligibility_level_temp = ' + distributor_eligibility_level_temp);
                let distributor_eligibility_level = undefined;
                if (distributor_eligibility_level_temp.length > 0) {
                  distributor_eligibility_level = distributor_eligibility_level_temp[0];
                }

                if (!distributor_eligibility_level || !distributor_eligibility_level['subtype']) { //distributor_eligibility_level 表中无相关记录, same as无资质
                  if (this.trainingType == 'unable') {
                  } else {
                    this.setTrainingInputs('unable');
                  }
                  return;
                }

                let subTypeArr = distributor_eligibility_level['subtype'].toString().replace(/，/g, ',').replace(/[\r\n]/g, '').split(',');
                if (subTypeArr.indexOf(this.subTypeId) > -1) {
                  if (this.trainingType == 'able') {
                  } else {
                    this.setTrainingInputs('able');
                  }
                  return;
                } else {
                  if (this.trainingType == 'unable') {
                  } else {
                    this.setTrainingInputs('unable');
                  }
                  return;
                }
              } else {
                //this.toastrService.warning(res3['msg']);
                this.setTrainingInputs('unable');
              }
            }

          } else {
            //this.toastrService.warning(res2['msg']);
            this.setTrainingInputs('unable');
          }

        }
      }
    } else {
      //this.toastrService.error(res['msg']);
      this.setTrainingInputs('none');
    }

    return newTrainingCost;
  }


  async addTrainingData(flag?: string) {
    console.log('addTraingData, flag =>', flag);
    if ('skip' !== flag) {
      await this.checkTrainingcostSample();
    }
    // console.log('addTrainingData',this.trainingcostSample);

    this.calcTrainingData();
    this.trainingcostList = [{
      ...this.trainingcostSample
    }];

    this.updateQuotationParams();
  }

  calcTrainingData() {

    // console.log('trainingcostSample', this.trainingcostSample);
    let grouptraining_rmb = this.trainingcostSample['grouptraining_rmb'];
    let grouptraining_usd = this.trainingcostSample['grouptraining_usd'];
    let onsitetraining_rmb = this.trainingcostSample['onsitetraining_rmb'];
    let onsitetraining_usd = this.trainingcostSample['onsitetraining_usd'];


    let gtrmb = 0;
    let gtusd = 0;
    let osrmb = 0;
    let osusd = 0;
    let gtCount = 0;
    let osCount = 0;
    if (grouptraining_rmb && !Number.isNaN(Number(grouptraining_rmb))) {
      gtrmb = Number(grouptraining_rmb);
    }
    if (grouptraining_usd && !Number.isNaN(Number(grouptraining_usd))) {
      gtusd = Number(grouptraining_usd);
    }
    if (onsitetraining_rmb && !Number.isNaN(Number(onsitetraining_rmb))) {
      osrmb = Number(onsitetraining_rmb);
    }
    if (onsitetraining_usd && !Number.isNaN(Number(onsitetraining_usd))) {
      osusd = Number(onsitetraining_usd);
    }

    //计算培训次数
    //产品&应用课程次数相加
    if (this.GroupData && !Number.isNaN(Number(this.GroupData))) {
      gtCount = this.GroupData;
    }
    if (this.mustGroupData && !Number.isNaN(Number(this.mustGroupData)) && -1 != this.mustGroupData) {
      gtCount = gtCount + this.mustGroupData;
    }


    //现场培训次数相加
    if (this.onsiteData && !Number.isNaN(Number(this.onsiteData))) {
      osCount = this.onsiteData;
    }
    if (this.mustOnsiteData && !Number.isNaN(Number(this.mustOnsiteData)) && -1 != this.mustGroupData) {
      osCount = osCount + this.mustOnsiteData;
    }

    let os_usd = osusd * osCount;
    let gt_usd = gtusd * gtCount;
    let os_rmb = osrmb * osCount;
    let gt_rmb = gtrmb * gtCount;

    this.trainingcostSample['os_usd'] = os_usd;
    this.trainingcostSample['gt_usd'] = gt_usd;
    this.trainingcostSample['os_rmb'] = os_rmb;
    this.trainingcostSample['gt_rmb'] = gt_rmb;
  }

  addPercunav() {
    if (this.isObjEmpty(this.percunavSample) || '' == this.percunavSample['col1']) {
      this.toastrService.warning('请选择Percunav后进行添加！');
      return;
    }

    this.percunavList.push({
      id: this.percunavSample['col5'],
      counts: 1,
      article_number: this.percunavSample['col5'],
      usd_list_price: this.percunavSample['col4'],
      rmb_list_price: this.percunavSample['col3'],
      qlab_10_option_chinese: this.percunavSample['col2'],
      qlab_10_option: this.percunavSample['col1']
    });
    this.percunavList = [...this.percunavList];
    this.percunavSample = {};
  }

  updateCounts() {

  }

  selectQlab(event) {
    const selectedQlab = this.qlabSelects.find(item => {
      if (event.target.value == item['article_number']) {
        return item;
      }
    });

    if (selectedQlab) {
      this.qlabSample = {
        col1: selectedQlab.qlab_10_option,
        col2: selectedQlab.qlab_10_option_chinese,
        col3: selectedQlab.rmb_list_price,
        col4: selectedQlab.usd_list_price,
        col5: selectedQlab.article_number
      };
    }
  }

  removeQlab({id}, rowIndex) {
    this.qlabList = this.qlabList.filter(({id: itemId}, index) => {
      return rowIndex !== index;
    });
  }

  removePercunav({id}, rowIndex) {
    this.percunavList = this.percunavList.filter(({id: itemId}, index) => {
      return rowIndex !== index;
    });
  }

  selectPercunav(event) {
    const selectedPercunav = this.percunavSelects.find(item => {
      if (event.target.value == item['article_number']) {
        return item;
      }
    });

    if (selectedPercunav) {
      this.percunavSample = {
        col1: selectedPercunav.percunav_consumables_options,
        col2: selectedPercunav.percunav_consumables_options_chinese,
        col3: selectedPercunav.rmb_dealer_price,
        col4: selectedPercunav.usd_dealer_price,
        col5: selectedPercunav.article_number
      };
    }
  }

  selectDiscount(event) {
    const selectedDiscount = this.discountSelects.find(item => {
      if (event.target.value == item['type']) {
        return item;
      }
    });

    if (selectedDiscount) {
      this.discountSample = {
        col1: selectedDiscount.type,
        col2: selectedDiscount.discount
      };

      if (this.discountList.length > 0) {
        this.discountList[0] = {'type': this.discountSample['col1'], 'discount': this.discountSample['col2']};
        this.discountList = [...this.discountList];
      }
    }
    this.updateQuotationParams();
  }

  selectLadderprice(event) {
    const selectedLadderprice = this.ladderpriceSelects.find(item => {
      if (event.target.value == item['type']) {
        return item;
      }
    });

    if (selectedLadderprice) {
      this.ladderpriceSample = {
        col1: selectedLadderprice.type,
        col2: selectedLadderprice.percent
      };

      this.ladderpriceList = [];
      this.ladderpriceList.push({'type': this.ladderpriceSample['col1'], 'percent': this.ladderpriceSample['col2']});
      console.log(this.ladderpriceList);
      this.ladderpriceList = [...this.ladderpriceList];

      this.updateQuotationParams();
    }
  }

  selectInstallationfee(event) {
    const selectedInstallationfee = this.installationfeeSelects.find(item => {
      if (event.target.value == item['id']) {
        return item;
      }
    });

    if (selectedInstallationfee) {
      this.installationfeeSample = {
        col1: selectedInstallationfee.id,
        col2: selectedInstallationfee.subtype_ID,
        col3: selectedInstallationfee.subtype_name,
        col4: selectedInstallationfee.usd,
        col5: selectedInstallationfee.cny
      };

      this.installationfeeList = [];
      this.installationfeeList.push({
        'name': this.installationfeeSample['col3'],
        'rmb': this.installationfeeSample['col5'],
        'usd': this.installationfeeSample['col4']
      });
      this.installationfeeList = [...this.installationfeeList];
      this.updateQuotationParams();
    } else { //无安装费
      this.installationfeeList = [];
      this.installationfeeList = [...this.installationfeeList];
      this.updateQuotationParams();
    }
  }

  updateQlabCounts(event, rowIndex) {
    this.qlabList[rowIndex]['counts'] = event.target.value;
    this.qlabList = [...this.qlabList];
    this.updateQuotationParams();
  }

  update12NCCounts(event, rowIndex) {
    this.vendorprocuctsList[rowIndex]['counts'] = event.target.value;
    this.vendorprocuctsList = [...this.vendorprocuctsList];
    this.updateQuotationParams();
  }

  updatePercunavCounts(event, rowIndex) {
    this.percunavList[rowIndex]['counts'] = event.target.value;
    this.percunavList = [...this.percunavList];
    this.updateQuotationParams();
  }

  selectPromotion(event) {
    const selectedPromotion = this.promotionSelects.find(item => {
      if (event.target.value == item['id']) {
        return item;
      }
    });

    if (selectedPromotion) {
      this.promotionSample = {
        col1: selectedPromotion.id,
        col2: selectedPromotion.year,
        col3: selectedPromotion.quarter,
        col4: selectedPromotion.Clinical_Segmentation,
        col5: selectedPromotion.Promotion_name,
        col6: selectedPromotion.rmb,
        col7: selectedPromotion.usd,
        col8: selectedPromotion.If_ProductManager
      };
    }
  }

  initVendorprocucts() {
    this.vendorprocuctsSelects = undefined;
    this.http.post('/act/masterdata/queryJsonByCondition/vendorprocucts', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        console.log('vendorprocucts', res.data);
        this.vendorprocuctsSelects = this.filterVendorprocucts(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }


  filterVendorprocucts(data) {// if raw data's item has not check column value, dont put it in the selectable list
    //TODO add other filter :6nc
    let result = [];
    const raw = JSON.parse(data);
    const check = this.currencyType == 'usd' ? 'Re_Selling_Price_USD_MarkupIncluded' : 'Re_Selling_Price_RMB_MarkupIncluded';
    if (raw) {
      for (const vendroproducts of raw) {
        if (vendroproducts[check] && '' != vendroproducts[check]) {
          result.push(vendroproducts);
        }
      }
    }
    return result;
  }

  addVendorprocucts() {
    if (this.isObjEmpty(this.vendorprocuctsSample) || '' == this.vendorprocuctsSample['col1']) {
      this.toastrService.warning('请选择第三方采购产品后进行添加！');
      return;
    }

    this.vendorprocuctsList.push({
      id: this.vendorprocuctsSample['col1'],
      '12NC': this.vendorprocuctsSample['col2'],
      Material_Description_English: this.vendorprocuctsSample['col3'],
      Abbvrevation: this.vendorprocuctsSample['col5'],
      Re_Selling_Price_RMB_MarkupIncluded: this.vendorprocuctsSample['col6'],
      Re_Selling_Price_USD_MarkupIncluded: this.vendorprocuctsSample['col7'],
      counts: 1
    });
    this.vendorprocuctsList = [...this.vendorprocuctsList];
    this.vendorprocuctsSample = {};
    this.updateQuotationParams();
  }

  selectVendorprocucts(event) {
    const selectedVendorprocucts = this.vendorprocuctsSelects.find(item => {
      if (event.target.value == item['id']) {
        return item;
      }
    });
    if (selectedVendorprocucts) {
      this.vendorprocuctsSample = {
        col1: selectedVendorprocucts.id,
        col2: selectedVendorprocucts['12NC'],
        col3: selectedVendorprocucts['Material_Description_English'],
        col4: selectedVendorprocucts['Material_Description_Chinese'],
        col5: selectedVendorprocucts['Abbvrevation'],
        col6: selectedVendorprocucts['Re_Selling_Price_RMB_MarkupIncluded'],
        col7: selectedVendorprocucts['Re_Selling_Price_USD_MarkupIncluded'],
        col8: selectedVendorprocucts['Modality'],
        col9: selectedVendorprocucts['Warranty_Month'],
        col10: selectedVendorprocucts['Leadtime_Days'],
        col11: selectedVendorprocucts['Delivery_Term'],
        col12: selectedVendorprocucts['Origin_Country'],
        col13: selectedVendorprocucts['Installation_Service'],
        col14: selectedVendorprocucts['Payment_Document'],
        col15: selectedVendorprocucts['If_medical_device']
      };
    }
    console.log('vendorprocuctsSample 12NC ====' + this.vendorprocuctsSample['12NC']);
  }

  removeVendorprocucts({id}, rowIndex) {
    this.vendorprocuctsList = this.vendorprocuctsList.filter(({id: itemId}, index) => {
      return index !== rowIndex;
    });
    this.updateQuotationParams();
  }

  initTrainingcost() {
    this.trainingcostSelects = undefined;
    // this.trainingcostSample = undefined;
    this.trainingcostSample = {};
    let hospitalParam = (this.hospitalType == '1' ? '公立' : (this.hospitalType == '0' ? '民营' : '其他'));
    console.log('trainingcost, hospitalParam ->', hospitalParam);
    let subTypeParam = this.subTypeId;
    let clinicalsegmentationParam = this.clinical;
    //comments below before commit
    // subTypeParam = 'CVI5202';

    this.http.post('/act/masterdata/queryJsonByCondition/trainingcost', {
      'status': '1',
      'hospital': hospitalParam,
      'subtype_id': subTypeParam,
      'clinicalsegmentation': clinicalsegmentationParam
    }).subscribe(res => {
      if ('0000' == res.code) {
        console.log('trainingcost', res.data);
        this.trainingcostSelects = JSON.parse(res.data);
        for (let i = 0; i < this.trainingcostSelects.length; i++) {
          const element = this.trainingcostSelects[i];

          // console.log(this.philipType);

          // if (this.philipType.indexOf('HTA') > -1) {// change logic from philipType to philipAuthList
          if (this.philipAuthList.indexOf('HTAUS') > -1) {
            if (element['hospitalproperties'] == 'HTA') {
              this.trainingcostSample = element;
              break;
            }
          } else {
            if (!element['hospitalproperties'] || element['hospitalproperties'] != 'HTA') {
              this.trainingcostSample = element;
              break;
            }
          }
        }

        // below if added recently
        // cr: 针对公立医院，如AuthorityList 中包含 “HTAUS”属性，但未维护 HTA的培训费，按 公立其他培训费执行。
        if (this.hospitalType == '1' && this.isObjEmpty(this.trainingcostSample) && this.philipAuthList.indexOf('HTAUS') > -1 && this.trainingcostSelects.length > 0) {
          console.log("HTAUS but has no HTA trainingcost data, used publlic and other tranining");
          this.trainingcostSample = this.trainingcostSelects[0];
        }


        if (this.isObjEmpty(this.trainingcostSample)) {
          if (!this.disabled) {
            let productInfo = '6NC: ' + subTypeParam + ', 临床: ' + clinicalsegmentationParam + ', 最终用户类型: ' + hospitalParam + ', 最终用户类型: ' + this.philipType + ', 最终用户授权List: ' + this.philipAuthList;
            this.toastrService.warning('培训资质的主数据中未找到对应亚型的数据，（' + productInfo + '），请联系管理员');
            this.setTrainingInputs('none');
          }
          return;
        } else {
          this.trainingflag = true;
        }


        if (this.isZhitou || this.trainingcostSample['distributortraining'] == '否') {//直投时，必须是飞利浦培训
          console.log('培训资质，in 否 or 直投');
          this.setTrainingInputs('unable');
        } else if (this.trainingcostSample['distributortraining'] == '是') {
          console.log('培训资质，in 是');
          let distributorIdParam = this.vendorId.toUpperCase();
          this.http.post('/act/masterdata/queryJsonByCondition/distributor_eligibility', {
            status: '1',
            'Distributor_ID': distributorIdParam
          }).subscribe(res => {
            if ('0000' == res.code) {
              console.log('distributor_eligibility', res.data);
              console.log('distributor_eligibility', this.vendorId);
              const distributor_eligibility_temp = JSON.parse(res.data);
              console.log('distributor_eligibility', distributor_eligibility_temp);

              let distributor_eligibility = undefined;
              if (distributor_eligibility_temp.length > 0) {
                distributor_eligibility = distributor_eligibility_temp[0];
              }

              if (!distributor_eligibility) {//distributor_eligibility 表中无相关记录, same as无资质
                this.setTrainingInputs('unable');
                return;
              } else {
                this.vendorId_Level = distributor_eligibility['Level'];
              }

              console.log('this.vendorId_Level =' + this.vendorId_Level);
              this.http.post('/act/masterdata/queryJsonByCondition/distributor_eligibility_level', {
                status: '1',
                level: this.vendorId_Level
              }).subscribe(res => {
                if ('0000' == res.code) {
                  console.log('distributor_eligibility_level', res.data);
                  const distributor_eligibility_level_temp = JSON.parse(res.data);
                  console.log('distributor_eligibility_level_temp = ' + distributor_eligibility_level_temp);
                  let distributor_eligibility_level = undefined;
                  if (distributor_eligibility_level_temp.length > 0) {
                    distributor_eligibility_level = distributor_eligibility_level_temp[0];
                  }

                  if (!distributor_eligibility_level || !distributor_eligibility_level['subtype']) { //distributor_eligibility_level 表中无相关记录, same as�����资质
                    this.setTrainingInputs('unable');
                    return;
                  }

                  let subTypeArr = distributor_eligibility_level['subtype'].toString().replace(/，/g, ',').replace(/[\r\n]/g, '').split(',');
                  if (subTypeArr.indexOf(this.subTypeId) > -1) {
                    this.setTrainingInputs('able');
                    return;
                  } else {
                    this.setTrainingInputs('unable');
                    return;

                  }
                } else {
                  this.toastrService.error(res.msg);
                }
              });
            } else {
              this.toastrService.error(res.msg);
            }
          });
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  setTrainingInputs(flag) {

    if (flag === 'none') { //trainingcost表中未找到记录
      this.trainingType = 'none';
      this.mustOnsiteData_change = true;
      this.mustOnsiteData = 0;
      this.mustGroupData_change = true;
      this.mustGroupData = 0;
      this.onsiteData_change = true;
      this.onsiteData = 0;
      this.GroupData_change = true;
      this.GroupData = 0;
    } else if (flag === 'unable') { //无资质的情况 aka 飞利浦培训
      this.trainingType = 'unable';
      this.mustOnsiteData_change = true; //永远只读不可编辑
      this.mustOnsiteData = this.getTrainingCountData(this.trainingcostSample['mustonsite']); //0123456;可选时默认为0
      this.mustGroupData_change = true; //永远只读不可编辑
      this.mustGroupData = this.getTrainingCountData(this.trainingcostSample['mustgroup']); //0123456;可选时默认为0
      this.onsiteData_change = this.trainingcostSample['onsite'] == '可选' ? false : true; //如果是数字则不可编辑；'可选'的话可以编辑
      this.onsiteData = this.getTrainingCountData(this.trainingcostSample['onsite']); //0123456;可选时默认为0
      this.GroupData_change = this.trainingcostSample['groups'] == '可选' ? false : true; //如果是012345678,不可编辑;'可选'的话可以编辑
      this.GroupData = this.getTrainingCountData(this.trainingcostSample['groups']); //0123456;可选时默认为0
      this.addTrainingData('skip');
    } else if (flag === 'able') { //有资质
      this.trainingType = 'able';
      this.mustOnsiteData_change = true;
      this.mustOnsiteData = 0;
      this.mustGroupData_change = true;
      this.mustGroupData = this.getTrainingCountData(this.trainingcostSample['mustgroup']); //0123456;可选时默认为0
      this.onsiteData_change = true;
      this.onsiteData = 0;
      this.GroupData_change = this.trainingcostSample['groups'] == '可选' ? false : true; //如果是数字则不可编辑；'可选'的话可以编辑
      this.GroupData = this.getTrainingCountData(this.trainingcostSample['groups']); // 0123456;可选时默认为0
      this.addTrainingData('skip');
    }
    this.initNewTrainingcost();
  }

  getTrainingCountData (element) {
    let count = 0;
    if(element) {
      count = Number(element) || 0;
    }
    return count;
  }

  //其他培训费
  getDefaultOtherTrainingSample() {
    let result = {
      osMust: true,
      osMustQty: '',
      gtMust: true,
      gtMustQty: '',
      osOptional: true,
      osOptionalQty: '',
      gtOptional: true,
      gtOptionalQty: '',
      os_rmb: '',
      os_usd: '',
      gt_rmb: '',
      gt_usd: '',
      os_rmb_total: '',
      os_usd_total: '',
      gt_rmb_total: '',
      gt_usd_total: '',
      id: '',
      rowid: '',
      name: ''
    };
    return result;
  }

  initOtherTrainingSelect() {
    this.otherTrainingSample = this.getDefaultOtherTrainingSample();
    const uri = '/act/masterdata/queryJsonByCondition/othertraining';
    this.http.post(uri, {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        this.otherTrainingSelects = JSON.parse(res.data);
        console.log('initOtherTrainingSelects', this.otherTrainingSelects);
      } else {
        console.log('查询主数据时出错', res.msg);
      }
    });
  }

  selectOtherTraining(event) {
    if (event.target.value && '' != event.target.value) {
      const id = event.target.value;
      this.otherTrainingSample = this.getDefaultOtherTrainingSample();
      for (let i = 0; i < this.otherTrainingSelects.length; i++) {
        if (this.otherTrainingSelects[i]['id'] == id) {
          this.mappingOtherTrainingSample(this.otherTrainingSelects[i]);
          break;
        }
      }
    } else {
      this.otherTrainingSample = this.getDefaultOtherTrainingSample();
    }
  }

  mappingOtherTrainingSample(obj) {
    //TODO
    console.log(obj);
    this.otherTrainingSample['name'] = obj['Training_Name'];
    this.otherTrainingSample['id'] = obj['id'];
    this.otherTrainingSample['os_rmb'] = obj['OnSiteTraining_rmb'] ? obj['OnSiteTraining_rmb'] : '';
    this.otherTrainingSample['os_usd'] = obj['OnSiteTraining_usd'] ? obj['OnSiteTraining_usd'] : '';
    this.otherTrainingSample['gt_rmb'] = obj['GroupTraining_rmb'] ? obj['GroupTraining_rmb'] : '';
    this.otherTrainingSample['gt_usd'] = obj['GroupTraining_usd'] ? obj['GroupTraining_usd'] : '';

    if (!obj['mustGroup'] || '' == obj['mustGroup']) {
      this.otherTrainingSample['gtMust'] = true;
    } else {
      this.otherTrainingSample['gtMust'] = false;
      this.otherTrainingSample['gtMustQty'] = obj['mustGroup'];
    }

    if (!obj['mustOnsite'] || '' == obj['mustOnsite']) {
      this.otherTrainingSample['osMust'] = true;
    } else {
      this.otherTrainingSample['osMust'] = false;
      this.otherTrainingSample['osMustQty'] = obj['mustOnsite'];
    }

    if (!obj['Group_'] || '' == obj['Group_']) {
      this.otherTrainingSample['gtOptional'] = true;
    } else if (obj['Group_'] == '可选') {
      this.otherTrainingSample['gtOptional'] = false;
      this.otherTrainingSample['gtOptionalQty'] = '';
    } else {
      this.otherTrainingSample['gtOptional'] = true;
      this.otherTrainingSample['gtOptionalQty'] = obj['Group_'];
    }

    if (!obj['onsite'] || '' == obj['onsite']) {
      this.otherTrainingSample['osOptional'] = true;
    } else if (obj['onsite'] == '可选') {
      this.otherTrainingSample['osOptional'] = false;
      this.otherTrainingSample['osOptionalQty'] = '';
    } else {
      this.otherTrainingSample['osOptional'] = true;
      this.otherTrainingSample['osOptionalQty'] = obj['onsite'];
    }

    // console.log(this.otherTrainingSample);
  }

  addOtherTrainingData() {
    if ('' == this.otherTrainingSelectedId || '' == this.otherTrainingSample['name']) {
      this.toastrService.warning('请选择其他培训费后进行添加！');
      return;
    }

    let item = this.otherTrainingSample;
    item['rowid'] = this.otherTrainingList.length + 1;
    let os_sum = 0;
    let gt_sum = 0;
    if (item['osMustQty'] && !Number.isNaN(Number(item['osMustQty']))) {
      os_sum = os_sum + Number(item['osMustQty']);
    }
    if (item['osOptionalQty'] && !Number.isNaN(Number(item['osOptionalQty']))) {
      os_sum = os_sum + Number(item['osOptionalQty']);
    }

    if (item['gtMustQty'] && !Number.isNaN(Number(item['gtMustQty']))) {
      gt_sum = gt_sum + Number(item['gtMustQty']);
    }
    if (item['gtOptionalQty'] && !Number.isNaN(Number(item['gtOptionalQty']))) {
      gt_sum = gt_sum + Number(item['gtOptionalQty']);
    }

    let os_rmb_total = 0;
    let os_usd_total = 0;
    let gt_rmb_total = 0;
    let gt_usd_total = 0;

    if (item['os_rmb'] && !Number.isNaN(Number(item['os_rmb']))) {
      os_rmb_total = os_sum * Number(item['os_rmb']);
    }
    this.otherTrainingSample['os_rmb_total'] = os_rmb_total.toString();
    if (item['os_usd'] && !Number.isNaN(Number(item['os_usd']))) {
      os_usd_total = os_sum * Number(item['os_usd']);
    }
    this.otherTrainingSample['os_usd_total'] = os_usd_total.toString();

    if (item['gt_rmb'] && !Number.isNaN(Number(item['gt_rmb']))) {
      gt_rmb_total = gt_sum * Number(item['gt_rmb']);
    }
    this.otherTrainingSample['gt_rmb_total'] = gt_rmb_total.toString();
    if (item['gt_usd'] && !Number.isNaN(Number(item['gt_usd']))) {
      gt_usd_total = gt_sum * Number(item['gt_usd']);
    }
    this.otherTrainingSample['gt_usd_total'] = gt_usd_total.toString();

    this.otherTrainingList.push({...this.otherTrainingSample});
    this.otherTrainingList = [...this.otherTrainingList];

    this.otherTrainingSample = this.getDefaultOtherTrainingSample();
    this.otherTrainingSelectedId = '';
    this.updateQuotationParams();
  }

  removeOtherTrainingData = ({rowid}) => {
    this.otherTrainingList = this.otherTrainingList.filter(item => {
      return item.rowid != rowid;
    });
    this.updateQuotationParams();
  };

  addPromotion() {
    if (this.isObjEmpty(this.promotionSample) || '' == this.promotionSample['col1']) {
      this.toastrService.warning('请选择促销方式后进行添加！');
      return;
    }
    this.promotionList.push({
      id: this.promotionSample['col1'],
      counts: 1,
      year: this.promotionSample['col2'],
      quarter: this.promotionSample['col3'],
      Clinical_Segmentation: this.promotionSample['col4'],
      Promotion_name: this.promotionSample['col5'],
      rmb: this.promotionSample['col6'],
      usd: this.promotionSample['col7'],
      If_ProductManager: this.promotionSample['col8']
    });
    this.promotionList = [...this.promotionList];
    this.promotionSample = {};
    this.updateQuotationParams();
  }

  removePromotion({id}, rowIndex) {
    this.promotionList = this.promotionList.filter(({id: itemId}, index) => {
      return rowIndex !== index;
    });
    this.updateQuotationParams();
  }

  removeOtherfee({id}, rowIndex) {
    this.otherfeeList = this.otherfeeList.filter(({id: itemId}, index) => {
      return rowIndex !== index;
    });
    this.updateQuotationParams();
  }

  updateSpecial(event, prop, rowIndex) {
    this.specialList[rowIndex][prop] = event.target.value;
    this.specialList = [...this.specialList];
    this.updateQuotationParams();
  }

  updateOtherfee(event, prop, rowIndex) {
    this.otherfeeList[rowIndex][prop] = event.target.value;
    this.otherfeeList = [...this.otherfeeList];
    this.updateQuotationParams();
  }

  addOtherfee() {
    if (!this.otherfeeSample || '' == this.otherfeeSample.toString().trim()) {
      this.toastrService.warning('请选择或输入其他费用名称！');
      return;
    } else if ('其他' === this.otherfeeSample && '' == this.otherfeeOther.toString().trim()) {
      this.toastrService.warning('请输入其他费用名称！');
      return;
    }

    let nameStr = this.otherfeeSample == '其他' ? this.otherfeeOther.toString().trim() : this.otherfeeSample;
    let ifCustom = this.otherfeeSample == '其他' ? '1' : '0';
    if('1' == ifCustom) {
      for(const item of this.otherfeeSelects) {
        if(item['name'] === nameStr && nameStr !== '其他') {
          ifCustom = '0';
          break;
        }
      }
    }

    this.otherfeeList.push({
      id: this.otherfeeList.length + 1,
      name: nameStr,
      rmb: '',
      usd: '',
      ifCustom: ifCustom
    });
    this.otherfeeList = [...this.otherfeeList];

    // const quotationInputValue = JSON.stringify(this.quotationForm);

    // this.formControl.setValue(quotationInputValue);
    this.otherfeeSample = '';
    this.otherfeeOther = '';
    this.updateQuotationParams();
  }


  updateTotal(flag?) {
    //TODO

    let currentIgm = this.getCurrentIgm();
    console.log('currentIgm', currentIgm);
    console.log('igmEdited', this.igmEdited);

    // console.log('updateTotal', this.rows);
    let calcParams = {
      'currency': '',//币种
      'quotations': [],//
      'qlabs': [],//
      'percunavs': [],//
      'discount': '0',//折扣率
      'distributorprice': '1',//经销商阶梯
      'promotions': [],//优惠活动
      'specialamount': '0',//特价金额
      'trainingfee': '0',//培训费
      'guaranteefee': '0',//保修费
      'expressfee': '0',//运费
      'installfee': '0',//安装费
      'otherfees': []//其他费用
    };

    const totalNameMap = {
      'T1': 'Total PMG Price',
      'T2': '标准折扣后价格',
      'T3': '经销商阶梯价',
      'T4': '促销后价格',
      'T5': '特价后价格',
      'T6': '无折扣价格',
      'T7': '设备总价',
      'T8': '合同总价',
      'T9': '原始价格',
      'T10': '特价申请',
      'T11': {
        'rmb': '特价申请（net）RMB',
        'usd': '特价申请（net）USD'
      },
      'T12': '折扣率',
      'T13': '合同净价',
      'T14': 'IGM'
    };

    calcParams['currency'] = this.currencyType == 'usd' ? 'usd' : 'rmb';
    calcParams['quotations'] = this.formatQuotations();
    calcParams['qlabs'] = this.formatQlabs();
    calcParams['percunavs'] = this.formatPercunavs();
    calcParams['discount'] = this.formatDiscount();
    calcParams['distributorprice'] = this.formatDistributorprice();
    calcParams['promotions'] = this.formatPromotions();
    calcParams['specialamount'] = this.formatSpecialamount(calcParams['currency']);
    calcParams['trainingfee'] = this.formatTrainingfee(calcParams['currency']);
    calcParams['guaranteefee'] = this.formatGuaranteefee();
    calcParams['expressfee'] = this.formatExpressfee();
    calcParams['installfee'] = this.formatInstallfee(calcParams['currency']);
    calcParams['otherfees'] = this.formatOtherfee(calcParams['currency']);
    console.log('updateTotal----->', calcParams);

    this.http.post('/act/calculate/amountSum', calcParams).subscribe(res => {
      console.log('res---->', res);
      if ('0000' == res.code && !this.isObjEmpty(res.data)) {

        const data = res.data == null ? [] : res.data;
        const currency = data['currency'];
        const prefix = currency == 'usd' ? '$ ' : '￥ ';
        let list = [];
        for (let i = 1; i <= 14; i++) {
          let tKey = 'T' + i;
          if (i < 11) {
            list.push({
              'total_code': tKey,
              'total': totalNameMap[tKey],
              'money': prefix + data[tKey]
            });
          } else if (i == 11) {
            list.push({
              'total_code': tKey,
              'total': totalNameMap[tKey][currency],
              'money': prefix + data[tKey]
            });
          } else if (i == 12) { //折扣率
            list.push({
              'total_code': tKey,
              'total': totalNameMap[tKey],
              'money': data[tKey]
            });
          } else if (i > 12 && i < 14) {
            list.push({
              'total_code': tKey,
              'total': totalNameMap[tKey],
              'money': prefix + data[tKey]
            });
          } else if (i == 14) {
            list.push({
              'total_code': tKey,
              'total': totalNameMap[tKey],
              'money': this.igmEdited ? currentIgm : data[tKey]
            });
          }
        }
        /* manullyChangeSumPrice related */
        /* manullyChangeSumPrice related */
        this.totalList = [...list];
        this.updateQuotationParams();
        //如果是commercial进单
        if (this.orderType) {
          this.getTotalListCommercial();
        } else { //如果是特价申请，则保留特价申请 net、折扣率、原始价格三个项目，其余展现形式与标准订单一致
          this.getTotalListCommercial();
          this.getTotalListSpecial()
        }
        if (flag && 'callback' == flag) {
          console.log(flag);
          this.closeModal.emit('close');
        }
      } else {
        this.toastrService.error('更新总价失败，请检查！');
      }
    });
  }

  // 前台数据处理
  // quotation数据
  formatQuotations() {
    let result = [];

    for (let i = 0; i < this.rows.length; i++) {
      let item = this.rows[i];
      let newItem = {};
      let qty = item['_qty'] == null ? '' : item['_qty'];
      let pn = item['PN'] == null ? '' : item['PN'];
      let cny = item['CNY'] == null ? '' : item['CNY'];
      let usd = item['USD'] == null ? '' : item['USD'];
      newItem['pn'] = pn;
      newItem['cny'] = cny;
      newItem['usd'] = usd;
      newItem['qty'] = qty;
      result.push(newItem);
    }

    console.log('formatQuotations', result);
    return result;
  }

  // qlabs参数处理
  formatQlabs() {
    let result = [];
    for (let i = 0; i < this.qlabList.length; i++) {
      let item = this.qlabList[i];
      item['qty'] = item['counts'];
    }
    result = this.qlabList;
    return result;
  }

  // percunavs参数处理
  formatPercunavs() {
    let result = [];
    for (let i = 0; i < this.percunavList.length; i++) {
      let item = this.percunavList[i];
      item['qty'] = item['counts'];
      item['usd_dealer_price'] = item['usd_list_price'];
      item['rmb_dealer_price'] = item['rmb_list_price'];
    }
    result = this.percunavList;
    return result;
  }

  // discount参数处理
  formatDiscount() {
    let result = '0';
    if (this.discountList.length > 0) {
      result = this.discountList[0]['discount'];
    }
    return result == null ? '0' : result;
  }

  // distributorprice参数处理
  formatDistributorprice() {
    let result = '1';
    if (this.ladderpriceList.length > 0) {
      result = this.ladderpriceList[0]['percent'];
    }
    return result == null ? '1' : result;
  }

  // promotions参数处理
  formatPromotions() {
    let result = [];
    for (let i = 0; i < this.promotionList.length; i++) {
      let item = this.promotionList[i];
      item['qty'] = item['counts'];
    }
    result = this.promotionList;
    return result;
  }

  // specialamount参数处理
  formatSpecialamount(currencyType) {
    let result = '0';
    let sKey = currencyType == 'usd' ? 'usd' : 'rmb';
    if (this.specialList.length > 0) {
      result = this.specialList[0][sKey];
    }
    return result == null ? '0' : result == '' ? '0' : result;
  }

  // trainingfee参数处理
  //TODO new-trainingcost
  formatTrainingfee(currencyType) {
    let result = 0;
    //开始计算一般培训费
    let sKey = currencyType == 'usd' ? 'usd' : 'rmb';
    if(!this.trainingcostVer || '' === this.trainingcostVer) { //老版培训费
      if (this.trainingcostList && this.trainingcostList.length > 0) {
        const sample = this.trainingcostList[0];
        let gruopfee = sample['gt_' + sKey];
        let onsitefee = sample['os_' + sKey];

        if (gruopfee && !Number.isNaN(Number(gruopfee))) {
          result = result + Number(gruopfee);
        }
        if (onsitefee && !Number.isNaN(Number(onsitefee))) {
          result = result + Number(onsitefee);
        }
      }

      //开始计算其他培训费
      for (let i = 0; i < this.otherTrainingList.length; i++) {
        const sample = this.otherTrainingList[i];
        let othergroupfee = Number(sample['gt_' + sKey + '_total']);
        let otheronsitefee = Number(sample['os_' + sKey + '_total']);

        if (othergroupfee && !Number.isNaN(Number(othergroupfee))) {
          result = result + Number(othergroupfee);
        }
        if (otheronsitefee && !Number.isNaN(Number(otheronsitefee))) {
          result = result + Number(otheronsitefee);
        }
      }
    } else if ('2' === this.trainingcostVer) { //新版培训费
        result += this.newTrainingcostOnsite['total'] ? (Number(this.newTrainingcostOnsite['total']) || 0) : 0; //现场培训总金额
        result += this.newTrainingcostGroup['total'] ? (Number(this.newTrainingcostGroup['total']) || 0) : 0; //课程培训总金额
        result += this.newTrainingcostOtherSum['total'] ? (Number(this.newTrainingcostOtherSum['total']) || 0) : 0; //其他培训总金额
    }

    return result.toString();
  }

  //guaranteefee参数处理
  formatGuaranteefee() {
    let result = 0;
    if (!this.maintenanceVer || '' === this.maintenanceVer) { //老版保修费
      for (let i = 0; i < this.maintenanceList.length; i++) {
        let item = this.maintenanceList[i];
        if (item['total'] && !Number.isNaN(Number(item['total']))) {
          result = result + Number(item['total']);
        }
      }
    } else if ('2' === this.maintenanceVer) { //新版保修费
      result = this.maintenanceSum.total || 0;
    }
    return result.toString();
  }

  //guaranteefee参数处理
  formatExpressfee() {
    let result = '0';
    if (this.shippingCostList.length > 0) {
      result = this.shippingCostList[0]['cost'];
    }
    return result;
  }

  //installfee参数处理
  formatInstallfee(currencyType) {
    let result = '0';
    let iKey = currencyType == 'usd' ? 'usd' : 'rmb';
    if (this.installationfeeList.length > 0) {
      result = this.installationfeeList[0][iKey];
    }
    return result == null ? '0' : result == '' ? '0' : result;
  }

  // otherFee参数处理
  formatOtherfee(currencyType) {
    let result = [];
    let iKey = currencyType == 'usd' ? 'usd' : 'rmb';

    for(const item of this.otherfeeList) {
      if(item['ifCustom'] && '1' === item['ifCustom']) {
        let amount = Number(item[iKey]) || 0;
        let newItem = {
          name: item['name'] || '',
          amount: amount
        }
        result.push(newItem);
      }
    }

    return result;
  }

  uploadFileAlt(flag) {
    let file: File;
    let elementRef: ElementRef;
    if (flag === 'configFiles') {
      file = this.configFilesInput.nativeElement.files[0];
      elementRef = this.configFilesInput;
    }

    if (file) {
      const owner = localStorage.getItem('ng_philips_code1');
      this.fileService.uploadFile('/act/file/upload', {file, filename: file.name, location: flag, owner},
        res => {
          let newItem = {
            id: res.data,
            name: file.name,
            owner: owner
          };
          this.toastrService.success('上传成功');
          elementRef.nativeElement.value = '';
          if (flag === 'configFiles') {
            this.configfileList = [newItem, ...this.configfileList];
          }
          this.updateQuotationParams();
        }, res => {
          this.toastrService.error(res && res.msg ? res.msg : '上传失败');
          elementRef.nativeElement.value = '';
          ``;
        });
      elementRef.nativeElement.value = '';
    }
  }

  removeFileAlt(row, listName) {
    let id = row['id'];
    let uri = '/act/file/remove/' + id;
    this.http.get(uri).subscribe(res => {
      if ('0000' === res.code || '0028' === res.code) {
        this.toastrService.success('删除成功');
        if (listName) {
          if ('configFiles' == listName) {
            this.configfileList = this.configfileList.filter(({id: itemId}) => {
              return itemId !== id;
            });
          }
        }
        this.updateQuotationParams();
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  downloadFile(row) {
    let id = row['id'];
    let name = row['name'];
    let uri = '/act/file/download/' + id;
    this.http.get(uri).subscribe(res => {
      if (res.code === '0000') {
        let {data} = res.data;
        let arr = this.fileService.base64ToArrayBuffer(data);
        let blob = new Blob([arr]);
        saveAs(blob, name);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  getTotalListSpecial() {
    this.totalListSpecial = [];

    if(this.totalListCommercial.length < 1) {
      return;
    }

    //特价申请 net
    this.totalListSpecial.push({
      name: '特价申请（net）',
      detial: '',
      money: this.getSingleTotalMoney('T11'),
      prefix: this.prefix + ' '
    });

    //折扣率
    this.totalListSpecial.push({
      name: '折扣率',
      detial: '',
      money: this.getSingleTotalMoney('T12'),
      prefix: ''
    });

    //原始价格
    this.totalListSpecial.push({
      name: '原始价格',
      detial: '',
      money: this.getSingleTotalMoney('T9'),
      prefix: this.prefix + ' '
    });

    this.totalListSpecial = [...this.totalListSpecial, ...this.totalListCommercial];
  }

  getTotalListCommercial() {

    this.totalListCommercial = [];
    let preprefix = '';

    // row 1 标准折扣价
    let row1Detail = this.discountList.length > 0 ? (this.discountList[0]['discount'] ? this.discountList[0]['discount'] : '') : '';
    if (row1Detail && '' != row1Detail) {
      let row1Numeral = new NumeralPipe(row1Detail);
      row1Detail = row1Numeral.format('0.00%');
    }

    let row1 = {
      name: '标准折扣价',
      detail: row1Detail,
      money: this.getSingleTotalMoney('T2'),
      prefix: this.prefix + ' '
    };
    this.totalListCommercial.push(row1);

    // row 2 经销商阶梯价
    let row2Detail = this.ladderpriceList.length > 0 ? (this.ladderpriceList[0]['type'] ? this.ladderpriceList[0]['type'] : '') : '';
    if (row2Detail && '' != row2Detail) {
      // let row2Numeral = new NumeralPipe(row2Detail);
      // row2Detail = row2Numeral.format('0.00%');
    } else {
      row2Detail = '无';
    }
    let row2 = {
      name: '经销商阶梯价',
      detail: row2Detail,
      money: this.getSingleTotalMoney('T3'),
      prefix: this.prefix + ' '
    };
    this.totalListCommercial.push(row2);

    //row 3 促销折扣
    let moneyKey = this.currencyType; //rmb or usd
    this.promotionList.forEach((item, index) => {
      let row = {};
      if (index == 0) {
        row = {
          name: '促销折扣',
          detail: item['Promotion_name'] ? item['Promotion_name'] : '',
          money: item[moneyKey],
          prefix: '-' + this.prefix + ' '
        };
      } else {
        row = {
          name: '促销折扣' + (index + 1),
          detail: item['Promotion_name'] ? item['Promotion_name'] : '',
          money: item[moneyKey],
          prefix: '-' + this.prefix + ' '
        };
      }

      this.totalListCommercial.push(row);
    });

    // row 4 特价折扣
    moneyKey = this.currencyType; //rmb or usd
    let row4 = {
      name: '特价折扣',
      detail: '',
      money: this.specialList.length > 0 ? (this.specialList[0][moneyKey] ? this.specialList[0][moneyKey] : '0') : '0',
      prefix: '-' + this.prefix + ' '
    };
    this.totalListCommercial.push(row4);

    // row 5 设备净价  == 特价后价格
    let row5 = {
      name: '设备净价',
      detail: '',
      money: this.getSingleTotalMoney('T5'),
      prefix: this.prefix + ' '
    };
    this.totalListCommercial.push(row5);

    // row 6 无折扣项目 培训费
    let row6 = {
      name: '无折扣项目',
      detail: '培训费',
      money: 0,
      prefix: this.prefix + ' '
    };
    let gtKey = 'gt_' + this.currencyType;
    let osKey = 'os_' + this.currencyType;
    if(!this.trainingcostVer || '' === this.trainingcostVer) { //老版培训费
      if (this.trainingcostList.length > 0) {
        const item = this.trainingcostList[0];
        let osMoney = Number(item[osKey]) || 0;
        let gtMoney = Number(item[gtKey]) || 0;
        let totalTrainingMoney = osMoney + gtMoney;
        if (0 != totalTrainingMoney) {
          row6 = {
            name: '无折扣项目',
            detail: '培训费',
            money: totalTrainingMoney,
            prefix: this.prefix + ' '
          };
        }
      }
    } else if('2' === this.trainingcostVer){// 新版培训费
      let totalTrainingMoney = 0;
      preprefix  = '';
      totalTrainingMoney += this.newTrainingcostOnsite['total'] ? (Number(this.newTrainingcostOnsite['total']) || 0) : 0; //现场培训总金额
      totalTrainingMoney += this.newTrainingcostGroup['total'] ? (Number(this.newTrainingcostGroup['total']) || 0) : 0; //课程培训总金额
      if (totalTrainingMoney < 0) {
        preprefix = '-'
        totalTrainingMoney = Math.abs(totalTrainingMoney);
      }
      if (0 != totalTrainingMoney) {
        row6 = {
          name: '无折扣项目',
          detail: '培训费',
          money: totalTrainingMoney,
          prefix: preprefix + this.prefix + ' '
        };
      }
    }
    this.totalListCommercial.push(row6);

    // row 7 无折扣项目 其他培训费
    let row7 = {
      name: '',
      detail: '其他培训费',
      money: 0,
      prefix: this.prefix + ' '
    };
    gtKey = 'gt_' + this.currencyType + '_total';
    osKey = 'os_' + this.currencyType + '_total';
    let row7Money = 0;
    preprefix = '';
    if (!this.trainingcostVer || '' === this.trainingcostVer) { //老版培训费
      for (let item of this.otherTrainingList) {
        let osMoney = Number(item[osKey]) || 0;
        let gtMoney = Number(item[gtKey]) || 0;
        row7Money = row7Money + osMoney + gtMoney;
      }
    } else if('2' === this.trainingcostVer) { //新版培训费
      row7Money = this.newTrainingcostOtherSum['total'] ? (Number(this.newTrainingcostOtherSum['total']) || 0) : 0; //其他培训总金额
      if (row7Money < 0) {
        preprefix = '-';
        row7Money = Math.abs(row7Money);
      }
    }
    if (0 != row7Money) {
      row7 = {
        name: '',
        detail: '其他培训费',
        money: row7Money,
        prefix: preprefix + this.prefix + ' '
      };
    }
    this.totalListCommercial.push(row7);

    // row 8 无折扣项目 保修费
    let row8 = {
      name: '',
      detail: '保修费',
      money: 0,
      prefix: this.prefix + ' '
    };

    let row8Money = 0;
    preprefix = '';
    if (!this.maintenanceVer || '' === this.maintenanceVer) { //老版保修费
      for (let item of this.maintenanceList) {
        let total = Number(item['total']) || 0;
        row8Money = row8Money + total;
      }
    } else if('2' === this.maintenanceVer) { //新版保修费
      row8Money = this.maintenanceSum['total'] || 0;
      if(row8Money < 0){
        preprefix = '-';
        row8Money = Math.abs(row8Money);
      }
    }
    if (0 != row8Money) {
      row8 = {
        name: '',
        detail: '保修费',
        money: row8Money,
        prefix: preprefix + this.prefix + ' '
      };
    }
    this.totalListCommercial.push(row8);

    // row 9 无折扣项目 运费
    let row9 = {
      name: '',
      detail: '运费',
      money: 0,
      prefix: this.prefix + ' '
    };

    let row9Money = 0;
    preprefix = '';
    for (let item of this.shippingCostList) {
      let cost = Number(item['cost']) || 0;
      row9Money = row9Money + cost;
    }
    if (0 != row9Money) {
      if(row9Money < 0) {
          preprefix = '-';
          row9Money = Math.abs(row9Money);
        }
      row9 = {
        name: '',
        detail: '运费',
        money: row9Money,
        prefix: preprefix + this.prefix + ' '
      };
    }
    this.totalListCommercial.push(row9);

    // row 10 无折扣项目 运费
    moneyKey = this.currencyType; //rmb or usd
    let row10 = {
      name: '',
      detail: '预留安装费',
      money: 0,
      prefix: this.prefix + ' '
    };

    let row10Money = 0;
    preprefix = '';
    for (let item of this.installationfeeList) {
      let money = Number(item[moneyKey]) || 0;
      row10Money = row10Money + money;
    }
    if (0 != row10Money) {
      if (row10Money < 0) {
        preprefix = '-';
        row10Money = Math.abs(row10Money);
      }
      row10 = {
        name: '',
        detail: '预留安装费',
        money: row10Money,
        prefix: preprefix + this.prefix + ' '
      };
    }
    this.totalListCommercial.push(row10);

    //row otherfee 其他费用
    moneyKey = this.currencyType; ///rmb or usd/
    let rowOther = {
      name: "其他费用",
      detail: "无",
      money: "0",
      prefix: this.prefix + ' '
    };

    if(this.otherfeeList.length > 0) {
      this.otherfeeList.forEach((item, idx)=>{
        let detail = item['name'];
        if (item['ifCustom'] && '1' == item['ifCustom']) {
        } else {
          detail += ' （不计入总价）';
        }

        let fixedMoney = Number(item[moneyKey]) || 0;
        preprefix = '';
        if(0 > fixedMoney) {
          preprefix = '-';
          fixedMoney = Math.abs(fixedMoney);
        }

        if(0 == idx) {
          this.totalListCommercial.push({
            name: '其他费用',
            detail: detail,
            money: fixedMoney,
            prefix: preprefix + this.prefix + ' '
          });
        } else {
          this.totalListCommercial.push({
            name: '',
            detail: detail,
            money: fixedMoney,
            prefix: preprefix + this.prefix + ' '
          });
        }
      });
    } else {
      this.totalListCommercial.push(rowOther);
    }

    // row 11 设备总价
    let row11 = {
      name: '设备总价',
      detail: '',
      money: this.getSingleTotalMoney('T7'),
      prefix: this.prefix + ' '
    };
    //if T70 exist
    const t70 = this.getSingleTotalMoney('T70');
    if('' != t70) {
      const t70Str = '(原价格：' +  this.prefix + ' ' + t70 + ')'
      row11['name'] = '设备总价' + t70Str;
    }
    this.totalListCommercial.push(row11);

    //row 12 原igm
    if (this.orderType === '1') {
      let row12 = {
        name: '原IGM',
        detail: '',
        money: this.oldIGM,
        prefix: ''
      };
      this.totalListCommercial.push(row12);
    }

    //row 13 IGM
    let row13 = {
      name: 'IGM',
      detail: '',
      money: this.getSingleTotalMoney('T14'),
      prefix: ''
    };
    this.totalListCommercial.push(row13);

    this.totalListCommercial = [...this.totalListCommercial];
  }

  //获取计算后的几个总价
  // 0: { total_code: "T1", total: "Total PMG Price", money: "" }
  // 1: { total_code: "T2", total: "标准折扣后价格", money: "" }
  // 2: { total_code: "T3", total: "经销商阶梯价", money: "" }
  // 3: { total_code: "T4", total: "促销后价格", money: "" }
  // 4: { total_code: "T5", total: "特价后价格", money: "" }
  // 5: { total_code: "T6", total: "无折扣价格", money: "" }
  // 6: { total_code: "T7", total: "设备总价", money: "" }
  // 7: { total_code: "T8", total: "合同总价", money: "" }
  // 8: { total_code: "T9", total: "原始价格", money: "" }
  // 9: { total_code: "T10", total: "特价申请", money: "" }
  // 10: { total_code: "T11", total: "特价申请（net）RMB", money: "" }
  // 11: { total_code: "T12", total: "折扣率", money:  }
  // 12: { total_code: "T13", total: "合同净价", money: "" }
  // 13: { total_code: "T14", total: "IGM", money:  }
  getSingleTotalMoney(totalCode) {
    let result = '';
    if (this.totalList && this.totalList.length > 0) {
      for (let item of this.totalList) {
        if (item['total_code'] == totalCode) {
          result = item['money'].toString().replace(/[^0-9.-]/g, '');
          break;
        }
      }
    }
    return result;
  }


  //校验N选M规则
  validateQuotationOption() {
    let result =true;
    let notificationStr = '';

    if (!this.specialEdit && this.rowsOptRows && this.rowsOptRows.length >0) {
      for(let optItem of this.rowsOptRows) {
        let flag = optItem['optFlag'];
        let optionCountAll = Number(optItem['raw'].split('-')[0]) || 0;
        let optionCount = Number(optItem['raw'].split('-')[1]) || 0;
        let actualCount = 0;
        if(optionCount != 0) {
          for(let primaryItem of this.rows) {
            if(primaryItem['optFlag'] && flag === primaryItem['optFlag']) {
              actualCount = actualCount + (Number(primaryItem['_qty']) || 0);
            }
          }

          if(optionCount !== actualCount) {
            result = false;
            notificationStr = '请检查数量限制。';
            console.log('数量限制', '请检查数量限制。该订单需要在' + optItem['optNames'].join("、") + "等" + optionCountAll + "个选件中，选择总数量为" + optionCount + "件的选件。");
            break;
          }
        }

      }
    }
    if(!result) {
      this.toastrService.warning(notificationStr);
    }
    return result;
  }

  scrollToTitle() {
    const modalTitle = document.getElementById('simple-modal-title');
    if (modalTitle) {
      modalTitle.scrollIntoView();
    }
  }

  checkOtherfeeInput(event: any) {
    event.target.value = event.target.value == '-' ? '-' : (Number(event.target.value) || '');
  }

  getCurrentIgm() {
    let result;
    if(this.totalList && this.totalList.length > 0) {
      for(const item of this.totalList) {
        if(item['total_code'] == 'T14') {
          result = item['money'];
          break;
        }
      }
    }
    return result;
  }

  initTooltipsKey() {
    if(this.orderType) {// 0 标准进单 1 特价进单
      if('0' === this.orderType) {
        this.otherfeeHeaderTooltip = 'otherfeeHeader0';
      } else if ('1' === this.orderType) {
        this.otherfeeHeaderTooltip = 'otherfeeHeader1';
      }
    } else {// 特价审批
      this.otherfeeHeaderTooltip = 'otherfeeHeaderSpecial';
    }
  }

  //添加其他培训 for ver2
  addNewTrainingcostOther() {
    const modal: NgbModalRef = this.modalService.open(TrainingcostModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    (<TrainingcostModalComponent>modal.componentInstance).pageType = '3';
    (<TrainingcostModalComponent>modal.componentInstance).title = '添加其他培训';
    (<TrainingcostModalComponent>modal.componentInstance).params = {'currencyType': this.currencyType}; // todo

    modal.result.then((result) => {
      if ('simple' == result) {
        console.log('modal simply closed');
      } else {
        console.log('modal closed not simply', result);
        this.newTrainingcostOther.push(result);
        //update total
        this.updateNewTrainingcost('other');
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  addNewTrainingcost(must?:boolean) {
    let groupTrainingList = this.getGruopTrainingList();
    // return;

    let title = '添加课程培训（可选）';
    let pageType = '2';
    let params = {'currencyType': this.currencyType, 'groupTrainingList': groupTrainingList};
    if(must) {
      title= '选择课程培训（必选）';
      pageType = '1';
    }

    const modal: NgbModalRef = this.modalService.open(TrainingcostModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    (<TrainingcostModalComponent>modal.componentInstance).pageType = pageType;
    (<TrainingcostModalComponent>modal.componentInstance).title = title;
    (<TrainingcostModalComponent>modal.componentInstance).params = params;

    modal.result.then((result) => {
      if ('simple' == result) {
        console.log('modal simply closed');
      } else {
        console.log('not simply closed', result);
        if('2' === pageType) { //课程培训可选 添加按钮 callback
          let resultAlt = this.formatTrainingcostResult(result);
          let dupFlag: boolean = false;
          this.newTrainingcostGroupOpt.forEach(item => {
            if(item['name'] === resultAlt['name']) {
              dupFlag = true;
              item['count'] = (Number(item['count']) || 0) + (Number(resultAlt['count']) || 0);
            }
          });
          if (!dupFlag) {
            this.newTrainingcostGroupOpt.push(resultAlt);
          }
          console.log('newtrainingcost', this.newTrainingcostGroupOpt);
          this.updateNewTrainingcost('group');
        } else if('1' === pageType) { //课程培训必选 修改按钮 callback
          let resultAlt = this.formatTrainingcostResult(result);
          // if (this.newTrainingcostGroup['mustName'] !== resultAlt['name']) {
            this.newTrainingcostGroup['mustName'] = resultAlt['name'];
            this.newTrainingcostGroup['mustAmount'] = resultAlt['amount'];
            this.updateNewTrainingcost('group');
          // }
        }
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  formatTrainingcostResult(sample: any) {
    let result;
    if(sample) {
      result = {};
      result['name'] = sample['name'];
      result['rmb'] = sample['rmb'];
      result['usd'] = sample['usd'];
      result['count'] = sample['count'];
      result['amount'] = this.currencyType === 'usd' ? sample['usd'] : sample['rmb'];
    }
    return result;
  }

  showTrainingcostInfo(option: 'onsite' | 'group') {
    let groupTrainingList = this.getGruopTrainingList();
    // return;

    let title = '';
    let pageType = '';
    let params = {'currencyType': this.currencyType};
    if('onsite' === option) {
      title = '现场培训明细';
      pageType = '4';
      params['newTrainingcostOnsite'] = this.newTrainingcostOnsite;
      let trainingcostSampleSaved = this.trainingcostSample;
      if (this.disabled && this.componentParams['qdetail'] && this.componentParams['qdetail']['trainingcostSample']) {
        trainingcostSampleSaved = this.componentParams['qdetail']['trainingcostSample'];
      }
      params['trainingcostSample'] = trainingcostSampleSaved;
      params['vendorId'] = this.vendorId;
      params['trainingType'] = this.trainingType;
    } else if ('group' === option) {
      title = '课程培训明细';
      pageType = '5';
      params['groupTrainingList'] = this.getGruopTrainingList();
      params['newTrainingcostGroup'] = this.newTrainingcostGroup;
      params['newTrainingcostGroupOpt'] = this.newTrainingcostGroupOpt;
      // params['groupTrainingList'] = this.getGruopTrainingList();
    } else return;

    const modal: NgbModalRef = this.modalService.open(TrainingcostModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    (<TrainingcostModalComponent>modal.componentInstance).pageType = pageType;
    (<TrainingcostModalComponent>modal.componentInstance).title = title;
    (<TrainingcostModalComponent>modal.componentInstance).params = params;

    modal.result.then((result) => {
      if ('simple' == result) {
        console.log('modal simply closed');
      } else {
        console.log('not simply closed', result);
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  removeNewTrainingcostGroupOpt(i) {
    this.newTrainingcostGroupOpt = this.newTrainingcostGroupOpt.filter((item, index) => {
      return i !== index;
    });
    this.updateNewTrainingcost('group');
  }

  removeNewTrainingcostOther(i) {
    this.newTrainingcostOther = this.newTrainingcostOther.filter((item, index) => {
      return i !== index;
    });
    this.updateNewTrainingcost('other');
  }

  getGruopTrainingList(): any[] {
    let result: any[] = []
    console.log('trainingSample =>', this.trainingcostSample);
    console.log('othertraining =>', this.otherTrainingSample);
    console.log('old otherTrainingSelects =>', this.otherTrainingSelects);

    if(this.trainingType !== 'none' && !this.isObjEmpty(this.trainingcostSample)) {
      const rmb = Number(this.trainingcostSample['grouptraining_rmb']) || 0;
      const usd = Number(this.trainingcostSample['grouptraining_usd']) || 0;
      result.push({
        'type':'default',
        'name': '产品&应用课程',
        'rmb': rmb,
        'usd': usd
        });
    }

    if(this.otherTrainingSelects && this.otherTrainingSelects.length > 0) {
      this.otherTrainingSelects.forEach(item => {
        const rmb = Number(item['GroupTraining_rmb']) || 0;
        const usd = Number(item['GroupTraining_usd']) || 0;
        item['type'] = 'other';
        item['name'] = item['Training_Name'];
        item['rmb'] = rmb;
        item['usd'] = usd;
        result.push(item);
      });
    }

    return result;
  }

  selectGroupTrainingTest(content, type: string) {
    console.log();
    this.modalService.open(content, { windowClass: 'modal-sm' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  updateNewTrainingcost(flag?: 'group' | 'onsite' | 'other') {

    if (!flag || 'onsite' === flag) {
      this.newTrainingcostOnsite['totalRaw'] = this.newTrainingcostOnsite['mustCount'] * this.newTrainingcostOnsite['amount'] + this.newTrainingcostOnsite['optCount'] * this.newTrainingcostOnsite['amount'];
      this.newTrainingcostOnsite['total'] = this.newTrainingcostOnsite['totalRaw'];
    }

    if(!flag || 'group' === flag) {
      let totalRaw = 0;
      let trainingcostGroupCount = 0;
      this.newTrainingcostGroupOpt.forEach(item => {
        const count = Number(item['count']) || 0;
        const amount = Number(item['amount']) || 0;
        trainingcostGroupCount += count;
        totalRaw += (count * amount);
      });
      totalRaw += this.newTrainingcostGroup['mustCount'] * this.newTrainingcostGroup['mustAmount'];
      this.newTrainingcostGroup['optCount'] =  trainingcostGroupCount;
      this.newTrainingcostGroup['totalRaw'] = totalRaw;
      this.newTrainingcostGroup['total'] = totalRaw;

    }

    if(!flag || 'other' === flag) {
      let total = 0;
      let count = 0;
      this.newTrainingcostOther.forEach(item => {
        if(!item['count'] || 0 >= item['count']) {
          item['count'] = 1;
        }
        count += item['count'];
        total += item['count'] * item['amount'];
      });
      this.newTrainingcostOtherSum['total'] = total;
      this.newTrainingcostOtherSum['count'] = count;
    }
  }

  devTest() {
    console.log('disabled', this.disabled);
    console.log('trainingType', this.trainingType);
    console.log('trainingcostSample', this.trainingcostSample);
    console.log('currencyType', this.currencyType);
    console.log('vendor level', this.vendorId_Level);
    console.log('pageParams', this.pageParams);
    console.log('newTrainingcostInputControl', this.newTrainingcostInputControl);
  }

  initNewTrainingcost() {
    if('2' === this.trainingcostVer) {
      console.log('initNewTrainingcost costTrainingSample => ', this.trainingcostSample);
      console.log('initNewTrainingcost trainingType => ', this.trainingType);
      console.log('initNewTrainingcost all value pageParams => ', this.pageParams);
      this.setNewTrainingcostinputsControl(this.trainingType);
      if (!this.disabled && this.isObjEmpty(this.newTrainingcostOnsite)) { //当初始化时
        this.resetTrainingcostOnsite();
        this.resetTrainingcostGroup();
        this.resetTrainingcostOther();
        if(this.trainingType === 'none') {
          this.toastrService.warning('相关产品未找到培训费主数据，请联系管理员');
        }
      }
    }
  }

  setNewTrainingcostinputsControl(flag?: string) {
    if(!flag || 'none' === flag || this.disabled) {
      Object.keys(this.newTrainingcostInputControl).forEach(item => this.newTrainingcostInputControl[item] = true);
    } else if ('unable' === flag) {
      this.newTrainingcostInputControl = {
        'onsiteTotal': false, //onsite总价可编辑
        'onsiteMust': true, //onsite必选份额不可编辑
        'onsiteOpt': false, //onsite可选份额可编辑
        'groupTotal': false, //group总价可编辑
        'groupMust': true, //group必选份额不可编辑
      };
    } else if ('able' === flag) { //同 unable
      this.newTrainingcostInputControl = {
        'onsiteTotal': false, //onsite总价可编辑
        'onsiteMust': true, //onsite必选份额不可编辑
        'onsiteOpt': false, //onsite可选份额可编辑
        'groupTotal': false, //group总价可编辑
        'groupMust': true, //group必选份额不可编辑
      };
    }
  }

  async resetTrainingcostOnsite(byClick?: boolean) {
    // if (byClick) {
    //   await this.checkTrainingcostSample();
    // }

    if ('none' === this.trainingType) { //trainingcost表中未找到记录
      //控件禁用(全部禁用编辑)
      this.setNewTrainingcostinputsControl('none');
      //相关值的处理
      this.newTrainingcostOnsite['total'] = 0;
      this.newTrainingcostOnsite['totalRaw'] = 0;
      this.newTrainingcostOnsite['mustCount'] = 0;
      this.newTrainingcostOnsite['amount'] = 0;
      this.newTrainingcostOnsite['optCount'] = 0;

    } else if ('unable' === this.trainingType) { //无资质的情况 aka 飞利浦培训
      //控件禁用/非禁用
      this.setNewTrainingcostinputsControl('unable');

      //相关值的处理
      this.newTrainingcostOnsite['mustCount'] = this.getTrainingCountData(this.trainingcostSample['mustonsite']); //0123456;可选时默认为0
      this.newTrainingcostOnsite['amount'] = this.getUnitAmountInTrainingSample('onsite');
      this.newTrainingcostOnsite['optCount'] = this.getTrainingCountData(this.trainingcostSample['onsite']); //0123456;可选时默认为0
      this.newTrainingcostOnsite['totalRaw'] = this.newTrainingcostOnsite['mustCount'] * this.newTrainingcostOnsite['amount'] + this.newTrainingcostOnsite['optCount'] * this.newTrainingcostOnsite['amount'];
      this.newTrainingcostOnsite['total'] = this.newTrainingcostOnsite['totalRaw'];

    } else if ('able' === this.trainingType) { //有资质
      //控件禁用/非禁用 (同unable)
      this.setNewTrainingcostinputsControl('able');

      //相关值的处理
      this.newTrainingcostOnsite['mustCount'] = 0;
      this.newTrainingcostOnsite['amount'] = this.getUnitAmountInTrainingSample('onsite');
      this.newTrainingcostOnsite['optCount'] = 0;
      this.newTrainingcostOnsite['totalRaw'] = this.newTrainingcostOnsite['mustCount'] * this.newTrainingcostOnsite['amount'] + this.newTrainingcostOnsite['optCount'] * this.newTrainingcostOnsite['amount'];
      this.newTrainingcostOnsite['total'] = this.newTrainingcostOnsite['totalRaw'];
    }

    this.updateQuotationParams();
  }

  async resetTrainingcostGroup(byClick?: boolean) {
    // if(byClick) {
    //   await this.checkTrainingcostSample();
    // }

    console.log('trainingcostSample =>', this.trainingcostSample);
    if ('none' === this.trainingType) {
      //控件禁用(全部禁用编辑)
      Object.keys(this.newTrainingcostInputControl).forEach(item => this.newTrainingcostInputControl[item] = true);
      //相关值的处理
      this.newTrainingcostGroup['total'] = 0;
      this.newTrainingcostGroup['totalRaw'] = 0;
      this.newTrainingcostGroup['mustCount'] = 0;
      this.newTrainingcostGroup['mustAmount'] = 0;
      this.newTrainingcostGroup['mustName'] = '';
      this.newTrainingcostGroup['optCount'] = 0;
      this.newTrainingcostGroupOpt = [];

    } else if ('unable' === this.trainingType) {
      //控件禁用/非禁用
      this.newTrainingcostInputControl = {
        'onsiteTotal': false, //onsite总价可编辑
        'onsiteMust': true, //onsite必选份额不可编辑
        'onsiteOpt': false, //onsite可选份额可编辑
        'groupTotal': false, //group总价可编辑
        'groupMust': true, //group必选份额不可编辑
      };

      //相关值的处理
      this.newTrainingcostGroup['mustName'] = '产品&应用课程';
      this.newTrainingcostGroup['mustCount'] = this.getTrainingCountData(this.trainingcostSample['mustgroup']); //0123456;可选时默认为0
      this.newTrainingcostGroup['mustAmount'] = this.getUnitAmountInTrainingSample('group');
      this.newTrainingcostGroup['optCount'] = this.getTrainingCountData(this.trainingcostSample['group']); //0123456;可选时默认为0;
      this.newTrainingcostGroupOpt = [];
      if (this.newTrainingcostGroup['optCount'] > 0) {
        this.newTrainingcostGroupOpt.push({
          'name': this.newTrainingcostGroup['mustName'],
          'count': this.newTrainingcostGroup['optCount'],
          'amount': this.getUnitAmountInTrainingSample('group')
        });
      }

    } else if ('able' === this.trainingType) {
      //控件禁用/非禁用 (同unable)
      this.newTrainingcostInputControl = {
        'onsiteTotal': false, //onsite总价可编辑
        'onsiteMust': true, //onsite必选份额不可编辑
        'onsiteOpt': false, //onsite可选份额可编辑
        'groupTotal': false, //group总价可编辑
        'groupMust': true, //group必选份额不可编辑
      };

      //相关值的处理
      this.newTrainingcostGroup['mustName'] = '产品&应用课程';
      this.newTrainingcostGroup['mustCount'] = this.getTrainingCountData(this.trainingcostSample['mustgroup']); //0123456;可选时默认为0
      this.newTrainingcostGroup['mustAmount'] = this.getUnitAmountInTrainingSample('group');
      this.newTrainingcostGroup['optCount'] = this.getTrainingCountData(this.trainingcostSample['group']); //0123456;可选时默认为0;
      this.newTrainingcostGroupOpt = [];
      if (this.newTrainingcostGroup['optCount'] > 0) {
        this.newTrainingcostGroupOpt.push({
          'name': this.newTrainingcostGroup['mustName'],
          'count': this.newTrainingcostGroup['optCount'],
          'amount': this.getUnitAmountInTrainingSample('group')
        });
      }

    }
    this.updateNewTrainingcost('group');
  }

  resetTrainingcostOther() {
    this.newTrainingcostOther = [];
    // this.newTrainingcostOtherSum = {
    //   count: 0,
    //   total: 0
    // };
    this.updateNewTrainingcost('other');
  }

  getUnitAmountInTrainingSample(type: 'onsite'| 'group') {
    let result = 0;
    if(this.trainingcostSample && this.currencyType && type ) {
      const keyMap = {
        'onsite': 'onsitetraining_',
        'group': 'grouptraining_',
      };
      const keyInTrainingcostSample = keyMap[type] + this.currencyType;

      result = Number(this.trainingcostSample[keyInTrainingcostSample]) || 0;
    }
    return result;
  }

  updateMaintenanceSum() {
    let total = 0;
    let count = 0;
    if(this.maintenanceList && this.maintenanceList.length > 0){
      const tmp = this.maintenanceList[0];
      count = (Number(tmp['requireYear']) || 0) + (Number(tmp['optionYear']) || 0);
      this.maintenanceList.forEach(item => {
        total += (item['total'] || 0);
      });
    }

    this.maintenanceSum = {
      total: total,
      totalRaw: total,
      count: count,
      countRaw: count
    };
  }

  formatQdetailNumber(event, key: string) {
    // let tmp = event.target.value ? event.target.value.toString().replace(/[^-\d*\.?\d+$]/g, '') : 0;
    let tmp = event.target.value ? event.target.value.toString().replace(/[^a-zA-Z0-9*?:^"_ ]+/g, '') : 0;
    console.log('tmp', tmp);
    tmp = Number(tmp) || 0;
    event.target.value = tmp;
    console.log('tmp', tmp);
    console.log('tmp', this[key]);
    this[key] = tmp;
    // this.quotationForm.quotationBaseInfo[key] = tmp;
  }

  isObjEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

}
