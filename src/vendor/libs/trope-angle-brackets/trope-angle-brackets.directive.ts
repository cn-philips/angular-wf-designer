import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[trope-angle-brackets]'
})
export class TropeAngleBracketsDirective {

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    let html = this.el.nativeElement.querySelector('span').outerHTML;
    html = html.replace(/&lt;/g, "<");
    html = html.replace(/&gt;/g, ">");
    this.el.nativeElement.querySelector('span').innerHTML = html;
  }

}
