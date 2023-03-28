import {
  AgentshowComponent,
  AppTermsComponent,
  ApplyBaseComponent,
  BiddingInfoComponent,
  EmpEmpComponent,
  EmpEmpAppComponent,
  LoadingComponent,
  NewProductComponent,
  PdfPreviewComponent,
  VerMessComponent,
  ReviewComponent,
  SupplementComponent,
} from './components'

export * from './components'


import { ApplyTenderComponent } from './apply-tender'
import { ApplyTenderModifComponent } from './apply-tender-modif'
import { BidComponent, BidCkComponent, BidIndexComponent } from './bid'
import { EmpComponent } from './emp'
import { SupportFileUpComponent } from './support-file-up'
import { TenderReviewComponent } from './tender-review'
import { TenderReviewSaleComponent } from './tender-review-sale'
import { WinningBidComponent, WinningConfirmComponent } from './winning-bid'

export * from './apply-tender'
export * from './apply-tender-modif'
export * from './bid'
export * from './emp'
export * from './support-file-up'
export * from './tender-review'
export * from './tender-review-sale'
export * from './winning-bid'


export const COMPONENTS = [
  AgentshowComponent,
  AppTermsComponent,
  ApplyBaseComponent,
  BiddingInfoComponent,
  EmpEmpComponent,
  EmpEmpAppComponent,
  LoadingComponent,
  NewProductComponent,
  PdfPreviewComponent,
  VerMessComponent,
  ReviewComponent,
  SupplementComponent,
  BidCkComponent, BidIndexComponent,
  WinningConfirmComponent
]

// 路由组件
export const PAGES = [
  ApplyTenderComponent,
  ApplyTenderModifComponent,
  BidComponent,
  EmpComponent,
  SupportFileUpComponent,
  TenderReviewComponent,
  TenderReviewSaleComponent,
  WinningBidComponent
]