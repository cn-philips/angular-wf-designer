import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[pTabTitle]'
})
export class ProgressTabTitleDirective {
  constructor(public templateRef:TemplateRef<any>) { }
}
