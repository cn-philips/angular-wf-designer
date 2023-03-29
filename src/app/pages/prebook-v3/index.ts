export * from './pages'

import { PrebookFormComponent, PrebookDetailComponent } from './pages'
import {
  BasicInfoComponent, SelectDealFormComponent, ProductInfoComponent,
  ZpmApprovalComponent, OaApprovalComponent, OaSupplementComponent,
  LinkOitComponent, SofonFileUploadComponent, SelectNmpaComponent,
} from './components'

export const PAGES = [PrebookFormComponent, PrebookDetailComponent]
export const COMPONENTS = [
  BasicInfoComponent, SelectDealFormComponent, ProductInfoComponent,
  ZpmApprovalComponent, OaApprovalComponent, OaSupplementComponent,
  LinkOitComponent, SofonFileUploadComponent, SelectNmpaComponent,
]