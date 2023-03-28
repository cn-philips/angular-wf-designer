import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transferbox-single',
  templateUrl: './transfer-box-single.component.html',
  styleUrls: ['./transfer-box-single.component.scss']
})
export class TransferBoxSingleComponent implements OnInit {

  constructor() { }
  @Input() dataBase: any = {};
  ngOnChanges() {
    this.listOption = this.dataBase;
  }
  ngOnInit() {
    this.listOption = this.dataBase;
  }
  radioValue: any = "1"
  checkOptions: any = "";
  public listOption: any = [];
  checkOptionsOne: any = [];
  tranRight() {
    let arr = this.listOption.filter(x => x.sofonFile === this.radioValue);
    let Difference = [...this.listOption].filter(x => [...arr].every(y => y.sofonFile !== x.sofonFile));
    this.checkOptionsOne = [...arr]
    this.checkOptions = this.checkOptionsOne[0].sofonFile;
  }
  tranleft() {
    this.checkOptionsOne = [];
    this.radioValue = "";
  }
  /**
   * arrays数组，parm以那个值为去重参数
   */
  disreduce(arrays, parm) //除去重复的元素
  {
    var obj = {};
    arrays = arrays.reduce(function (item, next) {
      obj[next[parm]] ? '' : obj[next[parm]] = true && item.push(next);
      return item;
    }, []);
    return arrays
  }

}
