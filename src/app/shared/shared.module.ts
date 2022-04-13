import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { ApploadingComponent } from '../DIIGT/components/apploading/apploading.component'

@NgModule({
  declarations: [ApploadingComponent],
  imports: [NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule.forRoot()],
  exports: [ApploadingComponent, NgZorroAntdModule, FormsModule, ReactiveFormsModule, CommonModule, NgbModule],
  providers: [],
})
export class SharedModule {}