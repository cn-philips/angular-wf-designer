import { FormGroup, ValidationErrors } from "@angular/forms"

export const logisticTermsDescValidator = (control: FormGroup): ValidationErrors | null => {
  const { logisticTerms, logisticTermsDesc } = control.getRawValue()
  if (logisticTerms !== 'WLTKSMBZ' && logisticTermsDesc === '收到信用证/货款90天内装运') {
    return { logisticTermsDescError: true }
  } else {
    return null
  }
}

// 非直投时会校验经销商DDP状态, 状态为通过时才能提交
export const dealerDdpStatusValidator = (control: FormGroup): ValidationErrors | null => {
  const { distributorDdpStatus } = control.getRawValue()
  if (distributorDdpStatus && distributorDdpStatus !== '通过') {
    return { ddpStatusError: true }
  } else {
    return null
  }
}

// 非直投时会校验投标公司DDP状态, 状态不是未通过时才能提交
export const bidderDdpStatusValidator = (control: FormGroup): ValidationErrors | null => {
  const { bidderDdpStatus } = control.getRawValue()
  if (bidderDdpStatus === '未通过') {
    return { ddpStatusError: true }
  } else {
    return null
  }
}

export const segmentValidator = (control: FormGroup): ValidationErrors | null => {
  const { customerType, customerCategory } = control.getRawValue()
  if ((customerType === '公立医院' || customerType === '民营医院') && !customerCategory) {
    return {
      segmentError: true
    }
  }
  return null
}

export const EXCLUDE_REFERENCE_NO = [
  '2022Primary BusinessWestS-2290', '2022North2North2B-2376', '2022North1North1B-2356',
  '2022RadOncSouthS-2452', '2022East1East1S-2115', '2023PrivateWestB-9',
  '2023CT VADWestS-42', '2023NBNB-North&West2B-62', '2023WestWestB-355',
  '2023East2East2S-576', '2023East2East2S-694', '2023North2North2B-720',
  '2023PrivateWestS-730', '2023East2East2S-726', '2023SouthSouthS-819',
  '2023PrivateWestB-821', '2023RadOncPrivateS-834', '2023East1East1S-835',
  '2023East2East2B-848', '2023US-PublicWestB-846', '2023PrivateWestB-772',
  '2023East2East2S-524', '2023East2East2B-506', '2023East2East2S-509',
  '2023East2East2S-507', '2023PrivateEastB-887', '2023PrivateNorthB-896',
]