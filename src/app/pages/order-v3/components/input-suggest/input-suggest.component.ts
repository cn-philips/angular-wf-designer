import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "input-suggest",
  templateUrl: "./input-suggest.component.html",
  styleUrls: ["./input-suggest.component.scss"],
})
export class InputSuggestComponent implements OnInit {
  constructor() {}
  @Input() placeholder: string = "";
  @Input() ngModel: string = "";
  @Input() suggestions: any = [];
  @Input() disabled: boolean = false;
  @Output() ngModelChange = new EventEmitter<string>();
  @Input() key: string = "dealerBestSignAccount";
  @Input() formatFn: any = (item: any) => item;
  showSuggest: any = false;
  suggestionList: any = [];

  ngOnInit(): void {}

  onFocus() {
    this.showSuggest = true;
    this.filterSuggest(this.ngModel);
  }

  onBlur() {
    setTimeout(() => {
      this.showSuggest = false;
    }, 200);
  }
  onChange(value: any) {
    this.ngModel = value;
    this.debounce(this.ngModelChange.emit(value), 1500);
    this.debounce(this.filterSuggest(value), 500);
  }

  filterSuggest(value: any) {
    if (value) {
      let list = [];
      let lastValue = value.trim();
      let suggestions = this.suggestions;
      for (let i = 0; i < suggestions.length; i++) {
        const el = suggestions[i];
        if (el[this.key].indexOf(lastValue) > -1) {
          list.push(el);
        }
      }
      this.suggestionList = list;
    } else {
      this.suggestionList = this.suggestions;
    }
  }

  chooseAccount(account: any) {
    this.ngModel = account;
    this.ngModelChange.emit(account);
  }

  debounce(fn: any, ms = 500) {
    let timeoutId: any;
    return function (...args: any) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, ms);
    };
  }

  // const Antishake = (fn, ms = 500) => {
  //   let timeIp = null;
  //   return function (e) {
  //     clearTimeout(timeIp);
  //     timeIp = setTimeout(() => {
  //       fn(e);
  //     }, ms);
  //   };
  // };
}
