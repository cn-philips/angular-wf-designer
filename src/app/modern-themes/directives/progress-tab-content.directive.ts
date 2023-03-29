import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[pTabContent]'
})
export class ProgressTabContentDirective {
  constructor(public templateRef:TemplateRef<any>) { }

}
