export const opportunityOptions = {  //opportunity柱状图配置项
    title: {
        text: 'Opportunity进度追踪(区域)',
        left: 'center',
        top: '0',
        right: 'auto',
        bottom: 'auto'
    },
    dataZoom: [
    {
        type: 'slider',      
        yAxisIndex: [0],
        left:'98%',
        start: 0, //数据窗口范围的起始百分比
        end:100,
        zoomOnMouseWheel:true,
    },
    
  ],
    tooltip: {
        //trigger: 'axis',
      //  formatter: '{b0}: {c0}<br />{b1}: {c1}'
        // axisPointer: {
        //     type: 'shadow'
        // }
        formatter:function(val)
        {    
            return `${val.name}:${val.data}`
        }
    },
    // toolbox: {
    //     feature: {
    //         magicType: {
    //             type: ['stack', 'tiled']
    //         },
    //         dataView: {}
    //     }
    // },
    legend: {
        data: ['全部','north','south','west', 'east'],
        x: '5%',
        y: 'top',        
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '6%',
        containLabel: true
    },

    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        "axisTick": {
            "show": false
        },
        axisLine: {
            show: false, //坐标轴线
            lineStyle: {
                color: "#000",
            },
        },
        "splitLine": {     //网格线
            "show": true
        }
    },
    yAxis: {
        type: 'category',
        data: ['招标授权已经完成', '中标备案已完成','OIT已经完成','合同已经签署', 'Order summary已经提交','进单准备表已经提交','opportunity总量'],
        "splitLine": {     //网格线
            "show": false
        }
    },
    series: [
        {
            name:'north',
            type:'bar',
            stack: 'north',
            label: {
                show: true,
                position: 'right'
            },
            data: [15302,18030, 29034, 104970, 131744, 230230,312312],
            color:'#79BD3D'
        },
        {
            name:'south',
            type:'bar',
            stack: 'south',
            label: {
                show: true,
                position: 'right'
            },
            data: [18203, 23489, 29034, 104970, 131744, 230230,612230],
            color:'#ECBD3D'
        },
        {
            name:'west',
            type:'bar',
            stack: 'west',
            label: {
                show: true,
                position: 'right'
            },
            data: [18203, 23489, 29034, 104970, 131744, 230230,513000],
            color: '#ddd'
        },
        {
            name: 'east',
            type: 'bar',
            stack: 'east',
            label: {
                show: true,
                position: 'right'
            },
            data: [19325, 23438, 31000, 121594, 134141, 281807,518220],
            color: '#ED7D31'
        },
        {
            name: '全部',
            type: 'bar',
            stack: '全部',
            label: {
                show: true,
                position: 'right'
            },
            data: [19325, 23438, 31000, 121594, 145451,381807,691120],
            color: "#5B9BD5"
        },
    ]

}