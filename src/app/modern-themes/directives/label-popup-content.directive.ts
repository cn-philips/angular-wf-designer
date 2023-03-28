import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "ng-template[labelPopupContent]",
})
export class LabelPopupContentDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
