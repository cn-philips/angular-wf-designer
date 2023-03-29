import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { forkJoin } from 'rxjs'

import { DashboardService } from '@core/services'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-oit-summary',
  templateUrl: './oit-summary.component.html',
  styleUrls: ['./oit-summary.component.scss']
})
export class OitSummaryComponent implements OnInit, AfterViewInit {
  bmcs = []

  chartInstance = null
  chartRenderred = false
  chartType = 'count'
  chartLoading = false
  subscribes: Subscription
  years = []

  months = []

  formValues = this.fb.group({
    modalityList: [[
      { label: 'PD&IGT', value: 'PD&IGT', checked: true },
      { label: 'US', value: 'US', checked: true },
      { label: 'CC', value: 'CC', checked: true },
    ]],
    team: [null],
    year: [null],
    month: [null],
    bmc: [null],
  })

  chartData = {
    xAxisData: [],
    amountData: [],
    countData: [],
    totalAmount: 0,
    totalCount: 0
  }

  get teamList() {
    const modalitySet = new Set()
    this.formValues.getRawValue().modalityList.forEach(({ value, checked }) => {
      if (checked) {
        modalitySet.add(value)
      }
    })
    if (modalitySet.size === 0 || modalitySet.size === 3) {
      return this.dashboardService.teamList
    }
    return this.dashboardService.teamList.filter(({ modality }) => modalitySet.has(modality))
  }

  constructor(private fb: FormBuilder, private dashboardService: DashboardService) { }

  cancelRequest() {
    if (this.chartLoading && this.subscribes) {
      this.subscribes.unsubscribe()
    }
  }

  onModalityChange() {
    this.formValues.patchValue({
      team: null,
    })
  }

  onToggleChartType(type) {
    this.chartType = type
    this.renderChart()
  }

  onYearChange(year) {
    this.months = []
    if (year) {
      this.initMonths()
    }
    this.formValues.patchValue({
      month: null
    })
  }
  onMonthChange() {
    setTimeout(() => {
      this.getChartData()
    }, 0);
  }

  initMonths() {
    for(let i = 1; i <= 12; i++) {
      this.months.push({ label: `${i}月`, value: i })
    }
  }

  // 获取下拉选项的值, team & bmc
  initSelectData() {
    this.dashboardService.getBMCList().subscribe(({ data }) => {
      this.bmcs = data
    })
  }

  ngOnInit() {
    this.initSelectData()
  }

  ngAfterViewInit(): void {
    this.initChart()
  }

  initChart() {
    const chartDom = document.getElementById('yearly-summary-chart');
    this.chartInstance = echarts.init(chartDom);
    this.getChartData()
  }

  clearChart() {
    this.chartData.totalAmount = 0
    this.chartData.totalCount = 0
    this.chartInstance.clear()
  }

  getChartData() {
    this.cancelRequest()
    this.chartLoading = true
    this.chartData.totalAmount = 0
    this.chartData.totalCount = 0
    
    const isMonthView = !!this.formValues.value.month
    const { modalityList } = this.formValues.value
    this.subscribes = this.dashboardService.getOitSummary({
      ...this.formValues.value,
      modalityList: modalityList.filter(({ checked }) => checked).map(({ value }) => value),
      year: this.formValues.value.year ? this.formValues.value.year.getFullYear(): null,
    }).subscribe(({ data }) => {
      const [xAxisData, amountData, countData ] = data.reduce((calc, { month, day, monthAmount, monthCount }) => {
        this.chartData.totalAmount += monthAmount
        this.chartData.totalCount += monthCount
        calc[0].push(`${isMonthView ? day : month + '月'}`)
        calc[1].push(monthAmount)
        calc[2].push(monthCount)
        return calc
      }, [[], [], []])
      this.chartData.xAxisData = xAxisData
      this.chartData.amountData = amountData
      this.chartData.countData = countData
      this.renderChart()
      this.chartLoading = false
    })
  }

  getChartTitle() {
    const isCountChart = this.chartType === 'count'
    const { year, month, team, bmc } = this.formValues.value
    const yAxisName = isCountChart ? '订单数量' : '订单总金额'
    let title = ''
    if (year) {
      const formattedYear = new Date(year).getFullYear()
      title += `${formattedYear}年 `
      if (month) {
        title += `${month}月 `
      }
    }
    if (team) {
      title += `${team} Team `
    }
    if (bmc) {
      title += `${bmc} 产品线 `
    }
    title += `${yAxisName} 统计数据`
    return title
  }

  renderChart() {
    const isCountChart = this.chartType === 'count'
    const yAxisName = isCountChart ? '订单数量' : '订单总金额'
    const { month } = this.formValues.value
    const isMonthView = !!month
    const xAxisName = isMonthView ? '日' : '月份'
    const { xAxisData, countData, amountData } = this.chartData
    const seriesData = isCountChart ? countData : amountData
    
    const option = {
      title: {
        text: this.getChartTitle(),
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {},
      xAxis: {
        name: xAxisName,
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        name: yAxisName,
        type: 'value'
      },
      series: [
        {
          data: seriesData,
          type: 'bar',
          color: ['#337fbf']
        }  
      ]
    };
    this.chartInstance.setOption(option, true)
    if (!this.chartRenderred) {
      setTimeout(() => {
        this.chartInstance.resize()
      }, 200);
    }
    this.chartRenderred = true
  }
}
