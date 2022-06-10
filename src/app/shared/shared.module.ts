import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { ApploadingComponent } from '../DIIGT/components/apploading/apploading.component'
import { UploadFileComponent } from './components/upload-file/upload-file.component'
import { DatePickerComponent } from './components/date-picker/date-picker.component'
import { PricePermissionsPipe } from '../pipes/price-permissions.pipe';

const COMPONENTS = [ApploadingComponent, UploadFileComponent, DatePickerComponent]
const PIPES = [PricePermissionsPipe]
@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule.forRoot()],
  exports: [...COMPONENTS, ...PIPES, NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule],
  providers: [],
})
export class SharedModule {}