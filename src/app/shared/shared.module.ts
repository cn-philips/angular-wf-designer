import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { ApploadingComponent } from '../DIIGT/components/apploading/apploading.component'
import { UploadFileComponent } from './components/upload-file/upload-file.component'
import { DatePickerComponent } from './components/date-picker/date-picker.component'

const COMPONENTS = [ApploadingComponent, UploadFileComponent, DatePickerComponent]

@NgModule({
  declarations: [...COMPONENTS],
  imports: [NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule.forRoot()],
  exports: [...COMPONENTS, NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule],
  providers: [],
})
export class SharedModule {}