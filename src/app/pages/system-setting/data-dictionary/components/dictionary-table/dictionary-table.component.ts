import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import * as moment from 'moment';
import { PermissionService } from '@app/modern-themes/services/permission.service';

@Component({
  selector: 'data-dictionary-table',
  templateUrl: './dictionary-table.component.html',
  styleUrls: ['./dictionary-table.component.scss']
})
export class DictionaryTableComponent implements OnInit {
  @Input() listOfMapData: []; // decorate the property with @Input()
  @Input() total: 0;
  @Input() loading: false;
  @Output() passModelSwitch = new EventEmitter<any>();
  @Output() passIsCreate = new EventEmitter<any>();
  @Output() passItem = new EventEmitter<any>();
  @Output() updateTable = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();
  nzLoading = false;
  pagination = {
    pageNo: 1,
    pageSize: 10,
    reload: false,
  };
  public isDeleted = ['否', '是'];
  public status = ['停用', '正常'];
  public dictSort = ['降序', '升序'];
  public isDefault = {
    N: '否',
    Y: '是',
  };


  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private nzMessageService: NzMessageService,
    private permission:PermissionService
  ) {
  }
  cancelSecondBid(): void {
    this.nzMessageService.info('Cancel this operation');
  }

  confirmSecondBid(item, operation) {
  }
  // 修改item
  updateItem(item): void {
    console.log(item);
    this.passModelSwitch.emit(true);
    this.passItem.emit(item);
    this.passIsCreate.emit(false);
  }
  // 二次开标
  cancelDelete(): void {
    this.nzMessageService.info('取消删除操作。');
  }
  // 执行删除操作
  executeDelete(item) {
    // 数据字典删除
    this.http.get(`/act/ecom/dictData/delDictData?dictKey=${item.dictKey}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        // 刷新当前页面
        this.router.navigateByUrl('', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/system-setting/data-dictionary']);
        });
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  changePageIndex(pageNo) {
    // console.log('pageNo', pageNo);
    this.pagination.pageNo = pageNo;
    this.nzLoading = true;
    this.setLoading.emit(this.nzLoading);
    this.updateTable.emit(this.pagination);
  }
  changePageSize(pageSize) {
    console.log('pageSize', pageSize);
    this.pagination.pageSize = pageSize;
    this.nzLoading = true;
    this.setLoading.emit(this.nzLoading);
    this.updateTable.emit(this.pagination);
  }

  ngOnInit(): void {
  }

  UpTime(e, i) {
    const currentZoneTime = new Date(e);
    const currentZoneHours = currentZoneTime.getHours();

    if (i) {
      currentZoneTime.setHours(currentZoneHours - 8);
    }
    if (e == null) {
      return '--';
    }


    return moment(currentZoneTime).format('YYYY-MM-DD HH:mm:ss');
  }

}
