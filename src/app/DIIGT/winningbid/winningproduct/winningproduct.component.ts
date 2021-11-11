import { Component, OnInit } from '@angular/core';
import { TransferChange } from 'ng-zorro-antd/transfer';
import { NzTreeComponent } from 'ng-zorro-antd/tree';
export interface TreeNodeInterface { //数据类型接口
  key: string;
  productType?: string;
  productTypeChild?: string;
  productName?: string;
  productModel?:string;
  productLine?:string;
  costCenter?:string;
  number?:number; 
  mag?:string;
  level?: number;
  expand?: boolean;
  localName?: string;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
}
@Component({
  selector: 'app-winningproduct',
  templateUrl: './winningproduct.component.html',
  styleUrls: ['./winningproduct.component.scss']
})

export class WinningproductComponent implements OnInit {

  constructor() { }
  shuttleList: any[] = []; //穿梭框的数据
  public tabList: any = [{
    'radio': false,
    'opportunityID': "006d000000BDrIm",
    'DealFormID': "",
    'opportunityName': "1-YZBPDK",
    "accountName": "Infraredx Inc",
    "biddingDate": "",
    "opportinityHierarchyLink": "",
    "source": "",
  }];
  public crmData: any = [{
    'radio': true,
    'opportunityID': "006d000000BDrIm",
    'opportunityName': "1-YZBPDK",
    "accountName": "Infraredx Inc",
    "biddingDate": "",
    "opportinityHierarchyLink": "",
    "source": "",
  }];
  //产品信息
  public productData: any = [{
    name: "#basicTable1",
    id: "basicTable1",
    opportunityID: "1",
    listOfMapData:[],
    list:[
      {
        key: `11`,
        productType:'Market Bundle1',
        productTypeChild:"",
        productName:"Market Bundle1名称",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
        children: [
          {
            key: `11-1`,
            productType: '',
            productTypeChild:"子产品",
        productName:"子产品名称1",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
          },
          {
            key: `11-2`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",       
          },
          {
            key: `11-3`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",             
          }
        ]
      },
      {
        key: `12`,
        productType: 'Market Bundle1名称',
        productTypeChild:"",
        productName:"产品名称2",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",    
      }
    ]
  }, {

    name: "#basicTable2",
    id: "basicTable2",
    opportunityID: "2",
    listOfMapData:[],
    list:[
      {
        key: `2`,
        productType:'Market Bundle1',
        productTypeChild:"",
        productName:"Market Bundle1名称",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
        children: [
          {
            key: `2-1`,
            productType: '',
            productTypeChild:"子产品",
        productName:"子产品名称1",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
          },
          {
            key: `2-2`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",       
          },
          {
            key: `2-3`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",             
          }
        ]
      },
      {
        key: `22`,
        productType: 'Market Bundle1名称',
        productTypeChild:"",
        productName:"产品名称2",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",    
      }

    ]
  }];
  listOfMapData: TreeNodeInterface[] = [
    {
      key: `1`,
      productType:'John Brown sr.',
      productTypeChild:"",
      productName:"Market Bundle1名称",
      productModel:"Market Bundle1型号",
      costCenter:"23",
      localName: '',
      number:10,
      mag:"",
      productLine:"",
      children: [
        {
          key: `1-1`,
          productType: '',
          productTypeChild:"子产品",
      productName:"子产品名称1",
      productModel:"Market Bundle1型号",
      costCenter:"23",
      localName: '',
      number:10,
      mag:"",
      productLine:"",
        },
        {
          key: `1-2`,
          productType: '',
          productTypeChild:"子产品",
          productName:"子产品名称2",
          productModel:"Market Bundle1型号",
          costCenter:"23",
          localName: '',
          number:10,
          mag:"",
          productLine:"",       
        },
        {
          key: `1-3`,
          productType: '',
          productTypeChild:"子产品",
          productName:"子产品名称2",
          productModel:"Market Bundle1型号",
          costCenter:"23",
          localName: '',
          number:10,
          mag:"",
          productLine:"",             
        }
      ]
    },
    {
      key: `2`,
      productType: 'Market Bundle1名称',
      productTypeChild:"",
      productName:"产品名称2",
      productModel:"Market Bundle1型号",
      costCenter:"23",
      localName: '',
      number:10,
      mag:"",
      productLine:"",    
    }
  ];
  ishowBundle:boolean=false; //添加弹出窗口
  showoff:boolean=false; //添加op
  handleCancel()
  {
   this.showoff=false;
  }
  handleOk(){
   this.showoff=false;
   let obj={    
    opportunityID: "3",
    listOfMapData:[],
    list:[
      {
        key: `3`,
        productType:'Market Bundle1',
        productTypeChild:"",
        productName:"Market Bundle1名称",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
        children: [
          {
            key: `3-1`,
            productType: '',
            productTypeChild:"子产品",
        productName:"子产品名称1",
        productModel:"Market Bundle1型号",
        costCenter:"23",
        localName: '',
        number:10,
        mag:"",
        productLine:"",
          },
          {
            key: `3-2`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",       
          },
          {
            key: `3-3`,
            productType: '',
            productTypeChild:"子产品",
            productName:"子产品名称2",
            productModel:"Market Bundle1型号",
            costCenter:"23",
            localName: '',
            number:10,
            mag:"",
            productLine:"",             
          }
        ]
      },
    ]
  }
   this.productData.push(obj);
   this.ngOnInit();
  }
  confirm(index){    
     this.productData.splice(index,1);
  }
  //弹出窗口id
  showDiag() {
    this.showoff = true;
  }
  delProduct(i,m)
  {
    this.productData[i].listOfMapData.splice(m,1);
    this.productData[i].list.splice(m,1);
    console.log(this.productData)
    this.ngOnInit();
  }
  cancel(){

  }
  showBundle(){  // 打开弹出窗口
   this.ishowBundle=true;
  }
  bundleOk(){
    this.ishowBundle=false;
  }
  bundleCancel()
  {
    this.ishowBundle=false;
  }
  ngOnInit() {    
    this.productData.map(res=>{
      this.listOfMapData=JSON.parse(JSON.stringify(res.list));    
      this.listOfMapData.forEach(item => {
        this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
      });
      res.listOfMapData=JSON.parse(JSON.stringify(this.listOfMapData));
    })
    //生成穿梭框的
    for (let i = 0; i < 20; i++) {
      this.shuttleList.push({
        key: i.toString(),
        title: `子产品${i + 1}`,        
      });
    }
    [2, 3].forEach(idx => (this.shuttleList[idx].direction = 'right'));
  }
  //穿梭框选择
  select(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  change(ret: {}): void {
    console.log('nzChange', ret);
  }
  //添加Market Bundle
  addBundle(){
    
  }

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};

  collapse(array: TreeNodeInterface[], data: TreeNodeInterface, $event: boolean): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], level: node.level! + 1, expand: false, parent: node });
        }
      }
    }

    return array;
  }

  visitNode(node: TreeNodeInterface, hashMap: { [key: string]: boolean }, array: TreeNodeInterface[]): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

}
