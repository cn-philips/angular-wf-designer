import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileHistoryComponent } from './mobile-history/mobile-history.component';
import { MobileTaskCommentsComponent } from './mobile-task-comments/mobile-task-comments.component';
import { MobileHeaderNavbarComponent } from './mobile-header-navbar/mobile-header-navbar.component';
import { MobileMainFormViewComponent, MobilePdfViewerModalComponent } from './mobile-main-form-view/mobile-main-form-view.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

const COMPONENTS = [
  MobileHistoryComponent,
  MobileTaskCommentsComponent,
  MobileHeaderNavbarComponent,
  MobileMainFormViewComponent,
  MobilePdfViewerModalComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule,
    MobileSharedModule
  ],
  exports: [
    ...COMPONENTS
  ],
  entryComponents: [
    MobilePdfViewerModalComponent
  ],
})
export class MobileCommonModule { }
