import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";

import {
  ApploadingComponent,
  DatePickerComponent,
  PdfPreviewComponent,
  UploadFileComponent,
} from "./components";

import { PricePermissionsPipe } from "../pipes/price-permissions.pipe";

const COMPONENTS = [
  ApploadingComponent,
  UploadFileComponent,
  DatePickerComponent,
  PdfPreviewComponent,
];
const PIPES = [PricePermissionsPipe];
@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [
    NgZorroAntdModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule.forRoot(),
  ],
  exports: [
    ...COMPONENTS,
    ...PIPES,
    NgZorroAntdModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule,
  ],
  providers: [],
})
export class SharedModule {}
