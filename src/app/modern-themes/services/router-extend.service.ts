import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { environment } from "@env";

@Injectable({
  providedIn: "root",
})
export class RouterExtendService {
  constructor(private router: Router,private location:Location) {}
  base_href = environment.base_href;
  public navigateWithNewWindow(commands: any[], extras?: NavigationExtras) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(commands, extras)
    );
    let fullUrl = (this.base_href + "/#").replace(/\/\//g, "/");
    fullUrl += url;
    window.open(fullUrl);
  }
  public back() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(["/home"]);
    }
  }
}
