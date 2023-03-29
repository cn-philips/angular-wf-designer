import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-system-settings",
  templateUrl: "./system-settings.component.html",
  styleUrls: ["./system-settings.component.scss"],
})
export class SystemSettingsComponent implements OnInit {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang("zh-CN");
    this.translate.use("zh-CN");
  }
  locals = [
    { label: "简体中文", value: "zh-CN" },
    { label: "English", value: "en-US" },
  ];
  public currentLanguage: string = "zh-CN";
  public currentUIMode: string = "_modern_mode";
  UI = [
    {
      label: "Modern",
      value: "_modern_mode",
    },
    {
      label: "Classical",
      value: "_classical_mode",
    },
  ];
  ngOnInit() {
    try {
      this.changeLanguage(this.getCurrentLanguage());
    } catch (e) {
      this.clearLanguage();
      this.changeLanguage(this.getCurrentLanguage());
    }
    this.currentUIMode = this.getCurrentUIStyle()
    this.doChangeUIStyle();
  }
  getCurrentLanguage() {
    let locals = localStorage.getItem("locals");
    if (!locals) {
      locals = "zh-CN";
      this.currentLanguage = locals;
      localStorage.setItem("locals", locals);
    }
    return locals;
  }
  doChangeLanguage() {
    this.changeLanguage(this.currentLanguage);
  }
  changeLanguage(locals) {
    // this.translate.setDefaultLang(language);
    this.translate.use(locals);
    this.currentLanguage = locals;
    localStorage.setItem("locals", locals);
  }
  clearLanguage() {
    localStorage.removeItem("locals");
    // localStorage.removeItem("system_style");
  }
  doChangeUIStyle() {
    this.changeUI(this.currentUIMode);
  }
  changeUI(type) {
    let bodyDOM = document.querySelector("body.app");
    bodyDOM.classList.remove("_modern_mode");
    bodyDOM.classList.remove("_classical_mode");
    bodyDOM.classList.add(type);
    localStorage.setItem("system_style", type);
  }
  getCurrentUIStyle() {
    let type = localStorage.getItem("system_style");
    if (!type) {
      type = "_modern_mode";
      this.currentUIMode = type;
      localStorage.setItem("system_style", type);
    }
    return type;
  }
}
