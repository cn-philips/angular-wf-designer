import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../layout.service';

@Component({
  selector: "app-layout-basic",
  templateUrl: "./layout-basic.component.html",
  styleUrls: ["./layout-basic.scss"],
})
export class LayoutBasicComponent implements AfterViewInit, OnDestroy {
  // Prevent "blink" effect
  public initialized = false;

  constructor(public layoutService: LayoutService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initialized = true;

      this.layoutService.init();
      this.layoutService.update();
      this.layoutService.setAutoUpdate(true);
    });
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.layoutService.destroy();
    });
  }

  closeSidenav() {
    setTimeout(() => {
      this.layoutService.setCollapsed(true);
    });
  }
}
