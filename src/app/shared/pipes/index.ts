import { NumberThousandthPipe } from './number-thousandth.pipe';
import { PricePermissionsPipe } from './price-permissions.pipe';
import { ProceessAuthorPipe } from './proceess-author.pipe';
import { ProcessBtnPipe } from './process-btns.pipe';
import { ProcessModelPipe } from './process-model.pipe';
import { ProcessStatusPipe } from './process-status.pipe';
import { ProcessTaskStatusPipe } from './process-task-status.pipe';
import { ProcessThirdPipe } from './process-third.pipe';
import { TimeFormatMsPipe } from './time-format-ms.pipe';
import { TimeFormatePipeNowPipe } from './time-formate-now.pipe';
import { TimeFormatPipe } from './time-format.pipe';
import { StatusProject } from './status-project.pipe'
import { TaskNamePipe } from './task-name.pipe';
import { BusinessModelPipe } from './business-model.pipe'
import { PriceAuthorityPipe } from './price-Authority.pipe';
import { FileAuthorityPipe } from './file-Authority.pipe';
import { EllipsisPipe } from './ellipsis.pipe';

export * from './number-thousandth.pipe';
export * from './price-permissions.pipe';
export * from './price-Authority.pipe';
export * from './file-Authority.pipe';
export * from './proceess-author.pipe';
export * from './process-btns.pipe';
export * from './process-model.pipe';
export * from './process-status.pipe';
export * from './process-third.pipe';
export * from './time-format-ms.pipe';
export * from './time-formate-now.pipe';
export * from './time-format.pipe';
export * from './status-project.pipe'
export * from './task-name.pipe'
export * from './business-model.pipe'
export * from './ellipsis.pipe';

export const PIPES = [
  FileAuthorityPipe,
  PriceAuthorityPipe,
  NumberThousandthPipe,
  PricePermissionsPipe,
  ProceessAuthorPipe,
  ProcessBtnPipe,
  ProcessModelPipe,
  ProcessStatusPipe,
  ProcessThirdPipe,
  TimeFormatMsPipe,
  TimeFormatePipeNowPipe,
  TimeFormatPipe,
  StatusProject,
  ProcessTaskStatusPipe,
  TaskNamePipe,
  BusinessModelPipe,
  EllipsisPipe,
];
