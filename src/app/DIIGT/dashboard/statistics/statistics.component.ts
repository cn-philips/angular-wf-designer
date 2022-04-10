import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpService } from '../../../services';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { opportunityOptions } from './echatsOption';
import { forkJoin } from 'rxjs';
import { formatDatesNow } from '../../../../assets/js/tools'
@Component({
  selector: 'igt-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsIGTComponent implements OnInit {
  public options: any;
  public load:any=false;
  public params = {
    beginDate: "",
    endDate: "",
    owner: "", //角色
    cycleGrpName: "",
    bigAreaName: "",  //大区， 东，南，西，北
    smallAreaName: "",
    provinceName: "",      //省市区
    modalityCluster: "",
    modalityBmc: "",
    taskStatus: ""
  };
  //可以选择的区域
  checkOptionsOne: any = [
    { label: '全部', value: '', checked: true, data: [] },
    { label: 'east', value: '东区', checked: true, data: [] },
    { label: 'west', value: '西区', checked: true, data: [] },
    { label: 'south', value: '南区', checked: true, data: [] },
    { label: 'north', value: '北区', checked: true, data: [] },
  ]
  //日期控件
  dateRange: any = [];
  public opportunityChart: any;
  public opportunityOptions: any; //配置项
  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {

  }
  //日期选择
  onChangeDate(param) {
    this.params.beginDate = formatDatesNow(param[0]);
    this.params.endDate = formatDatesNow(param[1]);
    this.getTableData();
  }
  public ngOnInit() {
    // 绘制图表 
    let nowMonth = new Date().getMonth();
    let nowYear = new Date().getFullYear();
    let nowDate = `${nowYear}-${nowMonth + 1}-01`
    let nowDates = new Date(nowDate);
    this.dateRange.push(nowDates); //给日期控制开始值
    this.dateRange.push(new Date());//给日期控制结束值
    this.params.beginDate = formatDatesNow(nowDates);
    this.params.endDate = formatDatesNow(new Date())
    this.opportunityOptions = opportunityOptions;
    this.getTableData();
  }
  //勾选框选中事件
  changChbox(param)  
  {
    const legendArr = [];
    param.map(res => {
      res.checked && (legendArr.push(res.label))
    });

    this.opportunityOptions.legend.data = legendArr;
    this.getTableData();
  }
  // 基于准备好的dom，初始化echarts实例   
  public getTableData() {    
    const url = '/act/report/opportunity/count'; //opportunity总量的请求
    const urloit = '/act/report/opportunity/process/count';
    //组装http请求;
    let httpArr = [];
    let httparr = [];
    this.checkOptionsOne.map(res => {
      let paramsArea = JSON.parse(JSON.stringify(this.params));
      for (var i = 1; i < 7; i++) {
        let params = JSON.parse(JSON.stringify(this.params));
        params.taskStatus = i.toString();
        params.bigAreaName = res.value;;
        httpArr.push(this.http.post(urloit, params))
        httparr.push(params)
      }
      httpArr.push(this.http.post(url, paramsArea));
      paramsArea.bigAreaName = res.value;
      httparr.push(paramsArea)
    })
    this.load=true;
    //并行发请求
    forkJoin(
      httpArr
    )
      .subscribe((data) => {
        this.load=false;
        let optionData = []; //获取所有数组
        let i=0;
        let series=[];//报表配置数组
        data.map((res, index) => {
          optionData.push(res.data.totalcount)
        })        
        //把数据7等份分给应的区域
        optionData.map((res, index) => {
          if ((index + 1) % 7 !== 0) {
            this.checkOptionsOne[i].data.push(res)
          }
          else {
            this.checkOptionsOne[i].data.push(res)
            i++
          }
        })  
        this.checkOptionsOne.map(res=>{
            let obj={
                name:'',
                type:'bar',
                stack:'',
                label: {
                    show: true,
                    position: 'right'
                },
                data:[],
                color:'#79BD3D'
            };
            obj.name=res.label;
            obj.stack=res.label;
            obj.data=res.data;
            switch(res.label)
            {
              case '全部':
                 obj.color='#5B9BD5';
                 break;
              case 'north':
                 obj.color='#79BD3D';
                 break;
              case 'south':
                obj.color='#ECBD3D';
                break;
              case 'west':
                obj.color='#ddd';
                break;
              case 'east':
                obj.color='#ED7D31';
                break;
             }
            series.push(obj)
        });        
        this.opportunityOptions.series=series;
        let opportunityChart = echarts.init(document.getElementById('main') as HTMLCanvasElement);
        opportunityChart.setOption(this.opportunityOptions);
        setTimeout(function () {
          window.onresize = function () {
            opportunityChart.resize();
          };
        }, 200);
      }, (error) => {
        this.load=false;
         this.message.create("error",'请求失败!')
      });

  }
}
