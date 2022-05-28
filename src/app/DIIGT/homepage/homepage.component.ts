import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { resolve } from 'url';
import { validateStyleParams } from '@angular/animations/browser/src/util';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
@Component({
  selector:'igt-homepage',
  templateUrl:'./homepage.component.html',
  styleUrls:['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  constructor(private http: HttpService, private message: NzMessageService, private el:ElementRef,  private router: Router,) { }
  public showDashboard:Boolean = false
  public isProcessing:Boolean = false
  inTimer:NodeJS.Timer = null
  outTimer:NodeJS.Timer = null
  linkList:Array<any> = []
  // todoList:Array<any> = []
  supportList:Array<any> = []
  manualList:Array<any> = []
  effect = 'scrollx';
  // index:number = 0
  // displayCountPertime:number=4
  // duration:number = 6000
  // isFirstLoop:boolean=true
  public ngOnInit(): void {
    // this.initTodoList().then(()=>{
    //   this._play()
    //   this.play()
    // })
    this.initLinks();
    this.initSupport();


    this.initManuals();
    this.getMessage();
  }
  private async initLinks(){
    this.linkList=[
    ]
    const params = {
      dictGroup: 'LINK_QUICK_LINK',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.linkList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  private async initSupport(){
    const params = {
      dictGroup:'LINK_SUPPORT_CONTENT',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          this.supportList=[...rest.data];
          this.supportList.map(vals=>{
            let arr=vals.tag.split("&&");
            let nowArr=[...arr];
            nowArr.shift();
            vals.name=arr[0];
            let arrs=[];
            nowArr.map(item=>{
              let obj={name:""};
              obj.name=item;
              arrs.push(obj)
            })
            vals.comment=arrs;
            vals.active=false;
          })
        } else {
          this.message.create('error', `${rest.msg}`);
        }
    });
  }
initManuals(){
    this.manualList=[]
    this.getQa();

  }

  public qsType: any = 'cos';
  public manualListSp: any = [];

  //Q&A的链接
  getQa()
  {
    const params = {
      dictGroup: 'LINK_QA_PDF',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          let manualList=[...rest.data];
          manualList.map(val=>{
            val.type='pdf';
          })
            const obj={
              dictGroup:'LINK_QA_LINK'
            }
            this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${obj.dictGroup}`).subscribe(res=> {
                let videoData=[...res.data];
                videoData.map(val=>{
                  val.type='video';
                })
                this.manualList=[...videoData,...manualList];
            })
        }
    });

    // special approval
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_PDF_SP`).subscribe(res => {
      const sp_pdf = [...res.data];
      // const strRegex = /\.(pdf)$/;
      if (sp_pdf) {
        sp_pdf.map(e => {
          e.type = 'pdf';
          // if (e.label && strRegex.test(e.label.toLowerCase())) {
          //   e.type = 'pdf';
          // } else {
          //   e.type = 'video';
          // }
        });
      }
      this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_LINK_SP`).subscribe( rest => {
        const sp_video = [...rest.data];
        if (sp_video) {
          sp_video.map(e => {
            e.type = 'video';
          });
        }
        this.manualListSp = [...sp_pdf, ...sp_video];
      });

    });
  }
  //打开pdf
  openPdf(item)
  {
    var urlPath = window.document.location.href;
    var docPath = window.document.location.pathname;
    var index = urlPath.indexOf('#');
    var serverPath = urlPath.substring(0, index);
    // pdfPreview
    let url;
    url=item.type=='pdf'?`${serverPath}act/system/preview/pdf/dict/${item.value}/${item.tag}`: item.label;
    window.open(url);
  }
  // private play(){
  //   setTimeout(() => {
  //     this._play()
  //     this.play()
  //   }, this.duration);
  // }
  // private _play(){
  //   if(this.isFirstLoop){
  //     this.isFirstLoop= false
  //   }else{
  //     this.index = this.index+this.displayCountPertime>this.todoList.length?0:(this.index+this.displayCountPertime)%this.todoList.length
  //   }
  //   this.todoList.forEach(item=>{
  //     item.isDisplay = false
  //     item.isEntered = false
  //   })
  //   this.todoList.forEach((item,index)=>{
  //     if(index>=this.index&&index<this.index+this.displayCountPertime){
  //       item.isDisplay = true
  //       setTimeout(()=>{
  //         item.isEntered = true
  //       },(index%this.displayCountPertime)*200)
  //     }
  //   })
  // }
  public handleClick(e)
  {
    this.router.navigate([e]);
  }
  public handleHover(): void{
    this.showDashboard = true
    this.isProcessing = true
    if(this.inTimer){
      clearTimeout(this.inTimer)
    }
  }
  public handleLeave():void{
    this.showDashboard = false
    this.isProcessing = true
    if(this.outTimer){
      clearTimeout(this.outTimer)
    }
  }
  public handleMouseWheel():void{
    let manuals = this.el.nativeElement.querySelectorAll('.user-manual-body .user-manual')
    let container = this.el.nativeElement.querySelector('.user-manual-body');
    for(var index = 0 ; index <manuals.length; index++){
      var dom = manuals[index]
      if(this.isElementInViewport(dom,container)){
        console.log(this.manualList[index])
        this.manualList[index].unfold = true
      }
    }
    // manuals.forEach((dom,index)=>{
    //   if(this.isElementInViewport(dom,container)){
    //     console.log(index,dom)
    //     this.manualList[index].unfold = true
    //   }
    // })
  }
  public isElementInViewport (el, container) {
    //获取元素是否在可视区域
    var rect = el.getBoundingClientRect();
    var Container_Y = 0
    // var Container_X = 0
    if (container) {
      Container_Y = container.getBoundingClientRect().top + container.offsetHeight
      // Container_X = container.getBoundingClientRect().x + container.offsetWidth
    } else {
      Container_Y = window.innerHeight || document.documentElement.clientHeight
      // Container_X = window.innerWidth || document.documentElement.clientWidth
    }
    // console.log('container.getBoundingClientRect().y',container.getBoundingClientRect().y)
    // console.log('container.offsetHeight', container.offsetHeight)
    // console.log('rect.top',rect.top)
    // console.log('rect.bottom',rect.bottom)
    return (
      rect.top <= Container_Y &&
      rect.bottom >= 0
      // &&
      // rect.left <= Container_X &&
      // rect.right >= 0
    );
  }

  public message_error: any = [];
  public message_info: any = [];
  public message_warning: any = [];
  public message_length: any = 0;
  public getMessage() {
    this.http.get('/act/ecom/dictData/queryDrop?dictGroup=MESSAGE_ERROR').subscribe(res => {
      this.message_error = [...res.data];
      this.message_length += this.message_error && this.message_error.length > 0 ? this.message_error.length : 0;
    });
    this.http.get('/act/ecom/dictData/queryDrop?dictGroup=MESSAGE_INFO').subscribe(res => {
      this.message_info = [...res.data];
      this.message_length += this.message_info && this.message_info.length > 0 ? this.message_info.length : 0;
    });
    this.http.get('/act/ecom/dictData/queryDrop?dictGroup=MESSAGE_WARNING').subscribe(res => {
      this.message_warning = [...res.data];
      this.message_length += this.message_warning && this.message_warning.length > 0 ? this.message_warning.length : 0;
    });
  }
  public closeMessage(e) {
    e.style.display = 'none';
    this.message_length --;
  }

}
