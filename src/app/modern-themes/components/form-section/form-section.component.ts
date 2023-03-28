import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "app-form-section",
  templateUrl: "./form-section.component.html",
  styleUrls: ["./form-section.component.scss"],
})
export class FormSectionComponent implements OnInit {
  constructor(private ref: ChangeDetectorRef) {}
  @Input("form")
  form?: FormGroup;
  @Input("title")
  title: String;
  @ViewChild("content")
  contentDOM: ElementRef;
  @ViewChild("contentInner")
  contentInnerDOM: ElementRef;
  @Input("dynamic")
  isDynamic: boolean = false;
  hasError: boolean = false;
  @Input("isFold")
  isDefaultFold: boolean = false;
  isFold: boolean = false;
  @Input("disabled")
  disabled: boolean = false;
  originalMaxHeight: string = "unset";
  originalMaxHeightNumber: number = 0;
  maxHeight: string = "unset";

  observer: MutationObserver;
  timer: any;
  ngOnInit() {
    this.bindFormValidateEvent();
  }
  toggle() {
    this.isFold = !this.isFold;
    if (this.isFold) {
      this.maxHeight = "0px";
    } else {
      this.maxHeight = this.originalMaxHeight;
    }
    this.ref.markForCheck();
    this.ref.detectChanges();
  }
  public error() {
    this.hasError = true;
  }
  public clearError() {
    this.hasError = false;
  }

  ngAfterContentChecked() {
    let height = this.contentInnerDOM.nativeElement.clientHeight;
    if (
      (height &&
        this.originalMaxHeightNumber === 0 &&
        this.originalMaxHeight === "unset") ||
      height > this.originalMaxHeightNumber
    ) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.setMaxHeight(height);
        if (this.isDynamic) {
          this.initDynamicNodeCheck();
        }
        if (this.isDefaultFold) {
          this.contentInnerDOM.nativeElement.style.height = "0px";
          this.toggle();
          this.contentInnerDOM.nativeElement.style.height = null;
        }
      }, 0);
    }
  }
  setMaxHeight(height) {
    height = height + 2 * 24; //Margin
    this.originalMaxHeightNumber = height;
    this.originalMaxHeight = height + "px";
    this.maxHeight = height + "px";
  }
  initDynamicNodeCheck() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = new MutationObserver((mutations) => {
      let height = this.contentInnerDOM.nativeElement.clientHeight;
      this.setMaxHeight(height);
    });
    this.observer.observe(this.contentInnerDOM.nativeElement, {
      childList: true,
      subtree: false,
    });
  }
  bindFormValidateEvent() {
    if (this.form) {
      this.form.statusChanges.subscribe(() => {
        if (this.form.status === "INVALID") {
          this.error();
        } else {
          this.clearError();
        }
      });
    }
  }
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
