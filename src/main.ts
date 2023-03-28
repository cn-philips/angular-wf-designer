import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

import { registerLocaleData } from "@angular/common";
import zh from "@angular/common/locales/zh";
import { hmrBootstrap } from "./hmr";

// add system version log
const { version } = require('../package.json')
console.log(`%c ==========system version: v${version}==========`, 'color:red;font-size:24px;font-weight:bold');

registerLocaleData(zh);

const options = {
  preserveWhitespaces: false,
};

const bootstrap = () => {
  let prom = platformBrowserDynamic().bootstrapModule(AppModule, options);
  prom.catch((err) => console.log(err));
  return prom;
};
if (environment.enableProdMode) {
  enableProdMode();
}
if (environment.isProduction) {
  bootstrap();
} else {
  options.preserveWhitespaces = true;
  if (environment.hmr) {
    // tslint:disable-next-line:no-string-literal
    if (module["hot"]) {
      hmrBootstrap(module, bootstrap);
    } else {
      console.log("Amm..HMR is not enabled for webpack");
    }
  } else {
    bootstrap();
  }
}
