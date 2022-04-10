import { AfterViewInit, Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms'
import * as moment from 'moment'

import { DashboardService } from '../../services'

const statusList = [
  { key: 'oitwc', label: 'OIT完成' },
  { key: 'qt', label: '其他' },
  { key: 'jdzbb', label: '进单准备表待OA审核' },
  { key: 'dhtqs', label: '待合同签署' },
]

enum ChartType {
  Count,
  Amount
}

enum Category {
  Team = 'Team',
  BMC = 'BMC'
}

enum Series {
  Status = 'Status',
  BMC = 'BMC'
}

interface ChartDataItem {
  team: string;
  smallArea: string;
  bmc: string;
  companyCount: number;
  contractAmount: number;
  bmcCount: number;
  bmcAmount:number;
  oitwcCount: number;
  oitwcAmount:number;
  dhtqsCount: number;
  dhtqsAmount:number;
  jdzbbCount: number;
  jdzbbAmount:number;
  qtCount: number;
  qtAmount: number;
}

@Component({
  selector: 'app-oit-realtime',
  templateUrl: './oit-realtime.component.html',
  styleUrls: ['./oit-realtime.component.scss']
})
export class OitRealtimeComponent implements OnInit, AfterViewInit {
  tabIndex = 0 // 0: Overview Tab, 1: Summary Tab

  chartType = ChartType.Count
  chartInstance = null
  chartRenderred = false

  chartLoading = false

  summaryChartInstance = null

  teams = []

  formValues = this.fb.group({
    category: [Category.Team],
    submitDate: [[]],
    team: [null],
    series: [Series.Status]
  })

  chartData: ChartDataItem[]

  totalAmount: 0
  totalCount: 0

  constructor(private fb: FormBuilder, private dashboardService: DashboardService) { }

  onTabChange() {
    this.getChartData()
  }

  onSubmitDateChange() {
    this.getChartData()
  }

  onToggleChartType(type) {
    this.chartType = type
    if (this.tabIndex === 0) {
      this.handleOverviewData()
    } else {
      this.handleSummaryData()
    }
  }

  onTeamChange() {
    this.getChartData()
  }

  onSeriesChange() {
    this.getChartData()
  }

  onCategoryChange() {
    this.getChartData()
  }

  ngOnInit() {
    this.dashboardService.getTeamList().subscribe(({ data = [] }) => {
      this.teams = data
      this.formValues.patchValue({
        team: data[0]
      })
    })
  }

  ngAfterViewInit(): void {
    this.initChart()
    this.initSummaryChart()
  }

  initChart() {
    const chartDom = document.getElementById('realtime-chart');
    this.chartInstance = echarts.init(chartDom);
    this.getChartData()
  }

  initSummaryChart() {
    const chartDom = document.getElementById('summary-chart');
    this.summaryChartInstance = echarts.init(chartDom);
  }

  renderSummaryChart(serialData) {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        width: 500,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          show: false
        }
      },
      yAxis: {
        type: 'category',
        data: ['Total'],
        axisTick: {
          show: false,
        },
      },
      series: serialData
    }
    this.summaryChartInstance.setOption(option, true)
  }

  getChartData() {
    this.chartLoading = true
    const { category, series, team, submitDate } = this.formValues.value
    const [ startDate, endDate ] = submitDate
    const  group = this.tabIndex === 0 ? (category === Category.Team ? 'team' : 'bmc') : (series === Series.Status ?  'samllarea_status' : 'samllarea_bmc')
    const params = {
      group,
      submitStartDate: startDate ? moment(startDate): '',
      submitEndDate: endDate ? moment(endDate) : '',
      team: this.tabIndex === 1 ? team : ''
    }
    this.dashboardService.getOitRealTime(params).subscribe(({ data }) => {
      this.chartData = data
      if (this.tabIndex === 0) {
        this.handleOverviewData()
      } else {
        this.handleSummaryData()
      }
      this.chartLoading = false
    })
  }

  handleOverviewData() {
    this.totalAmount = 0
    this.totalCount = 0
    const isCountChart = this.chartType === ChartType.Count
    const { category } = this.formValues.value

    const isTeamCategory = category === Category.Team
    const seriesData = {
      oitwc: [],
      dhtqs: [],
      jdzbb: [],
      qt: []
    }

    const summarySeriesData = {
      oitwc: 0,
      dhtqs: 0,
      jdzbb: 0,
      qt: 0
    }
    const yAxisData = this.chartData.reduce((calc, 
      { 
        team, bmc, oitwcCount, oitwcAmount,
        dhtqsCount, dhtqsAmount, jdzbbCount,
        jdzbbAmount, qtCount, qtAmount
      }
    ) => {
      this.totalAmount += (oitwcAmount + dhtqsAmount + jdzbbAmount + qtAmount)
      this.totalCount += (oitwcCount + dhtqsCount + jdzbbCount + qtCount)
      if (isCountChart) {
        seriesData.oitwc.push(oitwcCount)
        seriesData.dhtqs.push(dhtqsCount)
        seriesData.jdzbb.push(jdzbbCount)
        seriesData.qt.push(qtCount)
        summarySeriesData.oitwc += oitwcCount
        summarySeriesData.dhtqs += dhtqsCount
        summarySeriesData.jdzbb += jdzbbCount
        summarySeriesData.qt += qtCount
      } else {
        seriesData.oitwc.push(oitwcAmount)
        seriesData.dhtqs.push(dhtqsAmount)
        seriesData.jdzbb.push(jdzbbAmount)
        seriesData.qt.push(qtAmount)
        summarySeriesData.oitwc += oitwcAmount
        summarySeriesData.dhtqs += dhtqsAmount
        summarySeriesData.jdzbb += jdzbbAmount
        summarySeriesData.qt += qtAmount
      }
      calc.push(isTeamCategory ? (team || '无') : (bmc || '无'))
      return calc
    }, [])
    const seriesList = statusList.map(({ key, label }) => ({
      name: label, type: 'bar', stack: 'count',
      label: { show: true },
      emphasis: { focus: 'series' },
      data: seriesData[key]
    }))

    const summarySeriesList = statusList.map(({ key, label }) => ({
      name: label, type: 'bar', stack: 'count',
      label: { show: true },
      emphasis: { focus: 'series' },
      data: [summarySeriesData[key]]
    }))

    this.renderChart({ yAxisData, seriesList })

    this.renderSummaryChart(summarySeriesList)
  }

  handleSummaryData() {
    this.totalAmount = 0
    this.totalCount = 0
    const isCountChart = this.chartType === ChartType.Count
    const { series } = this.formValues.value

    const isStatusSeries = series === Series.Status
    if (isStatusSeries) {
      const seriesData = {
        oitwc: [],
        dhtqs: [],
        jdzbb: [],
        qt: []
      }
      const summarySeriesData = {
        oitwc: 0,
        dhtqs: 0,
        jdzbb: 0,
        qt: 0
      }
      const yAxisData = this.chartData.reduce((calc,
        { 
          smallArea, oitwcCount, oitwcAmount,
          dhtqsCount, dhtqsAmount, jdzbbCount,
          jdzbbAmount, qtCount, qtAmount
        }
      ) => {
        this.totalAmount += (oitwcAmount + dhtqsAmount + jdzbbAmount + qtAmount)
        this.totalCount += (oitwcCount + dhtqsCount + jdzbbCount + qtCount)
        if (isCountChart) {
          seriesData.oitwc.push(oitwcCount)
          seriesData.dhtqs.push(dhtqsCount)
          seriesData.jdzbb.push(jdzbbCount)
          seriesData.qt.push(qtCount)
          summarySeriesData.oitwc += oitwcCount
          summarySeriesData.dhtqs += dhtqsCount
          summarySeriesData.jdzbb += jdzbbCount
          summarySeriesData.qt += qtCount
        } else {
          seriesData.oitwc.push(oitwcAmount)
          seriesData.dhtqs.push(dhtqsAmount)
          seriesData.jdzbb.push(jdzbbAmount)
          seriesData.qt.push(qtAmount)
          summarySeriesData.oitwc += oitwcAmount
          summarySeriesData.dhtqs += dhtqsAmount
          summarySeriesData.jdzbb += jdzbbAmount
          summarySeriesData.qt += qtAmount
        }
        calc.push(smallArea || '无')
        return calc
      }, [])

      const seriesList = statusList.map(({ key, label }) => ({
        name: label, type: 'bar', stack: 'count',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: seriesData[key]
      }))
      const summarySeriesList = statusList.map(({ key, label }) => ({
        name: label, type: 'bar', stack: 'count',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: [summarySeriesData[key]]
      }))
      this.renderChart({ yAxisData, seriesList })
      this.renderSummaryChart(summarySeriesList)
    } else {
      let index = 0
      const smallAreaMap = new Map<string, number>()
      const bmcSet = new Set()
      this.chartData.forEach(({ smallArea, bmc }) => {
        if (!smallAreaMap.has(smallArea || '')) {
          smallAreaMap.set(smallArea, index++)
        }
        bmcSet.add(bmc || '')
      })
      const bmcMap = {}
      const bmcSummaryMap = {}
      bmcSet.forEach((bmc: string) => bmcMap[bmc] = new Array(smallAreaMap.size).fill(0))
      this.chartData.forEach(({ smallArea, bmc, bmcCount, bmcAmount }) => {
        this.totalAmount += bmcAmount
        this.totalCount += bmcCount
        let index = smallAreaMap.get(smallArea || '')
        const data = isCountChart ? bmcCount : bmcAmount
        bmcMap[bmc || ''][index] = data
        const key = bmc || '无'
        if (bmcSummaryMap[key] !== undefined) {
          bmcSummaryMap[key] = bmcSummaryMap[key] + data
        } else {
          bmcSummaryMap[key] = data
        }
      })

      const yAxisData = new Array(smallAreaMap.size)
      smallAreaMap.forEach((value, key) => {
        yAxisData[value] = key || '无'
      })

      const seriesList = Object.keys(bmcMap).map((bmc) => ({
        name: bmc || '无', type: 'bar', stack: 'count',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: bmcMap[bmc]
      }))

      const summarySeriesList = Object.keys(bmcSummaryMap).map((bmc) => ({
        name: bmc || '无', type: 'bar', stack: 'count',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: [bmcSummaryMap[bmc]]
      }))

      this.renderChart({ yAxisData, seriesList })
      this.renderSummaryChart(summarySeriesList)
    }
  }

  renderChart({ yAxisData, seriesList }) {
    const { submitDate, team, category, series } = this.formValues.value
    const [ startDate, endDate ] = submitDate
    const isCountChart = this.chartType === ChartType.Count
    const xAxisName = isCountChart ? '订单数量' : '订单总金额'
    
    const isOverview = this.tabIndex === 0
    const isTeamCategory = category === Category.Team
    const yAxisName = isOverview ? isTeamCategory ? '团队' : '产品线' : team
    const isStatusSeries = series === Series.Status
    let title = ''
    if (startDate && endDate) {
      title = `${moment(startDate).format('YYYY年MM月DD日')} ~ ${moment(endDate).format('YYYY年MM月DD日')} `
    }
    if (isOverview) {
      title +=  `${xAxisName}-${yAxisName}汇总数据`
    } else {
      title += `${team} Team-${xAxisName}-${ isStatusSeries ? '状态' : '产品线' } 汇总数据`
    }
    const option = {
      title: { text: title, left: 'center' },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: { right: 200, },
      legend: {
        top: 'center',
        right: 0,
        orient: 'vertical',
      },
      xAxis: {
        type: 'value',
        name: xAxisName,
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        name: yAxisName,
      },
      series: seriesList
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
