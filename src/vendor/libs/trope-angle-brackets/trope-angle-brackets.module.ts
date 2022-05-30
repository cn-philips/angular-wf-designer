import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HoverDropdownDirective} from '../hover-dropdown/hover-dropdown.directive';
import {TropeAngleBracketsDirective} from './trope-angle-brackets.directive';

@NgModule({
  declarations: [TropeAngleBracketsDirective],
  exports: [TropeAngleBracketsDirective],
  imports: [
    CommonModule
  ]
})
export class TropeAngleBracketsModule { }
