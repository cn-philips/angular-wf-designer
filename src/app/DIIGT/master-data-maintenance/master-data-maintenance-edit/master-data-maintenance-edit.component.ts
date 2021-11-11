import {Component, OnInit} from '@angular/core';
import {KeyValue, Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'master-data-maintenance-edit',
  templateUrl: './master-data-maintenance-edit.component.html',
  styleUrls: ['./master-data-maintenance-edit.component.scss']
})
export class IGTMasterDataMaintenanceEditComponent implements OnInit {

  masterDataLabels = [];
  masterDataRaw = {};
  masterDataFixed = {};
  masterOld = {};
  MasterDataPks = [];
  tablename = '';

  constructor(private activatedRoute: ActivatedRoute,
              private http: HttpService,
              private location: Location,
              private toastrService: ToastrService) {

    activatedRoute.queryParams.subscribe(queryParams => {
      // console.log(queryParams);
      this.MasterDataPks = [];
      this.masterDataLabels = queryParams['labels'] == null ? [] : queryParams['labels'];
      console.log(this.masterDataLabels);
      if (Object.keys(queryParams).length >= 3) {
        const pks = queryParams['pks'];
        const labels = queryParams['labels'];
        const values = queryParams['values'];
        this.tablename = queryParams['tablename'];
        this.MasterDataPks = [];
        if (pks != null) {
          if (Array.isArray(pks)) {
            this.MasterDataPks = pks;
          } else {
            this.MasterDataPks = pks.split(',');
          }
        }
        for (let i = 0; i < labels.length; i++) {
          this.masterDataRaw[labels[i]] = values[i];
          this.masterDataFixed[labels[i]] = values[i];
          this.masterOld[labels[i]] = values[i];
        }
      }
    });
  }

  keyValueOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    const aI = this.masterDataLabels.indexOf(a.key);
    const bI = this.masterDataLabels.indexOf(b.key);
    return bI > aI ? -1 : (aI > bI ? 1 : 0);
  };

  isNotPk(label) {
    // console.log(this.MasterDataPks);
    if (this.MasterDataPks == []) {
      return true;
    } else {
      for (let i = 0; i < this.MasterDataPks.length; i++) {
        if (label == this.MasterDataPks[i]) {
          return false;
        }
      }
      return true;
    }
  };

  updateMasterData() {
    if ('' != this.tablename) {
      // console.log(this.masterDataFixed);
      let data = {};
      data['tableName'] = this.tablename;
      data['id'] = this.masterDataFixed['id'];
      data['data'] = JSON.stringify(this.masterDataFixed, this.replacer);

      let url = '/act/masterdata/updateData?';
      let dataMap = [];
      Object.keys(data).forEach((key) => {
        if (key && data[key]) {
          const encodeKey = encodeURIComponent(key);
          const encodeValue = encodeURIComponent(data[key]);
          dataMap.push(`${encodeKey}=${encodeValue}`);
        }
      });
      url += dataMap.join('&');
      // url += Object.keys(data).map(function (k) {
      //   return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
      // }).join('&');

      // console.log(data);

      this.http.get(url).subscribe(res => {
        if ('0000' == res.code) {
          this.toastrService.success('保存成功');
          this.location.back();
        } else if ('0019' == res.code) {
          this.toastrService.warning(res.msg);
        }
      });

    }
  }

  replacer(key, value) {
    if (key == 'id') {
      return undefined;
    } else {
      return value;
    }
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnInit() {

  }

}
