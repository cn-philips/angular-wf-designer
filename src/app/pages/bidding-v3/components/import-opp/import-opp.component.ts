import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NzMessageService } from 'ng-zorro-antd'
import { HttpService } from "@core/services";
import { resolve } from "url";

@Component({
  selector: "bidding-v3-import-opp",
  templateUrl: "./import-opp.component.html",
  styleUrls: ["./import-opp.component.scss"],
})
export class ImportOppComponent implements OnInit {
  @Input() dataSource;
  @Output() select = new EventEmitter()

  dialogLoading = false
  searchParams = {
    opportunityId: "",
    opportunityName: "",
    accountName: "",
    dealFormId: "",
    simulationId: "",
  };

  dealFormTable = {
    loading: false,
    total: 0,
    data: [],
    pageNo: 1,
    pageSize: 10,
  };

  simulationTable = {
    loading: false,
    total: 0,
    data: [],
    pageNo: 1,
    pageSize: 10,
  };

  selectedData = null
  selectedSource = null

  opportunityIdSet = new Set()

  dealFormOppSet = new Set()

  businessModel

  dealerName
  
  accountNameDisabled = false

  visible = false;
  constructor(private http: HttpService, private message: NzMessageService) {}

  ngOnInit(): void {}

  setDisabledRows(marketBundles) {
    this.opportunityIdSet = new Set()
    console.log('disabled rows', marketBundles);
    marketBundles.forEach(({ opportunityId, dealFormId }) => {
      this.opportunityIdSet.add(opportunityId)
      this.dealFormOppSet.add(`${dealFormId}-${opportunityId}`)
    })
  }

  show(dataSource, params, marketBundles = [], dealerName, businessModel) {
    this.selectedData = null
    this.dataSource = dataSource
    this.dealerName = dealerName
    this.businessModel = businessModel
    if (params) {
      Object.assign(this.searchParams, params)
      this.accountNameDisabled = params.accountName
    }
    this.setDisabledRows(marketBundles)
    this.visible = true;
    this.getTableData()
  }

  onHide() {
    this.visible = false;
  }

  async onSubmit() {
    if (!this.selectedData) {
      this.message.create('error', `请选择opportunity`)
      return
    }
    this.dialogLoading = true
    const { opportunityId, dealFormId } = this.selectedData
    let data = []
    if (this.selectedSource === 'CP Simulation') {
      // 获取所有的simulation数据
      data = await this.getSimulationData(opportunityId)
    } else { // CP Deal Form
      data = await this.getDealFormData(opportunityId, dealFormId)
    }
    this.dialogLoading = false
    this.visible = false
    this.select.emit({
      dataSource: this.selectedSource,
      data
    })
  }

  onDealFormTableNoChange(pageNo) {
    this.dealFormTable.pageNo = pageNo;
    this.getDealFormTableData();
  }

  onDealFormTableSizeChange(pageSize) {
    this.dealFormTable.pageSize = pageSize;
    this.getDealFormTableData();
  }

  resetSelectStatus() {
    this.dealFormTable.data = this.dealFormTable.data.map(item => ({ ...item, selected: false }))
    this.simulationTable.data = this.simulationTable.data.map(item => ({ ...item, selected: false }))
  }

  onSelectDealForm(data) {
    this.selectedData = data
    this.selectedSource = 'CP Deal Form'
    // this.resetSelectStatus()
    // this.simulationTable.data = this.simulationTable.data.map(item => ({ ...item, selected: false }))
    // this.dealFormTable.data = this.dealFormTable.data.map(item => ({
    //   ...item,
    //   selected: data === item
    // }))
  }

  getTableData() {
    this.dealFormTable.data = []
    this.dealFormTable.total = 0
    this.dealFormTable.pageNo = 1
    this.simulationTable.data = []
    this.simulationTable.total = 0
    this.simulationTable.pageNo = 1
    switch(this.dataSource) {
      case 'CP Deal Form':
        this.getDealFormTableData()
        break
      case 'CP Simulation':
        this.getSimulationTableData()
        break
      default:
        this.getDealFormTableData()
        this.getSimulationTableData()
    }
  }

  // 获取同一Deal Form ID的Deal Form数据
  getDealFormData(opportunityId: string, dealFormId: string): Promise<any[]> {
    return new Promise((resolve) => {
      const url = `/act/ecos/bidding/apply/opportunity/dealForm`;
      const data = {
        ...this.searchParams,
        pageNo: 1,
        pageSize: 999,
        opportunityId,
        dealFormId,
      }
      this.http.post(url, data).subscribe(({ data: { rows } }) => {
        const { accountName, businessModel } = this.selectedData
        const filteredData = rows.filter((item) => item.accountName === accountName && item.businessModel === businessModel)
        resolve(filteredData)
      });
    })
  }

  getDealFormTableData() {
    this.dealFormTable.loading = true;
    const url = `/act/ecos/bidding/apply/opportunity/dealForm`;
    const { pageNo, pageSize } = this.dealFormTable;
    const data = {
      pageNo,
      pageSize,
      ...this.searchParams,
    };
    this.http.post(url, data).subscribe(({ data: { rows, total } }) => {
      this.dealFormTable.loading = false;
      this.dealFormTable.total = total;
      this.dealFormTable.data = rows;
    });
  }

  onSimulationTableNoChange(pageNo) {
    this.simulationTable.pageNo = pageNo;
    this.getSimulationTableData();
  }

  onSimulationTableSizeChange(pageSize) {
    this.simulationTable.pageSize = pageSize;
    this.getSimulationTableData();
  }

  onSelectSimulation(data) {
    this.selectedData = data
    this.selectedSource = 'CP Simulation'
    // this.dealFormTable.data = this.dealFormTable.data.map(item => ({ ...item, selected: false }))
    // this.simulationTable.data = this.simulationTable.data.map(item => ({
    //   ...item,
    //   selected: data === item
    // }))
  }

  // 获取同一Opportunity ID的Simulation数据
  getSimulationData(opportunityId: string): Promise<any[]> {
    return new Promise((resolve) => {
      const url = `/act/ecos/bidding/apply/opportunity/simulation`;
      const data = {
        ...this.searchParams,
        pageNo: 1,
        pageSize: 999,
        opportunityId,
      }
      this.http.post(url, data).subscribe(({ data: { rows } }) => {
        const { accountName, businessModel } = this.selectedData
        const filteredData = rows.filter((item) => item.accountName === accountName && item.businessModel === businessModel)
        resolve(filteredData)
      });
    })
  }

  getSimulationTableData() {
    this.simulationTable.loading = true;
    const url = `/act/ecos/bidding/apply/opportunity/simulation`;
    const { pageNo, pageSize } = this.simulationTable;
    const data = {
      pageNo,
      pageSize,
      ...this.searchParams,
    };
    this.http.post(url, data).subscribe(({ data: { rows, total } }) => {
      this.simulationTable.loading = false;
      this.simulationTable.total = total;
      this.simulationTable.data = rows;
    });
  }
}
