import {NgModule} from '@angular/core';
import {HttpService} from './http.service';
import {NgxDatatableService} from './ngx.datatable.service';
import {DictService} from './dict.service';
import {FileService} from './file.service';
import {CommercialOrderService} from './commercial-order.service';
import {SimpleAuthService} from './simple-auth.service';
import {GlobalService} from './global.service';
import {ReportExportService} from './report-export.service';
import {PdfmakeService} from './pdfmake.service';
import {RegexService} from './regex.service';
import {ApprovalService} from './approval.service';
import {TooltipService} from './tooltip.service';
import {AcceptTermService} from './accept-term.service';
import {UtilityService} from './utility.service';
import { QuotationCalcService} from './quotation-calc.service';
import { DashboardService } from './dashboard.service'

export {
  HttpService,
  NgxDatatableService,
  DictService,
  FileService,
  CommercialOrderService,
  SimpleAuthService,
  GlobalService,
  ReportExportService,
  PdfmakeService,
  RegexService,
  ApprovalService,
  TooltipService,
  AcceptTermService,
  UtilityService,
  QuotationCalcService,
  DashboardService,
}

@NgModule()
export class ServicesModule {
  static forRoot() {
    return {
      ngModule: ServicesModule,
      providers: [
        HttpService,
        NgxDatatableService,
        DictService,
        FileService,
        ReportExportService,
        PdfmakeService,
        CommercialOrderService,
        SimpleAuthService,
        GlobalService,
        RegexService,
        ApprovalService,
        TooltipService,
        AcceptTermService,
        UtilityService,
        QuotationCalcService,
        DashboardService
      ]
    };
  }
}
