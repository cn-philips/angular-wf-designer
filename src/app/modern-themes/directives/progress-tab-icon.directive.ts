import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[pTabIcon]'
})
export class ProgressTabIconDirective {
  constructor(public templateRef:TemplateRef<any>) { }

}
