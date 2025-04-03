import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";

// 第三方组件库
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { ClipboardModule } from 'ngx-clipboard'

// 全局组件
import { COMPONENTS } from "./components";

// 全局指令
import { DIRECTIVES } from "./directives";

// 全局管道
import { PIPES } from "./pipes";
import { TranslateModule } from "@ngx-translate/core";
import { InputUserComponent } from './components/input-user/input-user.component';

@NgModule({
  declarations: [...COMPONENTS, ...PIPES, ...DIRECTIVES, InputUserComponent],
  imports: [
    ClipboardModule,
    NgZorroAntdModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule.forRoot(),
    HttpClientModule,
    TranslateModule,
  ],
  exports: [
    ...COMPONENTS,
    ...PIPES,
    ...DIRECTIVES,
    NgZorroAntdModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbModule,
    RouterModule,
    HttpClientModule,
    TranslateModule,
    InputUserComponent,
  ],
  providers: [PIPES],
})
export class SharedModule {}
