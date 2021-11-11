import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormlyFormOptions, FormlyFieldConfig} from '@ngx-formly/core';
import {QuotationAddComponent} from '../quotation/quotation-add/quotation-add.component';
import {debug} from 'util';
import { ThemeSettingsModule } from '../../vendor/libs/theme-settings/theme-settings.module';

@Component({
  selector: 'approval-main-form',
  templateUrl: './approval-main-form.component.html',
  styleUrls: ['./approval-main-form.component.scss']
})
export class ApprovalMainFormComponent implements OnInit {

  @Input()
  formInitData: Object;

  @Input()
  formFrom: string;

  @Input()
  savedFormModel: string;

  @Input()
  disabled: boolean;

  @Input()
  isCompleted: boolean;

  @Input()
  ownerCode: string;

  acceptTermDisabled: boolean = false;
  acceptTermHidden: boolean = true;

  @ViewChild('row1Body') row1Body?: ElementRef;

  @ViewChild('quotation-add-btn') updateTotalallBtn: ElementRef;

  tblUiList: [];
  formOptions: FormlyFormOptions = {
    formState: {}
  };

  form = new FormGroup({});
  model = {};
  fields: FormlyFieldConfig[] = [];

  constructor() {

  }

  ngOnInit() {
    this.tblUiList = this.formInitData['tblUiList'] ? this.formInitData['tblUiList'] : [];
    this.model = {};
    this.fields = [];
    this.acceptTermDisabled = this.disabled;

    if ('draft' == this.formFrom || 'task' == this.formFrom || 'finishedProcess' == this.formFrom || 'OAWbsProcess' == this.formFrom) {
      this.model = JSON.parse(this.savedFormModel);
    }
    if (this.tblUiList.length > 0) {
      const normalType = 'input,textarea,select,checkbox,radio,datepicker,dmsngselect';
      let ffc = {} as FormlyFieldConfig;
      let rowFlag = 1;
      let fieldGroupArr: FormlyFieldConfig[] = [];
      for (let i = 0; i < this.tblUiList.length; i++) {
        const {display, readonly, name, type, ref, rule} = this.tblUiList[i] as {
          display: string,
          readonly: boolean,
          name: string,
          type: string,
          ref: string,
          rule: string
        };
        let sub = {} as FormlyFieldConfig;
        let options = {
          label: display,
          disabled: readonly || this.disabled,
          required: this.getRuleBoolean(rule, 'required'),
        };
        if(type ==='dmsngselect') {

        }
        if (normalType.indexOf(type) != -1) {
          sub.className = 'col-md-6 col-sm-12';
          sub.type = type;
          sub.key = name;
          switch (type) {
            case 'textarea':
              options['rows'] = 6;
              break;
            case 'select':
              console.log('select', ref);
              // options['options'] = JSON.parse(ref);
              options['options'] = [{text:'--请选择--', value:''}, ...JSON.parse(ref)];
              options['valueProp'] = 'value';
              options['labelProp'] = 'text';
              break;
            default:
          }
          sub.templateOptions = options;
          if (rowFlag % 2 == 1) {
            ffc = {} as FormlyFieldConfig;
            fieldGroupArr = [];
            ffc.fieldGroupClassName = 'row';
            fieldGroupArr.push(sub);
            if (i == this.tblUiList.length - 1 || normalType.indexOf(this.tblUiList[i]['type']) == -1) {
              ffc.fieldGroup = fieldGroupArr;
              this.fields.push(ffc);
            }
          } else {
            fieldGroupArr.push(sub);
            ffc.fieldGroup = fieldGroupArr;
            this.fields.push(ffc);
          }
          rowFlag++;
        } else {
          console.log('elementType', type);
          ffc = {} as FormlyFieldConfig;
          fieldGroupArr = [];
          ffc.fieldGroupClassName = 'row';
          sub.type = type;
          sub.key = name;
          sub.defaultValue = this.getRuleValue(rule, 'default');
          if (type == 'quotationhidden') {

          }
          if(type === 'quotationadd' || type === 'commercialquotationadd') {
            this.acceptTermDisabled = this.disabled ? true : readonly;
          }
          sub.className = 'col-12';
          sub.templateOptions = options;
          fieldGroupArr.push(sub);
          ffc.fieldGroup = fieldGroupArr;
          this.fields.push(ffc);
          rowFlag = 1;

          let formStateItem = {readonly: readonly};
          if (this.isJson(rule)) {
            formStateItem = {...formStateItem, ...JSON.parse(rule)};
          }
          this.formOptions['formState'][name] = formStateItem;
        }
      }
    }

    this.formOptions['isTaskCompleted'] = this.isCompleted ? true : false;
    if(this.isCompleted) {
      this.acceptTermDisabled = true;
    }
    this.formOptions['ownerCode'] = this.ownerCode ? this.ownerCode : '';
  }

  getRuleBoolean(rule, prop) {
    let result = false;
    if (rule && '' != rule) {
      let ruleObj = JSON.parse(rule);
      if (ruleObj[prop] && '1' == ruleObj[prop]) {
        result = true;
      }
    }
    return result;
  }

  getRuleValue(rule, prop) {
    let result;
    if (rule && '' != rule) {
      let ruleObj = JSON.parse(rule);
      if (ruleObj[prop] && '' !== ruleObj[prop]) {
        result = ruleObj[prop];
      }
    }
    return result;
  }

  updateForm() {
    console.log(this.model);
  }

  isJson(item) {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }
    return (typeof item === 'object' && item !== null);
  }

  triggerValidate() {
    console.log(this.form.valid);
    console.log(this.form);
    console.log(this.model);
    return this.form.valid;
  }

  test333() {
    this.form.valueChanges;
    console.log(this.form.valid);
    console.log(this.form);
  }

  submit() {
  }
}
