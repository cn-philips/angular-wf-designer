import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgZorroAntdModule } from 'ng-zorro-antd'

import { ApploadingComponent } from '../DIIGT/components/apploading/apploading.component'

@NgModule({
  declarations: [ApploadingComponent],
  imports: [NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule],
  exports: [ApploadingComponent, NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule],
  providers: [],
})
export class SharedModule {}